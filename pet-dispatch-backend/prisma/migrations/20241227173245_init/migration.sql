-- CreateEnum
CREATE TYPE "DriverStatus" AS ENUM ('AVAILABLE', 'ON_RIDE', 'ANNUAL_LEAVE', 'SICK_LEAVE');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'PAYMENT_LINK');

-- CreateEnum
CREATE TYPE "RideType" AS ENUM ('ONE_WAY', 'TWO_WAY');

-- CreateEnum
CREATE TYPE "RideStatus" AS ENUM ('INCOMPLETE', 'COMPLETE', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "customer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "customerStatus" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "status" "DriverStatus" NOT NULL DEFAULT 'AVAILABLE',
    "nationalId" TEXT,
    "passportNumber" TEXT,
    "laborCard" TEXT,
    "medicalInsurance" TEXT,
    "uaeVisa" TEXT,
    "nationalIdExpiry" TIMESTAMP(3),
    "passportExpiry" TIMESTAMP(3),
    "laborCardExpiry" TIMESTAMP(3),
    "medicalInsuranceExpiry" TIMESTAMP(3),
    "uaeVisaExpiry" TIMESTAMP(3),
    "weeklySchedule" JSONB,
    "scheduleOverrides" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ride" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "driver_id" INTEGER,
    "petName" TEXT NOT NULL,
    "breed" TEXT NOT NULL,
    "pickupLocation" TEXT NOT NULL,
    "dropoffLocation" TEXT NOT NULL,
    "specialNotes" TEXT,
    "vaccinationCopy" TEXT,
    "accompanied" BOOLEAN NOT NULL DEFAULT true,
    "rideType" "RideType" NOT NULL DEFAULT 'ONE_WAY',
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH',
    "status" "RideStatus" NOT NULL DEFAULT 'INCOMPLETE',
    "scheduledTime" TIMESTAMP(3) NOT NULL,
    "price" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ride_pkey" PRIMARY KEY ("id")
);
