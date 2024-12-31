import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { google } from 'googleapis';

@Injectable()
export class DispatchService {
  private oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

  constructor(private readonly prisma: PrismaService) {}

  async getDriverAvailability(date: Date): Promise<any[]> {
    const drivers = await this.prisma.driver.findMany({
      include: {
        rider: {
          where: {
            scheduledTime: {
              gte: new Date(date.setHours(0, 0, 0)),
              lt: new Date(date.setHours(23, 59, 59)),
            },
          },
        },
        scheduleOverrides: true,
      },
    });

    return drivers.map((driver) => {
      const now = new Date();
      const currentRide = driver.rider.find(
        (ride) => ride.scheduledTime <= now && ride.rideEndTime >= now,
      );
      const nextRide = driver.rider
        .filter((ride) => ride.scheduledTime > now)
        .sort(
          (a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime(),
        )[0];

      let status = driver.status;

      if (currentRide) {
        status = 'ON_RIDE';
      } else if (
        driver.scheduleOverrides.some(
          (o) =>
            o.date.toISOString().split('T')[0] ===
              date.toISOString().split('T')[0] && o.overrideType !== null,
        )
      ) {
        status = 'SICK_LEAVE';
      }

      return {
        id: driver.id,
        name: driver.name,
        status,
        nextRide: nextRide
          ? {
              pickupLocation: nextRide.pickupLocation,
              dropoffLocation: nextRide.dropoffLocation,
              scheduledTime: nextRide.scheduledTime,
            }
          : null,
      };
    });
  }

  async assignDriverToRide(rideId: number, driverId: number): Promise<void> {
    const ride = await this.prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) throw new BadRequestException('Ride not found.');

    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
    });
    if (!driver) throw new BadRequestException('Driver not found.');

    await this.prisma.$transaction([
      this.prisma.ride.update({ where: { id: rideId }, data: { driverId } }),
      this.prisma.driver.update({
        where: { id: driverId },
        data: { status: 'ON_RIDE' },
      }),
    ]);

    const tokens = await this.prisma.google_api.findUnique({
      where: { driverId },
    });
    if (tokens) {
      this.oauth2Client.setCredentials({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });

      const calendar = google.calendar({
        version: 'v3',
        auth: this.oauth2Client,
      });
      await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: `Ride: ${ride.pickupLocation} to ${ride.dropoffLocation}`,
          description: `Pet: ${ride.petName}, Notes: ${ride.specialNotes || 'N/A'}`,
          start: { dateTime: ride.scheduledTime.toISOString() },
          end: {
            dateTime:
              ride.rideEndTime?.toISOString() ||
              ride.scheduledTime.toISOString(),
          },
        },
      });
    }
  }
}
