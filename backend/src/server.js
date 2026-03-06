import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Lightweight connection check that does not depend on existing tables
app.get("/test-db", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ message: "Database connected successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Database connection failed", error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Database connection established");
    app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
  } catch (error) {
    console.error("Failed to connect to database on startup:", error.message);
    process.exit(1);
  }
}

startServer();
