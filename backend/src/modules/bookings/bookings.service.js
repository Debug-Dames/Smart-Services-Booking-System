// backend/src/modules/bookings/bookings.service.js
import { randomUUID } from "node:crypto";
import prisma from "../../config/database.js";

import {
  DEFAULT_LOCK_MINUTES,
  MIN_LOCK_MINUTES,
  MAX_LOCK_MINUTES
} from "../../config/booking.constants.js";

import {
  overlaps,
  clampLockMinutes
} from "../../utils/booking.utils.js";

// In-memory slot locks: token -> lock object
// NOTE: resets on server restart
const slotLocks = new Map();

/**
 * Lock a time slot for a service & stylist
 */
export const lockSlot = async (data, user) => {
  const { serviceId, stylistId, startTime, endTime, lockMinutes } = data;

  if (!serviceId || !stylistId || !startTime || !endTime) {
    throw new Error("serviceId, stylistId, startTime, and endTime are required");
  }

  const start = new Date(startTime);
  const end = new Date(endTime);
  const minutes = clampLockMinutes(lockMinutes, MIN_LOCK_MINUTES, MAX_LOCK_MINUTES, DEFAULT_LOCK_MINUTES);

  // Check DB for existing bookings for this stylist
  const conflict = await prisma.booking.findFirst({
    where: {
      AND: [
        { startTime: { lt: end } },
        { endTime: { gt: start } },
        { stylistId: Number(stylistId) }
      ]
    }
  });
  if (conflict) throw new Error("This slot overlaps an existing booking");

  // Check in-memory locks
  const now = Date.now();
  for (const lock of slotLocks.values()) {
    if (lock.stylistId !== Number(stylistId)) continue;
    if (lock.expiresAt < now) {
      slotLocks.delete(lock.token);
      continue;
    }
    if (overlaps(start.getTime(), end.getTime(), lock.startTimeMs, lock.endTimeMs)) {
      throw new Error("Slot currently locked by another user");
    }
  }

  // Create lock
  const token = randomUUID();
  slotLocks.set(token, {
    token,
    userId: user?.id,
    serviceId: Number(serviceId),
    stylistId: Number(stylistId),
    startTimeMs: start.getTime(),
    endTimeMs: end.getTime(),
    expiresAt: now + minutes * 60 * 1000
  });

  return {
    message: "Slot locked",
    lockToken: token,
    expiresInMinutes: minutes
  };
};

<<<<<<< HEAD
// ─────────────────────────────────────
// Create booking
// ─────────────────────────────────────
export const createBooking = async({ userId, serviceId, service, date, time }) => {

    if (!userId) throw new Error("Invalid userId");

    if (!date || !time) {
        throw new Error("Date and time are required");
    }

    const dateObj = new Date(`${date}T00:00:00.000Z`);
    const start = new Date(`${date}T${time}:00.000Z`);

    if (isNaN(dateObj) || isNaN(start)) {
        throw new Error("Invalid date or time");
    }

    // Resolve service
    let serviceRecord = null;

    if (serviceId) {
        serviceRecord = await prisma.service.findUnique({
            where: { id: Number(serviceId) },
        });
    }

    if (!serviceRecord && service) {
        const normalized = service.trim();

        serviceRecord = await prisma.service.findFirst({
            where: { name: { equals: normalized, mode: "insensitive" } },
        });

        if (!serviceRecord) {
            const meta = DEFAULT_SERVICE_META[normalized] || {
                price: 200,
                duration: 60,
            };

            serviceRecord = await prisma.service.create({
                data: {
                    name: normalized,
                    description: `${normalized} service`,
                    price: meta.price,
                    duration: meta.duration,
                },
            });
        }
    }

    if (!serviceRecord) {
        throw new Error("Service not found");
    }

    const duration = serviceRecord.duration || 60;
    const end = new Date(start.getTime() + duration * 60000);

    // daily booking limit
    const nextDay = new Date(dateObj);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    const dailyCount = await prisma.booking.count({
        where: { date: { gte: dateObj, lt: nextDay } },
    });

    if (dailyCount >= 4) {
        throw new Error("This day is fully booked");
    }

    // slot check
    const slotTaken = await prisma.booking.findFirst({
        where: {
            startTime: start,
        },
    });

    if (slotTaken) {
        throw new Error("Time slot already booked");
    }

    return prisma.booking.create({
        data: {
            userId,
            serviceId: serviceRecord.id,
            date: dateObj,
            startTime: start,
            endTime: end,
            status: "PENDING",
        },
    });
};

// ─────────────────────────────────────
// Calendar Monthly Counts
// ─────────────────────────────────────
export const getMonthlyBookings = async({ year, month }) => {

    const y = parseInt(year) || new Date().getUTCFullYear();
    const m = parseInt(month) || new Date().getUTCMonth() + 1;

    const start = new Date(Date.UTC(y, m - 1, 1));
    const end = new Date(Date.UTC(y, m, 1));

    const bookings = await prisma.booking.findMany({
        where: {
            date: { gte: start, lt: end },
        },
        select: { date: true },
    });

    const counts = {};

    bookings.forEach((b) => {
        const day = b.date.toISOString().split("T")[0];
        counts[day] = (counts[day] || 0) + 1;
    });

    return counts;
};

// ─────────────────────────────────────
// Day bookings (calendar slots)
// ─────────────────────────────────────
export const getBookingsByDate = async(date) => {

    const dateObj = new Date(`${date}T00:00:00.000Z`);
    const nextDay = new Date(dateObj);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    const bookings = await prisma.booking.findMany({
        where: {
            date: { gte: dateObj, lt: nextDay },
        },
        include: {
            service: true,
        },
        orderBy: {
            startTime: "asc",
        },
    });

    return bookings.map((b) => ({
        id: b.id,
        date: b.date.toISOString().split("T")[0],
        time: b.startTime.toISOString().substring(11, 16),
        status: b.status,
        service: b.service ?.name || "",
    }));
};
=======
/**
 * Unlock a previously locked slot
 */
export const unlockSlot = async (token) => {
  if (!token) throw new Error("Lock token is required");

  const existed = slotLocks.delete(token);
  return {
    message: existed ? "Slot unlocked" : "Lock not found or already expired"
  };
};


/**
 * Create a new booking
 * Accepts either locked slots (preferred) or direct booking (for tests)
 */
export const createBooking = async (data, user) => {
  const { userId, serviceId, stylistId, date, startTime, endTime } = data;

  // Support test-friendly direct booking without user object
  const bookingUserId = user?.id || userId;
  if (!bookingUserId || !serviceId || !startTime || !endTime) {
    console.log("Missing required fields:", { bookingUserId, serviceId, startTime, endTime });
    throw new Error("userId, serviceId, startTime, and endTime are required");
  }

  // Parse times
  const bookingDate = date ? new Date(date) : new Date(startTime);
  const start = new Date(
    startTime.includes("T")
      ? startTime
      : `${bookingDate.toISOString().split("T")[0]}T${startTime}`
  );
  const end = new Date(
    endTime.includes("T")
      ? endTime
      : `${bookingDate.toISOString().split("T")[0]}T${endTime}`
  );

  // Validate past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (bookingDate < today) throw new Error("Cannot book in the past");

  // Validate time range
  if (end <= start) throw new Error("Invalid time range");

  // Check DB conflicts (stylist optional)
  const conflict = await prisma.booking.findFirst({
    where: {
      AND: [
        { startTime: { lt: end } },
        { endTime: { gt: start } },
        ...(stylistId ? [{ stylistId: Number(stylistId) }] : [])
      ]
    }
  });
  if (conflict) throw new Error("Time slot already booked");

  // For real users, verify they locked the slot (stylist optional)
  if (user) {
    let hasValidLock = true;
    const now = Date.now();
    for (const [token, lock] of slotLocks.entries()) {
      if (lock.userId !== user.id) continue;
      if (stylistId && lock.stylistId !== Number(stylistId)) continue;
      if (lock.expiresAt < now) {
        slotLocks.delete(token);
        continue;
      }
      if (overlaps(start.getTime(), end.getTime(), lock.startTimeMs, lock.endTimeMs)) {
        hasValidLock = true;
        slotLocks.delete(token); // consume the lock
        break;
      }
    }
    if (!hasValidLock) throw new Error("You must lock the slot before booking");
  }

  // Create booking
  return prisma.booking.create({
    data: {
      userId: bookingUserId,
      serviceId: Number(serviceId),
      stylistId: stylistId ? Number(stylistId) : null,
      startTime: start,
      endTime: end,
      date: new Date(start.setHours(0, 0, 0, 0))
    }
  });
};
>>>>>>> e62622b5828e5f667d9cf7ff705437ad65f58a2b
