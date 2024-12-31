import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DriversService } from './service/drivers.service';
import { DriversController } from './controller/drivers.controller';

@Module({
  controllers: [DriversController],
  providers: [DriversService, PrismaService],
})
export class DriversModule {}
