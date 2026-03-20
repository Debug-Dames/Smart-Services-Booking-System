import app from "./app.js";
import { env } from "./config/env.js";
import { PrismaClient } from "@prisma/client";
import { ensureBookingTimeColumns } from "./config/database.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const allowedOrigins = env.FRONTEND_ORIGIN
  ? env.FRONTEND_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean)
  : [];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());


const prisma = new PrismaClient();
const PORT = env.PORT || 5000;

async function startServer() {
    try {
        await ensureBookingTimeColumns();
        
        await prisma.$connect();
        console.log("✅ Database connected successfully");

        app.listen(PORT, () => {
            console.log(`🚀 Backend running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("❌ Database connection failed:", error);
    }
}

startServer();




