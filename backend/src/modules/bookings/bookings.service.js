
import prisma from "../../config/database.js";

export const createBooking = async ({
  userId,
  serviceId,
  date,
  startTime,
  endTime
}) => {
  const bookingDate = new Date(date);

  const start = new Date(`${date}T${startTime}`);
  const end = new Date(`${date}T${endTime}`);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ❌ Past booking check
  if (bookingDate < today) {
    throw new Error("Cannot book in the past");
  }

  // ❌ Invalid time range
  if (end <= start) {
    throw new Error("End time must be after start time");
  }

  // ❌ Overlapping booking check
  try {
    const existing = await prisma.booking.findFirst({
      where: {
        serviceId,
        startTime: {
          lt: end
        },
        endTime: {
          gt: start
        }
      }
    });

    if (existing) {
      throw new Error("Time slot already booked");
    }
  } catch (err) {
    const msg = String(err?.message || "");
    if (
      msg.includes("Unknown argument `startTime`") ||
      msg.includes("Unknown arg `startTime`") ||
      msg.includes('column "startTime" does not exist') ||
      msg.includes("Unknown argument `endTime`") ||
      msg.includes("Unknown arg `endTime`") ||
      msg.includes('column "endTime" does not exist')
    ) {
      // Skip overlap check if DB schema is missing time columns.
    } else {
      throw err;
    }
  }

  // ✅ Create booking
  return await prisma.booking.create({
    data: {
      userId,
      serviceId,
      date: bookingDate,
      startTime: start,
      endTime: end,
      status: "pending"
    }
  });
};
