import { Module } from '@nestjs/common';
import { CustomersModule } from './customers/customers.module';
import { DriversModule } from './drivers/drivers.module';
import { OrdersModule } from './orders/orders.module';
import { GoogleCalendarModule } from './google/google.calendar.module';
import { DispatchModule } from './dispatch/dispatch.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    CustomersModule,
    DriversModule,
    OrdersModule,
    GoogleCalendarModule,
    DispatchModule,
    AuthModule,
  ],
})
export class AppModule {}
