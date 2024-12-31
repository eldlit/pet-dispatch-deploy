import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { DriversService } from '../service/drivers.service';
import {
  DriverMonthlyOverrideDto,
  DriversResponseDto,
} from '../model/drivers.response.dto';
import {
  CreateDriverDto,
  CreateWeeklyScheduleDtoInput,
} from '../model/create.driver.dto';
import { UpdateDriverDto } from '../model/update.driver.dto';

@ApiTags('drivers')
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all drivers' })
  @ApiResponse({ status: 200, description: 'List of all drivers.' })
  async getAllDrivers() {
    return await this.driversService.getAllDrivers();
  }

  @Get(':id/weekly-schedule')
  @ApiOperation({ summary: 'Retrieve drivers weekly schedule' })
  @ApiResponse({ status: 200, description: 'List of drivers schedule' })
  async getDriverWeeklySchedule(
    @Param('id') driverId: number,
    @Query('weekStart') weekStart: string,
  ) {
    const weekStartDate = new Date(weekStart);
    console.log('requested drivers weekly schedule');

    if (isNaN(weekStartDate.getTime())) {
      throw new BadRequestException('Invalid weekStart date');
    }

    const schedule = await this.driversService.getWeeklySchedule(
      driverId,
      weekStartDate,
    );

    if (!schedule || schedule.length === 0) {
      return {};
    }

    return schedule;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new driver' })
  @ApiResponse({
    status: 201,
    description: 'Driver created successfully.',
    type: DriversResponseDto,
  })
  async createDriver(
    @Body() createDriverDto: CreateDriverDto,
  ): Promise<DriversResponseDto> {
    try {
      const createdDriver =
        await this.driversService.createDriver(createDriverDto);

      return {
        ...createdDriver,
        createdAt: createdDriver.createdAt,
        updatedAt: createdDriver.updatedAt,
        nationalIdExpiry: createdDriver.nationalIdExpiry || null,
        passportExpiry: createdDriver.passportExpiry || null,
        laborCardExpiry: createdDriver.laborCardExpiry || null,
        medicalInsuranceExpiry: createdDriver.medicalInsuranceExpiry || null,
        uaeVisaExpiry: createdDriver.uaeVisaExpiry || null,
      };
    } catch (error) {
      console.error('Error creating driver:', error);
      throw new BadRequestException('Failed to create driver');
    }
  }

  @Put(':id/details')
  @ApiOperation({ summary: 'Update driver details' })
  async updateDriverDetails(
    @Param('id', ParseIntPipe) id: number,
    @Body() driverDetailsDto: UpdateDriverDto,
  ) {
    return await this.driversService.updateDriverDetails(id, driverDetailsDto);
  }

  @ApiOperation({ summary: 'Update driver weekly schedule' })
  @ApiResponse({
    status: 200,
    description: 'Driver weekly schedule updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or driver ID not found.',
  })
  @Put(':id/weekly-schedule')
  async updateDriverWeeklySchedule(
    @Param('id') id: number,
    @Body() weeklySchedule: CreateWeeklyScheduleDtoInput,
  ) {
    return this.driversService.updateDriverWeeklySchedule(
      id,
      weeklySchedule.weeklySchedule,
    );
  }

  @ApiOperation({ summary: 'Apply driver schedule to the whole month' })
  @ApiResponse({
    status: 200,
    description: 'Driver monthly schedule applied successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or driver ID not found.',
  })
  @Put(':id/monthly-schedule')
  async applyMonthlySchedule(
    @Param('id') id: number,
    @Body() monthlySchedule: CreateWeeklyScheduleDtoInput,
    @Query('monthStart') monthStart: string,
    @Query('monthEnd') monthEnd: string,
  ) {
    const startDate = new Date(monthStart);
    const endDate = new Date(monthEnd);
    return this.driversService.applyMonthlySchedule(
      id,
      monthlySchedule.weeklySchedule,
      startDate,
      endDate,
    );
  }

  @ApiOperation({ summary: 'Delete a driver' })
  @ApiResponse({ status: 200, description: 'Driver deleted successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Invalid driver ID or driver not found.',
  })
  @Delete(':id')
  async deleteDriver(@Param('id') id: number) {
    try {
      console.log('delete driver requested');
      return await this.driversService.deleteDriver(id);
    } catch (error) {
      throw new HttpException(
        `Error deleting driver: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':id/schedule-overrides')
  @ApiOperation({ summary: 'Update driver schedule overrides' })
  async updateDriverScheduleOverrides(
    @Param('id', ParseIntPipe) id: number,
    @Body() scheduleOverrides: DriverMonthlyOverrideDto[],
  ) {
    return this.driversService.updateDriverScheduleOverrides(
      id,
      scheduleOverrides,
    );
  }
}
