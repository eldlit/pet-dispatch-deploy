import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {ResponseRideDto} from "../model/response.order.dto";
import {CreateRideDto} from "../model/create.order.dto";
import {RidesService} from "../service/orders.service";

@ApiTags('Rides')
@Controller('rides')
export class RidesController {
    constructor(private readonly ridesService: RidesService) {}

    // @Get()
    // @ApiOperation({ summary: 'Fetch all rides (orders)' })
    // @ApiResponse({
    //     status: 200,
    //     description: 'List of rides',
    //     type: [ResponseRideDto],
    // })
    // async getAllRides(): Promise<ResponseRideDto[]> {
    //     return this.ridesService.getAllRides();
    // }
    //
    // @Get(':id')
    // @ApiOperation({ summary: 'Fetch ride details by ID' })
    // @ApiResponse({
    //     status: 200,
    //     description: 'Ride details',
    //     type: ResponseRideDto,
    // })
    // async getRideById(@Param('id', ParseIntPipe) id: number): Promise<ResponseRideDto> {
    //     return this.ridesService.getRideById(id);
    // }
    //
    // @Post()
    // @ApiOperation({ summary: 'Create a new ride (order)' })
    // @ApiResponse({
    //     status: 201,
    //     description: 'Ride created successfully',
    //     type: ResponseRideDto,
    // })
    // async createRide(@Body() createRideDto: CreateRideDto): Promise<ResponseRideDto> {
    //     return this.ridesService.createRide(createRideDto);
    // }
}
