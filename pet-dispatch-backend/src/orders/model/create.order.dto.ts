import { ApiProperty } from "@nestjs/swagger";
import {PaymentMethod, RideType} from "@prisma/client";
import {IsBoolean, IsDateString, IsDecimal, IsEnum, IsInt, IsOptional, IsString} from "class-validator";

export class CreateRideDto {

  @ApiProperty({ description: 'ID of the customer requesting the ride', example: 1 })
  @IsInt()
  customerId: number;

  @ApiProperty({ description: 'ID of the driver assigned to the ride', example: 2, required: false })
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

  @ApiProperty({ description: 'Special notes for the ride', example: 'Handle with care', required: false })
  @IsOptional()
  @IsString()
  specialNotes?: string;

  @ApiProperty({ description: 'Copy of vaccination details', example: 'vaccine r1', required: false })
  @IsOptional()
  @IsString()
  vaccinationCopy?: string;

  @ApiProperty({ description: 'Whether the ride is accompanied by the owner', example: true })
  @IsBoolean()
  accompanied: boolean;

  @ApiProperty({ description: 'Type of ride', enum: RideType, example: RideType.ONE_WAY })
  @IsEnum(RideType)
  rideType: RideType;

  @ApiProperty({ description: 'Payment method', enum: PaymentMethod, example: PaymentMethod.CASH })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'Scheduled time for the ride', example: '2024-01-01T10:00:00.000Z' })
  @IsDateString()
  scheduledTime: string;

  @ApiProperty({ description: 'Price of the ride', example: 100.50, required: false })
  @IsOptional()
  @IsDecimal()
  price?: string;
}