import { Module } from '@nestjs/common';
import { CustomersModule } from './customers/customers.module';
import { DriversModule } from './drivers/drivers.module';

@Module({
  imports: [CustomersModule, DriversModule],
})
export class AppModule {}
