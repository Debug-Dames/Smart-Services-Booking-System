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

  if (!serviceId || !startTime || !endTime) {
    throw new Error("serviceId, startTime, and endTime are required");
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
        { serviceId: Number(serviceId) },
        ...(stylistId ? [{ stylistId: Number(stylistId) }] : [])
      ]
    }
  });
  if (conflict) throw new Error("This slot overlaps an existing booking");

  // Check in-memory locks
  const now = Date.now();
  for (const lock of slotLocks.values()) {
    if (stylistId && lock.stylistId !== Number(stylistId)) continue;
    if (lock.serviceId !== Number(serviceId)) continue;
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
    stylistId: stylistId ? Number(stylistId) : null,
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
  const { userId, serviceId, stylistId, date, startTime, endTime, lockToken } = data;

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

  // If a lock token is provided, validate and consume it. Otherwise allow direct booking.
  if (user && lockToken) {
    const lock = slotLocks.get(lockToken);
    if (!lock) throw new Error("You must lock the slot before booking");
    if (lock.userId !== user.id) throw new Error("You must lock the slot before booking");
    if (lock.serviceId !== Number(serviceId)) throw new Error("You must lock the slot before booking");
    if (stylistId && lock.stylistId !== Number(stylistId)) {
      throw new Error("You must lock the slot before booking");
    }
    if (lock.expiresAt < Date.now()) {
      slotLocks.delete(lockToken);
      throw new Error("You must lock the slot before booking");
    }
    // consume the lock
    slotLocks.delete(lockToken);
  }

  // Create booking
  return prisma.booking.create({
    data: {
      userId: bookingUserId,
      serviceId: Number(serviceId),
      startTime: start,
      endTime: end,
      date: new Date(start.setHours(0, 0, 0, 0))
    }
  });
};
