import { ApiProperty } from '@nestjs/swagger';
import { DayOfWeek, DriverStatus, OverrideType } from '@prisma/client';

export class DriverWeeklyScheduleDto {
  @ApiProperty({
    description: 'Day of the week',
    enum: DayOfWeek,
    example: 'MONDAY',
  })
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
    description: 'Starting date of the shift',
    example: '2024-01-01T17:30:00.000Z',
  })
  startDate: string;

  @ApiProperty({
    description: 'Ending date of the shift',
    example: '2024-01-01T17:30:00.000Z',
  })
  endDate: string;
}

export class DriverMonthlyOverrideDto {
  @ApiProperty({ description: 'Date of the override', example: '2024-01-01' })
  date: string;

  @ApiProperty({
    description: 'Type of override',
    enum: OverrideType,
    example: 'SICK_LEAVE',
  })
  overrideType: OverrideType;

  @ApiProperty({
    description: 'Start time for the custom shift (optional)',
    example: '2024-01-01T09:15:00.000Z',
    required: false,
  })
  startTime?: string;

  @ApiProperty({
    description: 'End time for the custom shift (optional)',
    example: '2024-01-01T17:30:00.000Z',
    required: false,
  })
  endTime?: string;
}

export class DriversResponseDto {
  @ApiProperty({ description: 'Driver ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Driver name', example: 'John Doe' })
  name: string;

  @ApiProperty({ description: 'Driver phone number', example: '+1234567890' })
  phone: string;

  @ApiProperty({
    description: 'Driver email (optional)',
    example: 'john.doe@example.com',
    required: false,
  })
  email?: string;

  @ApiProperty({
    description: 'Driver status',
    enum: DriverStatus,
    example: 'AVAILABLE',
  })
  status: DriverStatus;

  @ApiProperty({
    description: 'Driver national ID (optional)',
    example: '123456789',
    required: false,
  })
  nationalId?: string;

  @ApiProperty({
    description: 'Driver passport number (optional)',
    example: 'A12345678',
    required: false,
  })
  passportNumber?: string;

  @ApiProperty({
    description: 'Driver labor card (optional)',
    example: 'LC123456',
    required: false,
  })
  laborCard?: string;

  @ApiProperty({
    description: 'Driver medical insurance (optional)',
    example: 'MI123456',
    required: false,
  })
  medicalInsurance?: string;

  @ApiProperty({
    description: 'Driver UAE visa (optional)',
    example: 'V123456',
    required: false,
  })
  uaeVisa?: string;

  @ApiProperty({
    description: 'Driver national ID expiry (optional)',
    example: '2024-12-31T00:00:00.000Z',
    required: false,
  })
  nationalIdExpiry?: string;

  @ApiProperty({
    description: 'Driver passport expiry (optional)',
    example: '2025-01-01T00:00:00.000Z',
    required: false,
  })
  passportExpiry?: string;

  @ApiProperty({
    description: 'Driver labor card expiry (optional)',
    example: '2024-06-30T00:00:00.000Z',
    required: false,
  })
  laborCardExpiry?: string;

  @ApiProperty({
    description: 'Driver medical insurance expiry (optional)',
    example: '2024-07-31T00:00:00.000Z',
    required: false,
  })
  medicalInsuranceExpiry?: string;

  @ApiProperty({
    description: 'Driver UAE visa expiry (optional)',
    example: '2024-08-31T00:00:00.000Z',
    required: false,
  })
  uaeVisaExpiry?: string;

  @ApiProperty({
    description: 'Date when the driver was created',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Date when the driver was last updated',
    example: '2024-01-02T00:00:00.000Z',
  })
  updatedAt: string;

  @ApiProperty({
    description: 'Google API auth link (optional)',
    example: 'https://accounts.google.com/o/oauth2/auth?client_id=...',
    required: false,
  })
  googleAuthLink?: string;

  @ApiProperty({
    description: 'Driver connection status',
    enum: ['INITIATED', 'CONNECTED', 'NOT_CONNECTED'],
    example: 'CONNECTED',
  })
  connectionStatus?: string;
}
