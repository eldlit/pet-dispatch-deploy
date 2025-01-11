import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ResponseRideDto } from '../model/response.order.dto';
import { CreateRideDto } from '../model/create.order.dto';
import { Prisma } from '@prisma/client';
import { UpdateRideDto } from '../model/update.order.dto';
import { calendar_v3 } from 'googleapis';
import { GoogleCalendarService } from '../../google/service/google.calendar.service';

@Injectable()
export class RidesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly googleCalendarService: GoogleCalendarService,
  ) {}

  async getAllRides(
    page: number,
    limit: number,
  ): Promise<{ rides: ResponseRideDto[]; totalPages: number }> {
    const totalCount = await this.prisma.ride.count();
    const totalPages = Math.ceil(totalCount / limit);

    const rides = await this.prisma.ride.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: {
        customer: true,
        driver: true,
      },
    });

    const mappedRides: ResponseRideDto[] = rides.map((ride) => ({
      id: ride.id,
      customerId: ride.customerId,
      driverId: ride.driverId,
      customerName: ride.customer.name ?? null,
      petName: ride.petName,
      breed: ride.breed,
      pickupLocation: ride.pickupLocation,
      dropoffLocation: ride.dropoffLocation,
      specialNotes: ride.specialNotes,
      isVaccinationAttached: !!ride.uploadedFile,
      accompanied: ride.accompanied,
      rideType: ride.rideType,
      paymentMethod: ride.paymentMethod,
      status: ride.status,
      scheduledTime: ride.scheduledTime.toISOString(),
      price: ride.price ? ride.price.toFixed(2) : null,
      rideDistance: ride.rideDistance ? ride.rideDistance.toString() : null,
      rideEndTime: ride.rideEndTime ? ride.rideEndTime.toISOString() : null,
    }));

    return {
      rides: mappedRides,
      totalPages,
    };
  }

  async createRide(
    dto: CreateRideDto,
    fileBuffer: Buffer | null,
  ): Promise<ResponseRideDto> {
    const Ride = await this.prisma.ride.create({
      data: {
        customerId: Number(dto.customerId),
        driverId: dto.driverId,
        petName: dto.petName,
        breed: dto.breed,
        pickupLocation: dto.pickupLocation,
        dropoffLocation: dto.dropoffLocation,
        specialNotes: dto.specialNotes,
        uploadedFile: fileBuffer,
        accompanied: dto.accompanied === 'true',
        rideType: dto.rideType,
        paymentMethod: dto.paymentMethod,
        scheduledTime: new Date(dto.scheduledTime),
        price: dto.price ? new Prisma.Decimal(dto.price) : null,
        status: dto.status ?? undefined,
      },
    });

    return this.mapRideToResponse(Ride);
  }

  async updateRide(
    id: number,
    dto: UpdateRideDto,
    fileBuffer: Buffer | null,
  ): Promise<ResponseRideDto> {
    const ride = await this.prisma.ride.findUnique({
      where: { id },
    });

    if (!ride) {
      throw new BadRequestException('Ride not found');
    }

    const updatedRide = await this.prisma.ride.update({
      where: { id },
      data: {
        ...dto,
        uploadedFile: fileBuffer || undefined,
        updatedAt: new Date(),
      },
    });

    return this.mapRideToResponse(updatedRide);
  }

  private mapRideToResponse(ride: any): ResponseRideDto {
    return {
      id: ride.id,
      customerId: ride.customerId,
      driverId: ride.driverId,
      petName: ride.petName,
      breed: ride.breed,
      pickupLocation: ride.pickupLocation,
      dropoffLocation: ride.dropoffLocation,
      specialNotes: ride.specialNotes,
      vaccinationCopy: ride.vaccinationCopy,
      isVaccinationAttached: !!ride.uploadedFile,
      accompanied: ride.accompanied,
      rideType: ride.rideType,
      paymentMethod: ride.paymentMethod,
      status: ride.status,
      scheduledTime: ride.scheduledTime.toISOString(),
      price: ride.price?.toString() || null,
      rideDistance: ride.rideDistance?.toString() || null,
      rideEndTime: ride.rideEndTime?.toISOString() || null,
    };
  }

  async deleteRide(id: number): Promise<void> {
    const ride = await this.prisma.ride.findUnique({ where: { id } });
    if (!ride) {
      throw new BadRequestException(`Ride with ID ${id} not found`);
    }

    await this.prisma.ride.delete({ where: { id } });
  }

  async getVaccinationFile(rideId: number): Promise<Buffer | null> {
    const ride = await this.prisma.ride.findUnique({
      where: { id: rideId },
      select: {
        uploadedFile: true,
      },
    });

    if (!ride || !ride.uploadedFile) {
      return null;
    }

    return Buffer.from(ride.uploadedFile);
  }

  async assignRide(driverId: number, rideId: number): Promise<void> {
    const ride = await this.prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) {
      throw new BadRequestException(`Ride with ID ${rideId} not found`);
    }

    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
    });
    if (!driver) {
      throw new BadRequestException(`Driver with ID ${driverId} not found`);
    }

    if (driver.status === 'SICK_LEAVE' || driver.status === 'ANNUAL_LEAVE') {
      throw new BadRequestException(
        `Driver with ID ${driverId} is unavailable`,
      );
    }

    await this.prisma.ride.update({
      where: { id: rideId },
      data: { driverId },
    });

    await this.prisma.driver.update({
      where: { id: driverId },
      data: { status: 'ON_RIDE' },
    });

    const event: calendar_v3.Schema$Event = {
      summary: `Ride: ${ride.petName}`,
      description: `Ride Details:\nPickup: ${ride.pickupLocation}\nDropoff: ${ride.dropoffLocation}\nNotes: ${ride.specialNotes}`,
      start: {
        dateTime: new Date(ride.scheduledTime).toISOString(),
      },
      end: {
        dateTime: ride.rideEndTime
          ? new Date(ride.rideEndTime).toISOString()
          : new Date(
              new Date(ride.scheduledTime).getTime() + 60 * 60 * 1000,
            ).toISOString(),
      },
      location: ride.pickupLocation,
      extendedProperties: {
        private: {
          rideId: ride.id.toString(),
          driverId: ride.driverId?.toString() || 'unassigned',
        },
      },
    };
    await this.googleCalendarService.createEvent(driverId, event);
  }

  async unassignRide(driverId: number, rideId: number): Promise<void> {
    const ride = await this.prisma.ride.findUnique({ where: { id: rideId } });

    if (!ride) {
      throw new BadRequestException(`Ride with ID ${rideId} not found`);
    }

    if (ride.driverId !== driverId) {
      throw new BadRequestException(
        `Ride with ID ${rideId} is not assigned to driver with ID ${driverId}`,
      );
    }

    // Update the ride to unassign the driver
    await this.prisma.ride.update({
      where: { id: rideId },
      data: { driverId: null },
    });

    // Fetch the driver's rides
    const driverRides = await this.prisma.ride.findMany({
      where: { driverId },
    });

    // Update driver status if they have no active rides
    if (driverRides.length === 0) {
      await this.prisma.driver.update({
        where: { id: driverId },
        data: { status: 'AVAILABLE' },
      });
    }

    // Cancel the calendar event
    await this.googleCalendarService.cancelCalendarEvent(driverId, rideId);
  }
}
