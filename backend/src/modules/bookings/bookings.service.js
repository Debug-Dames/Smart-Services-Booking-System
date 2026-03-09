import prisma from "../../config/database.js";

const DEFAULT_SERVICE_META = {
  Haircut: { price: 150, duration: 60 },
  Nails: { price: 220, duration: 90 },
  Braids: { price: 350, duration: 180 },
};

function isMissingTimeFieldError(err) {
  const msg = String(err?.message || "");
  return (
    msg.includes("Unknown argument `startTime`") ||
    msg.includes("Unknown argument `endTime`") ||
    msg.includes("Unknown arg `startTime`") ||
    msg.includes("Unknown arg `endTime`") ||
    msg.includes('column "startTime" does not exist') ||
    msg.includes('column "endTime" does not exist')
  );
}

// Create a new booking
export const createBooking = async ({ userId, serviceId, service, date, time, startTime, endTime }) => {
  const numericUserId = Number(userId);
  let numericServiceId = Number(serviceId);
  const normalizedServiceName = typeof service === "string" ? service.trim() : "";

  if (!Number.isInteger(numericUserId)) {
    throw new Error("Invalid userId");
  }

  if (!date) {
    throw new Error("Date is required");
  }

  const bookingDate = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(bookingDate.getTime())) {
    throw new Error("Invalid date");
  }

  const startCandidate = startTime || (date && time ? `${date}T${time}:00` : null);
  const start = new Date(startCandidate);
  if (!startCandidate || Number.isNaN(start.getTime())) {
    throw new Error("Invalid start time");
  }

  const end = endTime ? new Date(endTime) : new Date(start.getTime() + 60 * 60000);
  if (Number.isNaN(end.getTime()) || end <= start) {
    throw new Error("Invalid time range");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bookingDay = new Date(bookingDate);
  bookingDay.setHours(0, 0, 0, 0);
  if (bookingDay < today) {
    throw new Error("Cannot book in the past");
  }

  const user = await prisma.user.findUnique({ where: { id: numericUserId } });
  if (!user) throw new Error("User not found");

  let serviceRecord = null;

  if (Number.isInteger(numericServiceId)) {
    serviceRecord = await prisma.service.findUnique({ where: { id: numericServiceId } });
  }

  if (!serviceRecord && normalizedServiceName) {
    serviceRecord = await prisma.service.findFirst({
      where: {
        name: {
          equals: normalizedServiceName,
          mode: "insensitive",
        },
      },
    });
  }

  if (!serviceRecord && normalizedServiceName) {
    const fallbackMeta = DEFAULT_SERVICE_META[normalizedServiceName] || { price: 200, duration: 60 };
    serviceRecord = await prisma.service.create({
      data: {
        name: normalizedServiceName,
        description: `${normalizedServiceName} service`,
        price: fallbackMeta.price,
        duration: fallbackMeta.duration,
      },
    });
  }

  if (!serviceRecord) {
    throw new Error("Invalid userId or serviceId");
  }

  numericServiceId = serviceRecord.id;

  try {
    const existing = await prisma.booking.findFirst({
      where: {
        serviceId: numericServiceId,
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });

    if (existing) {
      throw new Error("Time slot already booked");
    }
  } catch (err) {
    if (!isMissingTimeFieldError(err)) {
      throw err;
    }
  }

  try {
    return await prisma.booking.create({
      data: {
        userId: numericUserId,
        serviceId: numericServiceId,
        date: bookingDate,
        startTime: start,
        endTime: end,
      },
      include: { service: true },
    });
  } catch (err) {
    if (!isMissingTimeFieldError(err)) {
      throw err;
    }

    // Fallback for environments where Booking has no startTime/endTime columns.
    return prisma.booking.create({
      data: {
        userId: numericUserId,
        serviceId: numericServiceId,
        date: start,
      },
      include: { service: true },
    });
  }
};

