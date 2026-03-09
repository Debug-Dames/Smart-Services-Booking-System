import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";// adjust path if needed
import OpenAI from 'openai';

dotenv.config();
const prisma = new PrismaClient();
// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Function to fetch available slots
export async function getAvailableSlots(serviceName = null) {
  let serviceIdFilter = {};

  if (serviceName) {
    // 🔹 Use findFirst, not findUnique
    const serviceRecord = await prisma.service.findFirst({
      where: { name: serviceName }
    });

    if (!serviceRecord) return []; // no matching service
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

export async function getChatResponse(userMessage, availableSlots = []) {
    `
You are a smart assistant for a salon booking system.
Answer FAQs about services, prices, stylists, and working hours.
Recommend available booking slots based on current salon schedule.
Available slots: ${availableSlots.join(", ")}
Only suggest slots that are actually free.
`;

  try {
    const systemPrompt = "You are a helpful assistant for booking salon services.";
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ]
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("GPT API error:", error);
    return "Sorry, I'm having trouble responding right now.";
  }
}