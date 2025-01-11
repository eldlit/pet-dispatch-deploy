-- CreateTable
CREATE TABLE "google_api" (
    "id" SERIAL NOT NULL,
    "driverId" INTEGER NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "google_api_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "google_api" ADD CONSTRAINT "google_api_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
