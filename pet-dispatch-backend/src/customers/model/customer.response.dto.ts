import { ApiProperty } from '@nestjs/swagger';

export class CustomerResponseDto {
  @ApiProperty({ description: 'Customer ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Customer name', example: 'John Doe' })
  name: string;

  @ApiProperty({ description: 'Customer phone number', example: '+1234567890' })
  phone: string;

  @ApiProperty({
    description: 'Customer email address (optional)',
    example: 'john.doe@example.com',
    required: false,
  })
  email?: string;

  @ApiProperty({ description: 'Customer status', example: 'Active' })
  status: string;

  @ApiProperty({
    description: 'Customer creation timestamp',
    example: '2024-12-27T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Customer last update timestamp',
    example: '2024-12-27T12:00:00.000Z',
  })
  updatedAt: Date;
}
