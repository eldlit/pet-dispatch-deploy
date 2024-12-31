import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DispatchService } from './service/dispatch.service';
import { DispatchController } from './controller/dispatch.controller';

@Module({
  controllers: [DispatchController],
  providers: [DispatchService, PrismaService],
})
export class DispatchModule {}
