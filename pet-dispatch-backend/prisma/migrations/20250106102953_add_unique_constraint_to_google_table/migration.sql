/*
  Warnings:

  - A unique constraint covering the columns `[driverId]` on the table `google_api` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "google_api_driverId_key" ON "google_api"("driverId");
