/*
  Warnings:

  - You are about to drop the column `issuerType` on the `Offer` table. All the data in the column will be lost.
  - You are about to drop the column `ownerAdminId` on the `Offer` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "OfferCreatorRole" AS ENUM ('ADMIN', 'SUPERADMIN');

-- DropForeignKey
ALTER TABLE "public"."Offer" DROP CONSTRAINT "Offer_ownerAdminId_fkey";

-- DropIndex
DROP INDEX "public"."Booking_tripId_seatId_key";

-- DropIndex
DROP INDEX "public"."BookingGroup_boardingPointId_idx";

-- DropIndex
DROP INDEX "public"."BookingGroup_droppingPointId_idx";

-- DropIndex
DROP INDEX "public"."Offer_issuerType_idx";

-- DropIndex
DROP INDEX "public"."Offer_ownerAdminId_idx";

-- AlterTable
ALTER TABLE "Offer" DROP COLUMN "issuerType",
DROP COLUMN "ownerAdminId",
ADD COLUMN     "creatorRole" "OfferCreatorRole" NOT NULL DEFAULT 'ADMIN';

-- DropEnum
DROP TYPE "public"."OfferIssuer";
