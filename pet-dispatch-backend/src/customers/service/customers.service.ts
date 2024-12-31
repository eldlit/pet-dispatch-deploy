import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCustomerDto } from '../model/create.customer.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateCustomerDto } from '../model/update.customer.dto';
import { CustomerResponseDto } from '../model/customer.response.dto';
import { CustomerStatus } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllCustomers(): Promise<CustomerResponseDto[]> {
    const customers = await this.prisma.customer.findMany();
    return customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      status: customer.customerStatus,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    }));
  }

  async createCustomer(createCustomerDto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: createCustomerDto,
    });
  }

  async updateCustomer(id: string, updateCustomerDto: UpdateCustomerDto) {
    const existingCustomer = await this.prisma.customer.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingCustomer) {
      throw new Error(`Customer with id ${id} not found`);
    }

    const { customerStatus, ...rest } = updateCustomerDto;

    return this.prisma.customer.update({
      where: {
        id: Number(id),
      },
      data: {
        ...rest,
        customerStatus: customerStatus
          ? CustomerStatus[
              customerStatus.toUpperCase() as keyof typeof CustomerStatus
            ]
          : undefined,
      },
    });
  }

  async deleteCustomer(id: number) {
    const existingCustomer = await this.prisma.customer.findUnique({
      where: { id },
    });
    if (!existingCustomer) {
      throw new BadRequestException(`Customer with ID ${id} not found`);
    }

    return this.prisma.customer.delete({
      where: { id },
    });
  }

  async searchCustomer(query: string) {
    const customers = await this.prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } },
        ],
      },
    });

    if (!customers || customers.length === 0) {
      throw new BadRequestException('No customers found matching the query.');
    }

    return customers;
  }
}
