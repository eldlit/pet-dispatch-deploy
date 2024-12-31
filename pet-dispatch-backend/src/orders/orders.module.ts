import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RidesService } from './service/orders.service';
import { RidesController } from './controller/orders.controller';
import { GoogleCalendarService } from '../google/service/google.calendar.service';

@Module({
  controllers: [RidesController],
  providers: [RidesService, PrismaService, GoogleCalendarService],
})
export class OrdersModule {}
