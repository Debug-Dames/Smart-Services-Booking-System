import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import chatRoutes from "../routes/chatRoutes.js";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// ✅ Parse JSON BEFORE routes
app.use(express.json());
app.use('/api/chat', chatRoutes);

/* TEST DATABASE ROUTE */
app.get("/test-db", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json({
      message: "✅ Database connected successfully",
      data: users
    });
  } catch (error) {
    res.status(500).json({
      message: "❌ Database connection failed",
      error: error.message
    });
  }
});

/* START SERVER */
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});