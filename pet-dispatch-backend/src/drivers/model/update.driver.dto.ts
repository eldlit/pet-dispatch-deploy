import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
  IsArray,
  IsEmail,
  Length,
} from 'class-validator';
import { DriverStatus, DayOfWeek, OverrideType } from '@prisma/client';

export class UpdateDriverDto {
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
