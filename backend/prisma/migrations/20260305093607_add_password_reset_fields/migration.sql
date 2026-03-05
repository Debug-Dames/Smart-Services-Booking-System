/*
  Warnings:

  - You are about to drop the column `endTime` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Booking` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `phone` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'ADMIN');

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "endTime",
DROP COLUMN "startTime";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "gender" TEXT,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'CUSTOMER';
