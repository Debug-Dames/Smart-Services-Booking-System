import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || "super_secret_key",
  DATABASE_URL: process.env.DATABASE_URL || "",
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: Number(process.env.DB_PORT || 5432),
  DB_NAME: process.env.DB_NAME || "smart_services",
  DB_USER: process.env.DB_USER || "postgres",
  DB_PASSWORD: process.env.DB_PASSWORD || "postgres"
};
