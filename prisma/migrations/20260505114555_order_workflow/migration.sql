/*
  Warnings:

  - The `payment_method` column on the `orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('HOME_DELIVERY', 'PICKUP_POINT');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('WAVE', 'ORANGE_MONEY', 'BANK_CARD', 'CASH');

-- CreateEnum
CREATE TYPE "PaymentTiming" AS ENUM ('PREPAID', 'ON_DELIVERY');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "delivery_method" "DeliveryMethod" NOT NULL DEFAULT 'HOME_DELIVERY',
ADD COLUMN     "payment_timing" "PaymentTiming" NOT NULL DEFAULT 'PREPAID',
ADD COLUMN     "pickup_point_id" TEXT,
DROP COLUMN "payment_method",
ADD COLUMN     "payment_method" "PaymentMethod";

-- CreateTable
CREATE TABLE "pickup_points" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "phone" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pickup_points_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_pickup_point_id_fkey" FOREIGN KEY ("pickup_point_id") REFERENCES "pickup_points"("id") ON DELETE SET NULL ON UPDATE CASCADE;
