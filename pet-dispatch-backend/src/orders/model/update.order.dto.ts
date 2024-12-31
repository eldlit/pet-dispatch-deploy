import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsDecimal,
  IsISO8601,
} from 'class-validator';
import { RideType, RideStatus, PaymentMethod } from '@prisma/client';

export class UpdateRideDto {
  @ApiProperty({ example: 1, description: 'Customer ID' })
  @IsInt()
  @IsOptional()
  customerId?: number;

  @ApiProperty({ example: 'Buddy', description: 'Pet name' })
  @IsString()
  @IsOptional()
  petName?: string;

  @ApiProperty({ example: 'Golden Retriever', description: 'Breed' })
  @IsString()
  @IsOptional()
  breed?: string;

  @ApiProperty({ example: '123 Main St', description: 'Pickup location' })
  @IsString()
  @IsOptional()
  pickupLocation?: string;

  @ApiProperty({ example: '456 Elm St', description: 'Dropoff location' })
  @IsString()
  @IsOptional()
  dropoffLocation?: string;

  @ApiProperty({
    example: 'Special instructions',
    description: 'Special notes',
  })
  @IsString()
  @IsOptional()
  specialNotes?: string;

  @ApiProperty({ example: 12.5, description: 'Ride distance in km' })
  @IsDecimal()
  @IsOptional()
  rideDistance?: number;

  @ApiProperty({
    example: '2025-01-05T15:30:00Z',
    description: 'Ride end time',
  })
  @IsISO8601()
  @IsOptional()
  rideEndTime?: string;

  @ApiProperty({ enum: RideType, example: 'ONE_WAY', description: 'Ride type' })
  @IsEnum(RideType)
  @IsOptional()
  rideType?: RideType;

  @ApiProperty({
    enum: PaymentMethod,
    example: 'CASH',
    description: 'Payment method',
  })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @ApiProperty({ enum: RideStatus, example: 'COMPLETE', description: 'Status' })
  @IsEnum(RideStatus)
  @IsOptional()
  status?: RideStatus;

  @ApiProperty({
    example: '2025-01-05T15:30:00Z',
    description: 'Scheduled time in ISO format',
  })
  @IsISO8601()
  @IsOptional()
  scheduledTime?: string;

  @ApiProperty({ example: '29.99', description: 'Price in USD' })
  @IsDecimal()
  @IsOptional()
  price?: number;
}
