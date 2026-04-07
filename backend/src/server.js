import app from "./app.js";
import { env } from "./config/env.js";
import { PrismaClient } from "@prisma/client";
import { ensureBookingTimeColumns, ensureStylistTable, ensureUserStatusColumn } from "./config/database.js";


import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();
const PORT = env.PORT || 5000;

async function startServer() {
    try {
        await ensureBookingTimeColumns();
        await ensureUserStatusColumn();
        await ensureStylistTable();
        
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




