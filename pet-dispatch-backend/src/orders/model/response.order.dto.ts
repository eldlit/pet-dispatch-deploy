import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod, RideStatus, RideType } from '@prisma/client';

export class ResponseRideDto {
  @ApiProperty({ description: 'Ride ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Customer ID', example: 1 })
  customerId: number;

  @ApiProperty({ description: 'Customer name', example: 'John Doe' })
  customerName?: string;

  @ApiProperty({ description: 'Driver ID', example: 2, required: false })
  driverId?: number;

  @ApiProperty({ description: 'Pet name', example: 'Buddy' })
  petName: string;

  @ApiProperty({ description: 'Breed', example: 'Golden Retriever' })
  breed: string;

  @ApiProperty({ description: 'Pickup location', example: '123 Main Street' })
  pickupLocation: string;

  @ApiProperty({ description: 'Dropoff location', example: '456 Elm Street' })
  dropoffLocation: string;

  @ApiProperty({ description: 'Special notes', example: 'Handle with care' })
  specialNotes?: string;

  @ApiProperty({ description: 'Vaccination copy', example: 'vaccide vr1' })
  vaccinationCopy?: string;

  @ApiProperty({ description: 'Accompanied by owner', example: true })
  accompanied: boolean;

  @ApiProperty({ description: 'Ride type', enum: RideType, example: 'ONE_WAY' })
  rideType: RideType;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: 'CASH',
  })
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Ride status',
    enum: RideStatus,
    example: 'INCOMPLETE',
  })
  status: RideStatus;

  @ApiProperty({
    description: 'Scheduled time',
    example: '2024-01-01T10:00:00.000Z',
  })
  scheduledTime: string;

  @ApiProperty({
    description: 'Ride end time',
    example: '2024-01-01T11:00:00.000Z',
    required: false,
  })
  rideEndTime?: string;

  @ApiProperty({
    description: 'Ride distance',
    example: '15.5',
    required: false,
  })
  rideDistance?: string;

  @ApiProperty({ description: 'Price', example: '100.5', required: false })
  price?: string;

  @ApiProperty({
    description: 'Is vaccination copy attached',
    example: 'true',
    required: false,
  })
  isVaccinationAttached?: boolean;
}
