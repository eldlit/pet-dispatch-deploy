import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateCustomerDto } from './create.customer.dto';
import { CustomerStatus } from '@prisma/client';
import { IsOptional } from 'class-validator';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  @ApiPropertyOptional({
    description: 'Status of the customer',
    enum: CustomerStatus,
    example: 'ACTIVE',
  })
  @IsOptional()
  customerStatus?: CustomerStatus;
}
