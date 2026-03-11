// // Load environment variables before any tests
import dotenv from "dotenv";

const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";

// Only load dotenv if DATABASE_URL is not already provided
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: envFile });
  console.log(`[dotenv] Loaded env from ${envFile}`);
} else {
  console.log("[dotenv] Using environment variables from CI");
}

// process.env.DOTENV_CONFIG_SILENT = true


// tests/setupTests.js
// import dotenv from "dotenv";

// // Automatically use .env.test when running tests
// process.env.NODE_ENV = process.env.NODE_ENV || "test";
// const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";

// dotenv.config({ path: envFile });

// // Optional: suppress Prisma logs during tests
// import { PrismaClient } from "@prisma/client";
// export const prisma = new PrismaClient({
//   log: process.env.NODE_ENV === "test" ? [] : ["query", "info", "warn", "error"],
// });
