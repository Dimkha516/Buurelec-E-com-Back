-- AlterTable
ALTER TABLE "addresses" ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "guest_email" TEXT,
ADD COLUMN     "guest_first_name" TEXT,
ADD COLUMN     "guest_last_name" TEXT,
ADD COLUMN     "guest_phone" TEXT,
ALTER COLUMN "user_id" DROP NOT NULL;
