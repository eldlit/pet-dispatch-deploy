import { Injectable, BadRequestException } from '@nestjs/common';
import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GoogleCalendarService {
  private oauth2Client: OAuth2Client;

  constructor(private readonly prisma: PrismaService) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );

    console.log(process.env.GOOGLE_CLIENT_ID);
    console.log(process.env.GOOGLE_CLIENT_SECRET);
    console.log(process.env.GOOGLE_REDIRECT_URI);
  }

  async getAuthUrl(driverId: number | string): Promise<string> {
    // 1) Convert driverId to a number if needed
    const numericId =
      typeof driverId === 'string' ? parseInt(driverId, 10) : driverId;

    // 2) Check if the driver exists
    const existingDriver = await this.prisma.driver.findUnique({
      where: { id: numericId },
    });
    if (!existingDriver) {
      throw new BadRequestException('Driver does not exist');
    }

    // 3) Check if there's already a google_api record
    let googleApiRecord = await this.prisma.google_api.findUnique({
      where: { driverId: numericId },
    });

    // 4) If the record exists, update it...
    if (googleApiRecord) {
      await this.prisma.google_api.update({
        where: { driverId: numericId },
        data: {
          connectionStatus: 'INITIATED',
          updatedAt: new Date(),
        },
      });
    } else {
      googleApiRecord = await this.prisma.google_api.create({
        data: {
          driverId: numericId,
          connectionStatus: 'INITIATED',
          accessToken: '',
          refreshToken: '',
          expiresAt: new Date(0),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }
    console.log('call google api for auth link');
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar'],
      prompt: 'consent',
      state: JSON.stringify({ driverId }),
    });
    console.log(authUrl);
    // 4) Return the URL as a string
    return authUrl;
  }

  async saveTokensFromCallback(
    driverId: number | string,
    code: string,
  ): Promise<void> {
    const { tokens } = await this.oauth2Client.getToken(code);

    const numericId =
      typeof driverId === 'string' ? parseInt(driverId, 10) : driverId;

    const driverExists = await this.prisma.driver.findUnique({
      where: { id: numericId },
    });

    if (!driverExists) {
      throw new BadRequestException(
        `Driver with ID ${driverId} does not exist`,
      );
    }

    if (!tokens.access_token || !tokens.refresh_token) {
      await this.prisma.google_api.update({
        where: { id: numericId },
        data: {
          connectionStatus: 'NOT_CONNECTED',
        },
      });
      throw new BadRequestException('Invalid Google tokens');
    }

    const expiresAt = tokens.expiry_date
      ? new Date(parseInt(tokens.expiry_date.toString(), 10))
      : new Date(Date.now() + 3600 * 1000);

    console.log('Expiry date: ' + expiresAt);

    // Save tokens in the database for the specific driver
    await this.prisma.google_api.upsert({
      where: { driverId: numericId },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
        updatedAt: new Date(),
        connectionStatus: 'CONNECTED',
      },
      create: {
        driverId: numericId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
        connectionStatus: 'CONNECTED',
      },
    });
  }

  async createEvent(
    driverId: number,
    event: calendar_v3.Schema$Event,
  ): Promise<any> {
    const driverTokens = await this.prisma.google_api.findUnique({
      where: { driverId },
    });

    if (driverTokens.connectionStatus !== 'CONNECTED') {
      throw new BadRequestException(
        'Google Calendar integration is not fully connected',
      );
    }

    if (!driverTokens) {
      throw new BadRequestException(
        'Driver has not authorized Google Calendar integration',
      );
    }

    this.oauth2Client.setCredentials({
      access_token: driverTokens.accessToken,
      refresh_token: driverTokens.refreshToken,
    });

    const calendar = google.calendar({
      version: 'v3',
      auth: this.oauth2Client,
    });

    const calendarResponse = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    if (event.extendedProperties?.private?.rideId) {
      const rideId = parseInt(event.extendedProperties.private.rideId, 10);

      if (isNaN(rideId)) {
        throw new Error(
          'Invalid rideId provided in the event extended properties',
        );
      }

      await this.prisma.ride.update({
        where: { id: rideId },
        data: { calendarEventId: calendarResponse.data.id },
      });
    } else {
      throw new Error('Ride ID is missing in the event extended properties');
    }

    return calendarResponse.data;
  }

  async cancelCalendarEvent(driverId: number, rideId: number): Promise<void> {
    const ride = await this.prisma.ride.findUnique({
      where: { id: rideId },
      select: { calendarEventId: true },
    });

    if (!ride || !ride.calendarEventId) {
      throw new BadRequestException(
        `Calendar event for ride ${rideId} not found`,
      );
    }

    const driverTokens = await this.prisma.google_api.findUnique({
      where: { driverId },
    });

    if (!driverTokens) {
      throw new BadRequestException(
        'Driver has not authorized Google Calendar integration',
      );
    }

    this.oauth2Client.setCredentials({
      access_token: driverTokens.accessToken,
      refresh_token: driverTokens.refreshToken,
    });

    const calendar = google.calendar({
      version: 'v3',
      auth: this.oauth2Client,
    });

    try {
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: ride.calendarEventId,
      });
    } catch (error) {
      console.error(
        `Failed to cancel calendar event for ride ${rideId}:`,
        error,
      );
      throw new BadRequestException(
        `Failed to cancel calendar event for ride ${rideId}`,
      );
    }
  }
}
