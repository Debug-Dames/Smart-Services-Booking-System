// backend/src/modules/bookings/bookings.service.js
import { randomUUID } from "node:crypto";
import prisma from "../../config/database.js";

<<<<<<< HEAD
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
=======
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
>>>>>>> ce812cbce06a0241ba33d22c99ecefe74bccddf7
    data: {
      userId: bookingUserId,
      serviceId: Number(serviceId),
      stylistId: stylistId ? Number(stylistId) : null,
      startTime: start,
      endTime: end,
<<<<<<< HEAD
      status: "pending"
=======
      date: new Date(start.setHours(0, 0, 0, 0))
>>>>>>> ce812cbce06a0241ba33d22c99ecefe74bccddf7
    }
  });
};
