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
};
