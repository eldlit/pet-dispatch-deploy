-- CreateEnum
CREATE TYPE "ConnectionStatus" AS ENUM ('INITIATED', 'CONNECTED', 'NOT_CONNECTED');

-- AlterTable
ALTER TABLE "google_api" ADD COLUMN     "connectionStatus" "ConnectionStatus" NOT NULL DEFAULT 'NOT_CONNECTED';
