import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Query,
  Res,
  Post,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { GoogleCalendarService } from '../service/google.calendar.service';

@ApiTags('google')
@Controller()
export class GoogleCalendarController {
  constructor(private readonly googleCalendarService: GoogleCalendarService) {}

  @Get('auth-link')
  @ApiOperation({
    summary: 'Generate Google OAuth2 authorization link for a driver',
  })
  async getAuthLink(
    @Query('driverId') driverId: number,
    @Res() res: Response,
  ): Promise<void> {
    if (!driverId) {
      throw new BadRequestException('Driver ID is required');
    }

    const authUrl = this.googleCalendarService.getAuthUrl(driverId);
    res.json({ authUrl });
  }

  @Get('callback')
  @ApiOperation({ summary: 'Handle Google OAuth2 callback for a driver' })
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ): Promise<void> {
    const { driverId } = JSON.parse(state);

    if (!driverId) {
      throw new BadRequestException('Driver ID is missing in the state');
    }

    await this.googleCalendarService.saveTokensFromCallback(driverId, code);
    res.json({ message: 'Authorization successful for driver' });
  }

  @Post('create-event')
  @ApiOperation({ summary: 'Create an event on a user’s Google Calendar' })
  async createEvent(
    @Body('userId') userId: number,
    @Body('event') event: any,
    @Res() res: Response,
  ): Promise<void> {
    const eventResponse = await this.googleCalendarService.createEvent(
      userId,
      event,
    );
    res.json({ eventResponse });
  }
}
