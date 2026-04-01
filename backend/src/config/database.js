import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure Prisma always gets DATABASE_URL from backend/.env.
// Use override so Prisma does not connect to an unintended database from machine-level env vars.
dotenv.config({ path: path.resolve(__dirname, "../../.env"), override: true });

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export const ensureBookingTimeColumns = async () => {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Booking"
    ADD COLUMN IF NOT EXISTS "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS "endTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  `);
};

export const ensureUserStatusColumn = async () => {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "User"
    ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active';
  `);
};

export const ensureStylistTable = async () => {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Stylist" (
      "id" SERIAL NOT NULL,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "password" TEXT NOT NULL,
      "specialty" TEXT,
      "availability" TEXT NOT NULL DEFAULT 'Available',
      "workingHours" TEXT NOT NULL DEFAULT '09:00 - 17:00',
      "status" TEXT NOT NULL DEFAULT 'Available',
      "services" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Stylist_pkey" PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Stylist_email_key" ON "Stylist" ("email");
  `);
};

export default prisma;

