import { ApiProperty } from '@nestjs/swagger';
import { RideStatus, PaymentMethod, RideType } from '@prisma/client';
import {
  IsDateString,
  IsDecimal,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRideDto {
  @ApiProperty({
    description: 'ID of the customer requesting the ride',
    example: '1',
  })
  @IsString()
  customerId: string;

  @ApiProperty({
    description: 'ID of the driver assigned to the ride',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsInt()
  driverId?: number;

  @ApiProperty({ description: 'Name of the pet', example: 'Buddy' })
  @IsString()
  petName: string;

  @ApiProperty({ description: 'Breed of the pet', example: 'Golden Retriever' })
  @IsString()
  breed: string;

  @ApiProperty({ description: 'Pickup location', example: '123 Main Street' })
  @IsString()
  pickupLocation: string;

  @ApiProperty({ description: 'Dropoff location', example: '456 Elm Street' })
  @IsString()
  dropoffLocation: string;

  @ApiProperty({
    description: 'Special notes for the ride',
    example: 'Handle with care',
    required: false,
  })
  @IsOptional()
  @IsString()
  specialNotes?: string;

  @ApiProperty({
    description: 'Whether the ride is accompanied by the owner',
    example: 'true',
  })
  @IsString()
  accompanied: string;

  @ApiProperty({
    description: 'Type of ride',
    enum: RideType,
    example: RideType.ONE_WAY,
  })
  @IsEnum(RideType)
  rideType: RideType;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.CASH,
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Scheduled time for the ride',
    example: '2024-01-01T10:00:00.000Z',
  })
  @IsDateString()
  scheduledTime: string;

  @ApiProperty({
    description: 'Price of the ride',
    example: 100.5,
    required: false,
  })
  @IsOptional()
  @IsDecimal()
  price?: string;

  @ApiProperty({
    description: 'Initial status of the ride',
    enum: RideStatus,
    example: RideStatus.INCOMPLETE,
    required: false,
  })
  @IsOptional()
  @IsEnum(RideStatus)
  status?: RideStatus;
}
