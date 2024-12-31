import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ResponseRideDto } from '../model/response.order.dto';
import { RidesService } from '../service/orders.service';
import { CreateRideDto } from '../model/create.order.dto';
import { UpdateRideDto } from '../model/update.order.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@ApiTags('rides')
@Controller('rides')
export class RidesController {
  constructor(private readonly ridesService: RidesService) {}

  @Get()
  @ApiOperation({ summary: 'Fetch all rides (orders)' })
  @ApiResponse({
    status: 200,
    description: 'List of rides',
    type: [ResponseRideDto],
  })
  async getAllRides(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<{ rides: ResponseRideDto[]; totalPages: number }> {
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    return this.ridesService.getAllRides(pageNumber, pageSize);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a ride by ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the ride to delete',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Ride deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Ride not found',
  })
  async deleteRide(@Param('id') id: string): Promise<{ message: string }> {
    const rideId = parseInt(id, 10);
    await this.ridesService.deleteRide(rideId);
    return { message: 'Ride deleted successfully' };
  }

  @Post()
  @UseInterceptors(FileInterceptor('vaccinationFile'))
  @ApiOperation({ summary: 'Create a new ride' })
  @ApiResponse({
    status: 201,
    description: 'Ride created successfully',
    type: ResponseRideDto,
  })
  async createRide(
    @Body() dto: CreateRideDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ResponseRideDto> {
    const fileBuffer = file?.buffer || null;
    return this.ridesService.createRide(dto, fileBuffer);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('vaccinationFile'))
  @ApiOperation({ summary: 'Update a ride by ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the ride to update',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Ride updated successfully',
    type: ResponseRideDto,
  })
  async updateRide(
    @Param('id') id: string,
    @Body() dto: UpdateRideDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ResponseRideDto> {
    const rideId = parseInt(id, 10);
    const fileBuffer = file?.buffer || null;
    return this.ridesService.updateRide(rideId, dto, fileBuffer);
  }

  @Get(':id/vaccination')
  @ApiOperation({ summary: 'Download vaccination file for a ride' })
  async getVaccinationFile(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const rideId = parseInt(id, 10);
    const file = await this.ridesService.getVaccinationFile(rideId);

    if (!file) {
      throw new BadRequestException('File not found!');
    }

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="vaccination-${rideId}.pdf"`,
    });

    res.send(file); // Send the file buffer
  }

  @Post('assign/:driverId')
  @ApiOperation({ summary: 'Assign a ride to a driver' })
  @ApiParam({
    name: 'driverId',
    description: 'The ID of the driver',
    example: 1,
  })
  @ApiBody({
    description: 'The ride ID to assign',
    schema: {
      type: 'object',
      properties: {
        rideId: { type: 'number', example: 2 },
      },
      required: ['rideId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Ride assigned successfully',
  })
  async assignRide(
    @Param('driverId') driverId: string,
    @Body('rideId') rideId: number,
  ): Promise<{ message: string }> {
    const driverIdInt = parseInt(driverId, 10);
    if (!driverIdInt || !rideId) {
      throw new BadRequestException('Invalid driverId or rideId');
    }

    await this.ridesService.assignRide(driverIdInt, rideId);
    return { message: 'Ride assigned successfully' };
  }

  @Post('unassign/:driverId')
  @ApiOperation({ summary: 'Unassign a ride from a driver' })
  @ApiParam({
    name: 'driverId',
    description: 'The ID of the driver',
    example: 1,
  })
  @ApiBody({
    description: 'The ride ID to unassign',
    schema: {
      type: 'object',
      properties: {
        rideId: { type: 'number', example: 2 },
      },
      required: ['rideId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Ride unassigned successfully',
  })
  async unassignRide(
    @Param('driverId') driverId: string,
    @Body('rideId') rideId: number,
  ): Promise<{ message: string }> {
    const driverIdInt = parseInt(driverId, 10);
    if (!driverIdInt || !rideId) {
      throw new BadRequestException('Invalid driverId or rideId');
    }

    await this.ridesService.unassignRide(driverIdInt, rideId);
    return { message: 'Ride unassigned successfully' };
  }
}
