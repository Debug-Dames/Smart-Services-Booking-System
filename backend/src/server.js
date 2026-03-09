import app from "./app.js";
import { env } from "./config/env.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const PORT = env.PORT || 5000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

startServer();
