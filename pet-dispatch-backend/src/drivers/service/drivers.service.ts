import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  DriverMonthlyOverrideDto,
  DriversResponseDto,

} from '../model/drivers.response.dto';
import {
  CreateDriverDto,
  CreateWeeklyScheduleDto,
} from '../model/create.driver.dto';
import { DayOfWeek, DriverStatus } from '@prisma/client';
import { UpdateDriverDto } from '../model/update.driver.dto';
import { eachDayOfInterval, format } from 'date-fns';

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllDrivers(): Promise<DriversResponseDto[]> {
    const drivers = await this.prisma.driver.findMany({
      include: {
        weeklySchedule: true,
        scheduleOverrides: true,
        google_api: true,
      },
    });

    return drivers.map((driver) => ({
      id: driver.id,
      name: driver.name,
      phone: driver.phone,
      email: driver.email || null,
      status: driver.status,
      nationalId: driver.nationalId || null,
      passportNumber: driver.passportNumber || null,
      laborCard: driver.laborCard || null,
      medicalInsurance: driver.medicalInsurance || null,
      uaeVisa: driver.uaeVisa || null,
      nationalIdExpiry: driver.nationalIdExpiry?.toISOString() || null,
      passportExpiry: driver.passportExpiry?.toISOString() || null,
      laborCardExpiry: driver.laborCardExpiry?.toISOString() || null,
      medicalInsuranceExpiry:
        driver.medicalInsuranceExpiry?.toISOString() || null,
      uaeVisaExpiry: driver.uaeVisaExpiry?.toISOString() || null,
      weeklySchedule: driver.weeklySchedule.map((schedule) => ({
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime.toISOString(),
        endTime: schedule.endTime.toISOString(),
        startDate: schedule.startDate.toISOString(),
        endDate: schedule.endDate.toISOString(),
      })),
      scheduleOverrides: driver.scheduleOverrides.map((override) => ({
        date: override.date.toISOString(),
        overrideType: override.overrideType,
        startTime: override.startTime?.toISOString() || null,
        endTime: override.endTime?.toISOString() || null,
      })),
      createdAt: driver.createdAt.toISOString(),
      updatedAt: driver.updatedAt.toISOString(),
      googleAuthLink: driver.google_api[0]?.accessToken || null,
      connectionStatus:
        driver.google_api[0]?.connectionStatus || 'NOT_CONNECTED',
    }));
  }

  async createDriver(
    createDriverDto: CreateDriverDto,
  ): Promise<DriversResponseDto> {
    const {
      name,
      phone,
      email,
      status = DriverStatus.AVAILABLE,
      nationalId,
      passportNumber,
      laborCard,
      medicalInsurance,
      uaeVisa,
      nationalIdExpiry,
      passportExpiry,
      laborCardExpiry,
      medicalInsuranceExpiry,
      uaeVisaExpiry,
    } = createDriverDto;

    const createdDriver = await this.prisma.driver.create({
      data: {
        name,
        phone,
        email,
        status,
        nationalId,
        passportNumber,
        laborCard,
        medicalInsurance,
        uaeVisa,
        nationalIdExpiry: nationalIdExpiry ? new Date(nationalIdExpiry) : null,
        passportExpiry: passportExpiry ? new Date(passportExpiry) : null,
        laborCardExpiry: laborCardExpiry ? new Date(laborCardExpiry) : null,
        medicalInsuranceExpiry: medicalInsuranceExpiry
          ? new Date(medicalInsuranceExpiry)
          : null,
        uaeVisaExpiry: uaeVisaExpiry ? new Date(uaeVisaExpiry) : null,
      },
    });

    return {
      id: createdDriver.id,
      name: createdDriver.name,
      phone: createdDriver.phone,
      email: createdDriver.email || null,
      status: createdDriver.status,
      nationalId: createdDriver.nationalId || null,
      passportNumber: createdDriver.passportNumber || null,
      laborCard: createdDriver.laborCard || null,
      medicalInsurance: createdDriver.medicalInsurance || null,
      uaeVisa: createdDriver.uaeVisa || null,
      nationalIdExpiry: createdDriver.nationalIdExpiry?.toISOString() || null,
      passportExpiry: createdDriver.passportExpiry?.toISOString() || null,
      laborCardExpiry: createdDriver.laborCardExpiry?.toISOString() || null,
      medicalInsuranceExpiry:
        createdDriver.medicalInsuranceExpiry?.toISOString() || null,
      uaeVisaExpiry: createdDriver.uaeVisaExpiry?.toISOString() || null,
      createdAt: createdDriver.createdAt.toISOString(),
      updatedAt: createdDriver.updatedAt.toISOString(),
    };
  }

  async updateDriverDetails(id: number, driverDetailsDto: UpdateDriverDto) {
    const driver = await this.prisma.driver.findUnique({ where: { id } });

    if (!driver) {
      throw new BadRequestException(`Driver with ID ${id} not found`);
    }

    const {
      name,
      phone,
      email,
      nationalId,
      passportNumber,
      laborCard,
      medicalInsurance,
      uaeVisa,
      nationalIdExpiry,
      passportExpiry,
      laborCardExpiry,
      medicalInsuranceExpiry,
      uaeVisaExpiry,
    } = driverDetailsDto;

    console.log(driverDetailsDto);

    return this.prisma.driver.update({
      where: { id },
      data: {
        name: name,
        phone: phone,
        email: email,
        nationalId: nationalId,
        passportNumber: passportNumber,
        laborCard: laborCard,
        medicalInsurance: medicalInsurance,
        uaeVisa: uaeVisa,
        nationalIdExpiry: nationalIdExpiry ? new Date(nationalIdExpiry) : null,
        passportExpiry: passportExpiry ? new Date(passportExpiry) : null,
        laborCardExpiry: laborCardExpiry ? new Date(laborCardExpiry) : null,
        medicalInsuranceExpiry: medicalInsuranceExpiry
          ? new Date(medicalInsuranceExpiry)
          : null,
        uaeVisaExpiry: uaeVisaExpiry ? new Date(uaeVisaExpiry) : null,
      },
    });
  }

  async getWeeklySchedule(driverId: number | string, weekStart: Date) {
    const numericId =
      typeof driverId === 'string' ? parseInt(driverId, 10) : driverId;

    const weekEnd = new Date(weekStart);
    weekStart.setDate(weekStart.getDate() + 1);
    weekEnd.setDate(weekEnd.getDate() + 8);

    weekStart.setUTCHours(0, 0, 0, 0);
    weekEnd.setUTCHours(23, 59, 59, 999);

    console.log('Querying schedule with:', {
      driverId: numericId,
      weekStart,
      weekEnd,
    });

    const schedule = await this.prisma.driver_weekly_schedule.findMany({
      where: {
        driverId: numericId,
        OR: [
          {
            startDate: { gte: weekStart, lte: weekEnd },
          },
          {
            endDate: { gte: weekStart, lte: weekEnd },
          },
          {
            startDate: { lte: weekStart },
            endDate: { gte: weekEnd },
          },
        ],
      },
    });

    return schedule || [];
  }

  async updateDriverWeeklySchedule(
    id: number | string,
    weeklySchedule: CreateWeeklyScheduleDto[],
  ) {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;

    if (isNaN(numericId)) {
      throw new BadRequestException(`Invalid driver ID.`);
    }

    const dayOfWeekMap: Record<string, DayOfWeek> = {
      Monday: 'MONDAY',
      Tuesday: 'TUESDAY',
      Wednesday: 'WEDNESDAY',
      Thursday: 'THURSDAY',
      Friday: 'FRIDAY',
      Saturday: 'SATURDAY',
      Sunday: 'SUNDAY',
    };

    console.log('Extracted weeklySchedule:', weeklySchedule);

    const driver = await this.prisma.driver.findUnique({
      where: { id: numericId },
    });

    if (!driver) {
      throw new BadRequestException(`Driver with ID ${numericId} not found.`);
    }

    // Validate all schedules
    const dates = weeklySchedule.flatMap((schedule) => [
      new Date(schedule.startDate),
      new Date(schedule.endDate),
    ]);

    const weekStart = new Date(
      Math.min(...dates.map((date) => date.getTime())),
    );
    const weekEnd = new Date(Math.max(...dates.map((date) => date.getTime())));

    for (const schedule of weeklySchedule) {
      const startDate = new Date(schedule.startDate);
      const endDate = new Date(schedule.endDate);
      const startTime = new Date(schedule.startTime);
      const endTime = new Date(schedule.endTime);

      if (startTime >= endTime) {
        throw new BadRequestException(
          `Start time must be earlier than end time for ${schedule.dayOfWeek}.`,
        );
      }

      if (startDate < weekStart || endDate > weekEnd) {
        throw new BadRequestException(
          `Schedule for ${schedule.dayOfWeek} must fall within the same week.`,
        );
      }

      const dayOfWeekEnumValue = dayOfWeekMap[schedule.dayOfWeek];
      if (!dayOfWeekEnumValue) {
        throw new BadRequestException(
          `Invalid dayOfWeek: ${schedule.dayOfWeek}`,
        );
      }

      // Check if the schedule already exists
      const existingSchedule =
        await this.prisma.driver_weekly_schedule.findFirst({
          where: {
            driverId: numericId,
            dayOfWeek: dayOfWeekEnumValue,
            startDate: startDate,
            endDate: endDate,
          },
        });

      if (existingSchedule) {
        // Update the existing schedule
        await this.prisma.driver_weekly_schedule.update({
          where: { id: existingSchedule.id },
          data: {
            startTime: startTime,
            endTime: endTime,
          },
        });
      } else {
        // Create a new schedule
        await this.prisma.driver_weekly_schedule.create({
          data: {
            driverId: numericId,
            dayOfWeek: dayOfWeekEnumValue,
            startDate: startDate,
            endDate: endDate,
            startTime: startTime,
            endTime: endTime,
          },
        });
      }
    }

    return {
      message:
        'Driver weekly schedule updated successfully for the specified week.',
    };
  }

  async applyMonthlySchedule(
    id: number | string,
    weeklySchedule: CreateWeeklyScheduleDto[],
    monthStart: Date,
    monthEnd: Date,
  ) {
    const dayOfWeekMap: Record<string, DayOfWeek> = {
      Monday: 'MONDAY',
      Tuesday: 'TUESDAY',
      Wednesday: 'WEDNESDAY',
      Thursday: 'THURSDAY',
      Friday: 'FRIDAY',
      Saturday: 'SATURDAY',
      Sunday: 'SUNDAY',
    };

    const driverId = typeof id === 'string' ? parseInt(id, 10) : id;

    if (isNaN(driverId)) {
      throw new BadRequestException('Invalid driver ID.');
    }

    const startOfMonth = new Date(monthStart);
    const endOfMonth = new Date(monthEnd);

    if (isNaN(startOfMonth.getTime()) || isNaN(endOfMonth.getTime())) {
      throw new BadRequestException('Invalid monthStart or monthEnd date.');
    }

    const allDatesInMonth = eachDayOfInterval({
      start: startOfMonth,
      end: endOfMonth,
    });

    const schedulesToUpsert = allDatesInMonth.flatMap((currentDate) => {
      const dayOfWeek = format(currentDate, 'EEEE'); // Get day name
      const normalizedDayOfWeek = dayOfWeek.toLowerCase();

      const scheduleForDay = weeklySchedule.find(
        (schedule) => schedule.dayOfWeek.toLowerCase() === normalizedDayOfWeek,
      );

      if (!scheduleForDay) {
        return [];
      }

      const startTime = new Date(scheduleForDay.startTime);
      const endTime = new Date(scheduleForDay.endTime);

      if (startTime >= endTime) {
        throw new BadRequestException(
          `Start time must be earlier than end time for ${scheduleForDay.dayOfWeek}.`,
        );
      }

      return {
        driverId,
        dayOfWeek: dayOfWeekMap[scheduleForDay.dayOfWeek],
        startDate: currentDate,
        endDate: currentDate,
        startTime: startTime,
        endTime: endTime,
      };
    });

    console.log('Schedules to Upsert:', schedulesToUpsert);

    const existingSchedules = await this.prisma.driver_weekly_schedule.findMany(
      {
        where: {
          driverId,
          startDate: { gte: startOfMonth, lte: endOfMonth },
        },
      },
    );

    const existingScheduleKeys = new Set(
      existingSchedules.map(
        (s) => `${s.dayOfWeek}-${format(new Date(s.startDate), 'yyyy-MM-dd')}`,
      ),
    );

    console.log('Existing Schedule Keys:', existingScheduleKeys);

    const newSchedules = schedulesToUpsert.filter((s) => {
      const key = `${s.dayOfWeek}-${format(s.startDate, 'yyyy-MM-dd')}`;
      return !existingScheduleKeys.has(key);
    });

    console.log('New Schedules:', newSchedules);

    const updates = schedulesToUpsert.filter((s) => {
      const key = `${s.dayOfWeek}-${format(s.startDate, 'yyyy-MM-dd')}`;
      return existingScheduleKeys.has(key);
    });

    console.log('Updates:', updates);

    const transactionOperations = [];

    if (newSchedules.length > 0) {
      transactionOperations.push(
        this.prisma.driver_weekly_schedule.createMany({
          data: newSchedules,
          skipDuplicates: true,
        }),
      );
    }

    updates.forEach((update) => {
      transactionOperations.push(
        this.prisma.driver_weekly_schedule.updateMany({
          where: {
            driverId: update.driverId,
            dayOfWeek: update.dayOfWeek,
            startDate: update.startDate,
            endDate: update.endDate,
          },
          data: {
            startTime: update.startTime,
            endTime: update.endTime,
          },
        }),
      );
    });

    transactionOperations.forEach((operation) => {
      console.log('Transaction Operation:', operation);
    });

    await this.prisma.$transaction(transactionOperations);

    return { message: 'Driver monthly schedule applied successfully' };
  }

  async deleteDriver(id: number | string): Promise<{ message: string }> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;

    if (isNaN(numericId)) {
      throw new BadRequestException(`Invalid driver ID.`);
    }

    const driver = await this.prisma.driver.findUnique({
      where: { id: numericId },
    });

    if (!driver) {
      throw new BadRequestException(`Driver with ID ${id} not found.`);
    }

    await this.prisma.$transaction(async (prisma) => {
      await prisma.driver_weekly_schedule.deleteMany({
        where: { driverId: numericId },
      });

      await prisma.driver_monthly_override.deleteMany({
        where: { driverId: numericId },
      });

      await prisma.driver.delete({ where: { id: numericId } });
    });

    return { message: 'Driver and related data deleted successfully' };
  }

  async updateDriverScheduleOverrides(
    id: number,
    scheduleOverrides: DriverMonthlyOverrideDto[],
  ) {
    const driver = await this.prisma.driver.findUnique({ where: { id } });

    if (!driver) {
      throw new BadRequestException(`Driver with ID ${id} not found`);
    }

    await this.prisma.driver_monthly_override.deleteMany({
      where: { driverId: id },
    });

    return this.prisma.driver_monthly_override.createMany({
      data: scheduleOverrides.map((override) => ({
        driverId: id,
        date: new Date(override.date),
        overrideType: override.overrideType,
        startTime: override.startTime ? new Date(override.startTime) : null,
        endTime: override.endTime ? new Date(override.endTime) : null,
      })),
    });
  }

  async getDriverById(id: number) {
    return this.prisma.driver.findUnique({
      where: { id },
      include: {
        weeklySchedule: true,
        scheduleOverrides: true,
      },
    });
  }
}
