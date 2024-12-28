import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsISO8601,
  IsArray,
  Length,
  IsEmail, IsObject,
} from 'class-validator';
import { DayOfWeek, OverrideType, DriverStatus } from '@prisma/client';


export class CreateWeeklyScheduleDtoInput {
  @IsOptional()
  weeklySchedule: CreateWeeklyScheduleDto[];
}

export class CreateWeeklyScheduleDto {

  @ApiProperty({ description: 'Day of the week', enum: DayOfWeek })
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @ApiProperty({
    description: 'Start time of the shift',
    example: '2024-01-01T09:15:00.000Z',
  })
  startTime: string;

  @ApiProperty({
    description: 'End time of the shift',
    example: '2024-01-01T17:30:00.000Z',
  })
  endTime: string;

  @ApiProperty({
    description: 'Start date for the schedule week',
    example: '2024-01-01T17:30:00.000Z',
  })
  startDate: string;

  @ApiProperty({
    description: 'End date for the schedule week',
    example: '2024-01-01T17:30:00.000Z',
  })
  endDate: string;

}

export class CreateMonthlyOverrideDto {
  @ApiProperty({
    description: 'Date of the override',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsISO8601()
  date: string;

  @ApiProperty({ description: 'Type of override', enum: OverrideType })
  @IsEnum(OverrideType)
  overrideType: OverrideType;

  @ApiProperty({
    description: 'Start time for the custom shift (optional)',
    example: '2024-01-01T09:15:00.000Z',
    required: false,
  })
  @IsISO8601()
  @IsOptional()
  startTime?: string;

  @ApiProperty({
    description: 'End time for the custom shift (optional)',
    example: '2024-01-01T17:30:00.000Z',
    required: false,
  })
  @IsISO8601()
  @IsOptional()
  endTime?: string;
}

export class CreateDriverDto {
  @ApiProperty({
    description: 'Driver name',
    example: 'John Doe',
    required: false,
  })
  @IsString()
  @Length(2, 50)
  name: string;

  @ApiProperty({
    description: 'Driver phone number',
    example: '+1234567890',
    required: false,
  })
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'Driver email (optional)',
    example: 'john.doe@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Driver status',
    enum: DriverStatus,
    example: 'AVAILABLE',
    required: false,
  })
  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;

  @ApiProperty({
    description: 'Driver national ID (optional)',
    example: '123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  nationalId?: string;

  @ApiProperty({
    description: 'Driver passport number (optional)',
    example: 'A12345678',
    required: false,
  })
  @IsOptional()
  @IsString()
  passportNumber?: string;

  @ApiProperty({
    description: 'Driver labor card (optional)',
    example: 'LC123456',
    required: false,
  })
  @IsOptional()
  @IsString()
  laborCard?: string;

  @ApiProperty({
    description: 'Driver medical insurance (optional)',
    example: 'MI123456',
    required: false,
  })
  @IsOptional()
  @IsString()
  medicalInsurance?: string;

  @ApiProperty({
    description: 'Driver UAE visa (optional)',
    example: 'V123456',
    required: false,
  })
  @IsOptional()
  @IsString()
  uaeVisa?: string;

  @ApiProperty({
    description: 'Driver national ID expiry (optional)',
    example: '2024-12-31T00:00:00Z',
    required: false,
  })
  @IsOptional()
  nationalIdExpiry?: string;

  @ApiProperty({
    description: 'Driver passport expiry (optional)',
    example: '2025-01-01T00:00:00Z',
    required: false,
  })
  @IsOptional()
  passportExpiry?: string;

  @ApiProperty({
    description: 'Driver labor card expiry (optional)',
    example: '2024-06-30T00:00:00Z',
    required: false,
  })
  @IsOptional()
  laborCardExpiry?: string;

  @ApiProperty({
    description: 'Driver medical insurance expiry (optional)',
    example: '2024-07-31T00:00:00Z',
    required: false,
  })
  @IsOptional()
  medicalInsuranceExpiry?: string;

  @ApiProperty({
    description: 'Driver UAE visa expiry (optional)',
    example: '2024-08-31T00:00:00Z',
    required: false,
  })
  @IsOptional()
  uaeVisaExpiry?: string;
}
