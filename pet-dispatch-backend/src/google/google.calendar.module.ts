import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleCalendarController } from './controller/google.controller';
import { GoogleCalendarService } from './service/google.calendar.service';

@Module({
  controllers: [GoogleCalendarController],
  providers: [GoogleCalendarService, PrismaService],
})
export class GoogleCalendarModule {}
