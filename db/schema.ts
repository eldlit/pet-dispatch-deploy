import { pgTable, text, integer, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const customers = pgTable("customers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const drivers = pgTable("drivers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  status: text("status").notNull().default("available"),
  nationalId: text("national_id"),
  passportNumber: text("passport_number"),
  laborCard: text("labor_card"),
  medicalInsurance: text("medical_insurance"),
  uaeVisa: text("uae_visa"),
  nationalIdExpiry: timestamp("national_id_expiry"),
  passportExpiry: timestamp("passport_expiry"),
  laborCardExpiry: timestamp("labor_card_expiry"),
  medicalInsuranceExpiry: timestamp("medical_insurance_expiry"),
  uaeVisaExpiry: timestamp("uae_visa_expiry"),
  weeklySchedule: text("weekly_schedule"),  // JSON string containing weekly schedule
  scheduleOverrides: text("schedule_overrides"),  // JSON string containing schedule overrides
  createdAt: timestamp("created_at").defaultNow(),
});

export const rides = pgTable("rides", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  customerId: integer("customer_id").notNull(),
  driverId: integer("driver_id"),
  pickupLocation: text("pickup_location").notNull(),
  dropoffLocation: text("dropoff_location").notNull(),
  status: text("status").notNull().default("pending"),
  scheduledTime: timestamp("scheduled_time").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCustomerSchema = createInsertSchema(customers);
export const selectCustomerSchema = createSelectSchema(customers);
export const insertDriverSchema = createInsertSchema(drivers);
export const selectDriverSchema = createSelectSchema(drivers);
export const insertRideSchema = createInsertSchema(rides);
export const selectRideSchema = createSelectSchema(rides);

export type Customer = z.infer<typeof selectCustomerSchema>;
export type Driver = z.infer<typeof selectDriverSchema>;
export type Ride = z.infer<typeof selectRideSchema>;
