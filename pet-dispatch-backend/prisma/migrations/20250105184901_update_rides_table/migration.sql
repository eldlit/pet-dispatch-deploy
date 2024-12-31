-- Rename Primary Key Constraint
ALTER TABLE "ride" RENAME CONSTRAINT "Ride_pkey" TO "ride_pkey";

-- Add Columns
ALTER TABLE "ride"
    ADD COLUMN "rideDistance" DECIMAL(10,2),
ADD COLUMN "rideEndTime" TIMESTAMP(3);

-- Add Foreign Key for Customer
ALTER TABLE "ride"
    ADD CONSTRAINT "ride_customer_id_fkey"
        FOREIGN KEY ("customer_id") REFERENCES "customer"("id")
            ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add Foreign Key for Driver
ALTER TABLE "ride"
    ADD CONSTRAINT "ride_driver_id_fkey"
        FOREIGN KEY ("driver_id") REFERENCES "driver"("id")
            ON DELETE SET NULL ON UPDATE CASCADE;