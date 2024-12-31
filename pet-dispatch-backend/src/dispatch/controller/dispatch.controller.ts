import { Controller, Get, Param, Query, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DispatchService } from '../service/dispatch.service';

@ApiTags('dispatch')
@Controller('dispatch')
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Get('availability')
  @ApiOperation({ summary: 'Get driver availability by date' })
  async getDriverAvailability(@Query('date') date: string): Promise<any[]> {
    return this.dispatchService.getDriverAvailability(new Date(date));
  }

  @Post('assign/:rideId/:driverId')
  @ApiOperation({
    summary: 'Assign a driver to a ride and create calendar event',
  })
  async assignDriverToRide(
    @Param('rideId') rideId: number,
    @Param('driverId') driverId: number,
  ): Promise<void> {
    return this.dispatchService.assignDriverToRide(rideId, driverId);
  }
}
