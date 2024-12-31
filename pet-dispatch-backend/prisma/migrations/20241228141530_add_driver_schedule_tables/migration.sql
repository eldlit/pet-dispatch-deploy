/*
  Warnings:

  - You are about to drop the column `scheduleOverrides` on the `driver` table. All the data in the column will be lost.
  - You are about to drop the column `weeklySchedule` on the `driver` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "OverrideType" AS ENUM ('ANNUAL_LEAVE', 'SICK_LEAVE');

-- AlterTable
ALTER TABLE "driver" DROP COLUMN "scheduleOverrides",
DROP COLUMN "weeklySchedule";

-- CreateTable
CREATE TABLE "driver_weekly_schedule" (
    "id" SERIAL NOT NULL,
    "driverId" INTEGER NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "driver_weekly_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver_monthly_override" (
    "id" SERIAL NOT NULL,
    "driverId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "overrideType" "OverrideType" NOT NULL,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),

    CONSTRAINT "driver_monthly_override_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "driver_weekly_schedule_driverId_dayOfWeek_key" ON "driver_weekly_schedule"("driverId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "driver_monthly_override_driverId_date_key" ON "driver_monthly_override"("driverId", "date");

-- AddForeignKey
ALTER TABLE "driver_weekly_schedule" ADD CONSTRAINT "driver_weekly_schedule_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_monthly_override" ADD CONSTRAINT "driver_monthly_override_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;
