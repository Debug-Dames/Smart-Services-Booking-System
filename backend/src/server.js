import app from "./app.js";
import { env } from "./config/env.js";
import { PrismaClient } from "@prisma/client";
import { ensureBookingTimeColumns } from "./config/database.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatbotRoutes from '../routes/chatbotRoutes.js';

dotenv.config();

app.use(cors({
  origin:  "https://smart-services-booking-system-frontend.onrender.com", }));
app.use(express.json());

app.use("/api", chatbotRoutes);
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

        app.listen(5000, '0.0.0.0', () => {
            console.log("Backend running on http://0.0.0.0:5000");
        });

    } catch (error) {
        console.error("❌ Database connection failed:", error);
    }
}

startServer();
