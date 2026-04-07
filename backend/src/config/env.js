import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../../.env");

// In local development, load backend/.env.
// In production, rely on hosting provider environment variables.
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

export const env = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || process.env.jwtSecret || "super_secret_key",
  DATABASE_URL: process.env.DATABASE_URL,
  GEMINI_API_KEY: (process.env.GEMINI_API_KEY || "").trim(),
  GEMINI_MODEL: (process.env.GEMINI_MODEL || "gemini-2.5-flash").trim(),
  GEMINI_DAILY_LIMIT: Number(process.env.GEMINI_DAILY_LIMIT) || 5,
  FRONTEND_ORIGIN: (process.env.FRONTEND_ORIGIN || "").trim(),
};
