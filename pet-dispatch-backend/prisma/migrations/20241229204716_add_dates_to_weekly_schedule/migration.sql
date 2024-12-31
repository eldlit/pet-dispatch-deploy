/*
  Warnings:

  - Added the required column `endDate` to the `driver_weekly_schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `driver_weekly_schedule` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "driver_weekly_schedule_driverId_dayOfWeek_key";

-- AlterTable
ALTER TABLE "driver_weekly_schedule" ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;
