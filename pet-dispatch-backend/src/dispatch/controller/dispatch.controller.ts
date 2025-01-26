import { Controller, Get, Param, Query, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DispatchService } from '../service/dispatch.service';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('dispatch')
@Controller('dispatch')
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('availability')
  @ApiOperation({ summary: 'Get driver availability by date/time' })
  async getDriverAvailability(
    @Query('datetime') datetime: string,
  ): Promise<any[]> {
    const parsedDate = datetime ? new Date(datetime) : new Date();
    return this.dispatchService.getDriverAvailability(parsedDate);
  }

  @UseGuards(AuthGuard('jwt'))
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
