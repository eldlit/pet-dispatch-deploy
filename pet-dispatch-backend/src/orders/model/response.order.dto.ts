import { ApiProperty } from '@nestjs/swagger';
import {PaymentMethod, RideStatus, RideType} from "@prisma/client";

export class ResponseRideDto {
    @ApiProperty({ description: 'Unique identifier for the ride', example: 1 })
    id: number;

    @ApiProperty({ description: 'ID of the customer requesting the ride', example: 1 })
    customerId: number;

    @ApiProperty({ description: 'ID of the driver assigned to the ride', example: 2, required: false })
    driverId?: number;

    @ApiProperty({ description: 'Name of the pet', example: 'Buddy' })
    petName: string;

    @ApiProperty({ description: 'Breed of the pet', example: 'Golden Retriever' })
    breed: string;

    @ApiProperty({ description: 'Pickup location', example: '123 Main Street' })
    pickupLocation: string;

    @ApiProperty({ description: 'Dropoff location', example: '456 Elm Street' })
    dropoffLocation: string;

    @ApiProperty({ description: 'Special notes for the ride', example: 'Handle with care', required: false })
    specialNotes?: string;

    @ApiProperty({ description: 'Copy of vaccination details', example: 'vaccide vr1', required: false })
    vaccinationCopy?: string;

    @ApiProperty({ description: 'Whether the ride is accompanied by the owner', example: true })
    accompanied: boolean;

    @ApiProperty({ description: 'Type of ride', enum: RideType, example: RideType.ONE_WAY })
    rideType: RideType;

    @ApiProperty({ description: 'Payment method', enum: PaymentMethod, example: PaymentMethod.CASH })
    paymentMethod: PaymentMethod;

    @ApiProperty({ description: 'Current status of the ride', enum: RideStatus, example: RideStatus.INCOMPLETE })
    status: RideStatus;

    @ApiProperty({ description: 'Scheduled time for the ride', example: '2024-01-01T10:00:00.000Z' })
    scheduledTime: string;

    @ApiProperty({ description: 'Price of the ride', example: 100.50, required: false })
    price?: string;

}
