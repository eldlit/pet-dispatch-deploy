import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateCustomerDto } from '../model/create.customer.dto';
import { UpdateCustomerDto } from '../model/update.customer.dto';
import { CustomersService } from '../service/customers.service';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all customers' })
  @ApiResponse({ status: 200, description: 'List of all customers.' })
  async getAllCustomers() {
    return await this.customersService.getAllCustomers();
  }

  @Get('/search')
  @ApiOperation({ summary: 'Search for a customer by name or phone number' })
  @ApiQuery({
    name: 'query',
    type: String,
    description: 'Search string (name or phone number)',
  })
  @ApiResponse({ status: 200, description: 'Search results.' })
  @ApiResponse({
    status: 404,
    description: 'No customers found matching the query.',
  })
  async searchCustomer(@Query('query') query: string) {
    return await this.customersService.searchCustomer(query);
  }

  @Post()
  @ApiOperation({ summary: 'Add a new customer' })
  @ApiResponse({ status: 201, description: 'Customer created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async createCustomer(@Body() createCustomerDto: CreateCustomerDto) {
    return await this.customersService.createCustomer(createCustomerDto);
  }

  @Put('/update/:id')
  @ApiOperation({ summary: 'Edit an existing customer' })
  @ApiParam({ name: 'id', type: String, description: 'Customer ID' })
  @ApiResponse({ status: 200, description: 'Customer updated successfully.' })
  @ApiResponse({ status: 404, description: 'Customer not found.' })
  async updateCustomer(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return await this.customersService.updateCustomer(id, updateCustomerDto);
  }

  @Delete('/delete/:id')
  @ApiOperation({ summary: 'Delete a customer' })
  @ApiParam({ name: 'id', type: String, description: 'Customer ID' })
  @ApiResponse({ status: 200, description: 'Customer deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Customer not found.' })
  async deleteCustomer(@Param('id') id: string) {
    return await this.customersService.deleteCustomer(parseInt(id));
  }
}
