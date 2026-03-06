import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

// --- Add this function here ---
export async function getAvailableSlots(serviceName = null) {
  let serviceIdFilter = {};

  if (serviceName) {
    const serviceRecord = await prisma.service.findFirst({
      where: { name: serviceName }
    });

    if (!serviceRecord) return [];
    serviceIdFilter = { serviceId: serviceRecord.id };
  }

  const slots = await prisma.booking.findMany({
    where: {
      status: "available",
      ...serviceIdFilter
    },
    select: { startTime: true }
  });

  return slots.map(s => s.startTime);
}

// --- Your existing GPT function ---
export async function getChatResponse(userMessage, availableSlots = []) {
  // GPT logic here
}