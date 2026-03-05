import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure Prisma always gets DATABASE_URL from backend/.env.
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const prisma = new PrismaClient();

export const ensureBookingTimeColumns = async () => {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Booking"
    ADD COLUMN IF NOT EXISTS "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS "endTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  `);
};

export default prisma;

