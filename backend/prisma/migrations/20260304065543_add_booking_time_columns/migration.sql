/*
  Warnings:

  - Added the required column `endTime` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" 
ADD COLUMN IF NOT EXISTS "startTime" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "endTime" TIMESTAMP(3);
