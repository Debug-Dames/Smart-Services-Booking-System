
import { randomUUID } from "node:crypto";
import prisma from "../../config/database.js";

const DEFAULT_SERVICE_META = {
  Haircut: { price: 150, duration: 60 },
  Nails: { price: 220, duration: 90 },
  Braids: { price: 350, duration: 180 },
};

const WORKING_HOURS_START = 8;
const WORKING_HOURS_END = 20;
const MIN_LOCK_MINUTES = 5;
const MAX_LOCK_MINUTES = 10;
const DEFAULT_LOCK_MINUTES = 10;

// In-memory slot locks: token -> lock object.
// NOTE: This resets when the server restarts.
const slotLocks = new Map();

const parsePositiveInt = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
};

const isPast = (dateObj) => dateObj.getTime() < Date.now();

const overlaps = (startA, endA, startB, endB) => startA < endB && endA > startB;

const clampLockMinutes = (minutes) => {
  const numeric = Number(minutes);
  if (!Number.isFinite(numeric)) return DEFAULT_LOCK_MINUTES;
  return Math.min(MAX_LOCK_MINUTES, Math.max(MIN_LOCK_MINUTES, Math.floor(numeric)));
};

const cleanupExpiredLocks = () => {
  const now = Date.now();
  for (const [token, lock] of slotLocks.entries()) {
    if (lock.expiresAt <= now) {
      slotLocks.delete(token);
    }
  }
};

const resolveBookingWindow = ({ date, time, startTime, endTime, durationMinutes }) => {
  const startCandidate = startTime || (date && time ? `${date}T${time}:00` : null);
  const startObj = new Date(startCandidate);
  if (!startCandidate || Number.isNaN(startObj.getTime())) {
    return { error: "Provide startTime (ISO-8601) or date + time" };
  }

  let endObj = endTime ? new Date(endTime) : null;
  if (endTime && Number.isNaN(endObj.getTime())) {
    return { error: "endTime must be a valid ISO-8601 datetime" };
  }

  if (!endObj) {
    endObj = new Date(startObj.getTime() + durationMinutes * 60000);
  }

  if (endObj <= startObj) {
    return { error: "endTime must be later than startTime" };
  }

  return { startObj, endObj };
};

const validateBusinessRules = ({ startObj, endObj, durationMinutes }) => {
  const errors = [];

  if (isPast(startObj)) {
    errors.push("Past date/time bookings are not allowed");
  }

  if (durationMinutes <= 0 || durationMinutes > 8 * 60) {
    errors.push("Service duration is invalid. It must be between 1 and 480 minutes");
  }

  const startHour = startObj.getHours() + startObj.getMinutes() / 60;
  const endHour = endObj.getHours() + endObj.getMinutes() / 60;
  if (startHour < WORKING_HOURS_START || endHour > WORKING_HOURS_END) {
    errors.push(
      `Booking must be within salon working hours (${WORKING_HOURS_START}:00-${WORKING_HOURS_END}:00 local time)`
    );
  }

  return errors;
};

const normalizedStatusIsActive = (status) => {
  const value = String(status || "").toLowerCase();
  return value !== "cancelled" && value !== "rejected";
};

const findConflictingLock = ({ serviceId, stylistId, startObj, endObj, excludeToken, currentUserId }) => {
  cleanupExpiredLocks();
  for (const lock of slotLocks.values()) {
    if (excludeToken && lock.token === excludeToken) continue;
    if (currentUserId && lock.userId === currentUserId) continue;

    const sameStylist = stylistId && lock.stylistId && String(lock.stylistId) === String(stylistId);
    const sameServiceSlot = String(lock.serviceId) === String(serviceId);
    if (!sameStylist && !sameServiceSlot) continue;

    if (overlaps(startObj.getTime(), endObj.getTime(), lock.startTimeMs, lock.endTimeMs)) {
      return lock;
    }
  }
  return null;
};

const resolveUserId = async (req, userId) => {
  let effectiveUserId = Number(req.user?.id ?? userId);
  if (!Number.isNaN(effectiveUserId)) return effectiveUserId;

  const fallbackUser = await prisma.user.findFirst({ orderBy: { id: "asc" } });
  return fallbackUser?.id ?? null;
};

const ensureServiceByName = async (serviceName) => {
  if (!serviceName) return null;

  const found = await prisma.service.findFirst({
    where: {
      name: {
        equals: serviceName,
        mode: "insensitive",
      },
    },
  });
  if (found) return found;

  const fallbackMeta = DEFAULT_SERVICE_META[serviceName] || { price: 200, duration: 60 };
  return prisma.service.create({
    data: {
      name: serviceName,
      description: `${serviceName} service`,
      price: fallbackMeta.price,
      duration: fallbackMeta.duration,
    },
  });
};

const resolveService = async ({ serviceId, normalizedServiceName }) => {
  if (serviceId !== undefined && serviceId !== null && serviceId !== "") {
    const serviceIdNum = Number(serviceId);
    if (Number.isNaN(serviceIdNum)) {
      return { error: "serviceId must be numeric" };
    }
    let serviceRecord = await prisma.service.findUnique({ where: { id: serviceIdNum } });
    if (!serviceRecord && normalizedServiceName) {
      serviceRecord = await ensureServiceByName(normalizedServiceName);
    }
    if (!serviceRecord) {
      return { error: "Service not found" };
    }
    return { serviceRecord };
  }

  if (normalizedServiceName) {
    const serviceRecord = await ensureServiceByName(normalizedServiceName);
    return { serviceRecord };
  }

  return { error: "serviceId or service name is required" };
};

const releaseLockByToken = (token) => {
  if (!token) return;
  slotLocks.delete(token);
};

export const lockSlot = async (req, res) => {
  try {
    const { userId, serviceId, service, date, time, startTime, endTime, stylistId, lockMinutes } = req.body;
    const stylistIdNum = parsePositiveInt(stylistId);
    const normalizedServiceName = typeof service === "string" ? service.trim() : "";
    const serviceResolution = await resolveService({ serviceId, normalizedServiceName });
    if (serviceResolution.error) {
      return res.status(400).json({ message: serviceResolution.error });
    }

    const serviceRecord = serviceResolution.serviceRecord;
    const durationMinutes = Number(serviceRecord.duration) > 0 ? Number(serviceRecord.duration) : 60;
    const window = resolveBookingWindow({ date, time, startTime, endTime, durationMinutes });
    if (window.error) {
      return res.status(400).json({ message: window.error });
    }

    const { startObj, endObj } = window;
    const ruleErrors = validateBusinessRules({ startObj, endObj, durationMinutes });
    if (ruleErrors.length > 0) {
      return res.status(400).json({ message: "Slot validation failed", errors: ruleErrors });
    }

    const conflictBooking = await prisma.booking.findFirst({
      where: {
        AND: [
          { startTime: { lt: endObj } },
          { endTime: { gt: startObj } },
          {
            OR: [
              { serviceId: serviceRecord.id },
              ...(stylistIdNum ? [{ stylistId: stylistIdNum }] : []),
            ],
          },
        ],
      },
    });
    if (conflictBooking && normalizedStatusIsActive(conflictBooking.status)) {
      return res.status(409).json({ message: "This slot overlaps an existing booking" });
    }

    const effectiveUserId = await resolveUserId(req, userId);
    const conflictingLock = findConflictingLock({
      serviceId: serviceRecord.id,
      stylistId: stylistIdNum,
      startObj,
      endObj,
      currentUserId: effectiveUserId,
    });

    if (conflictingLock) {
      return res.status(409).json({
        message: "This slot is temporarily reserved by another customer",
        lockedUntil: new Date(conflictingLock.expiresAt).toISOString(),
      });
    }

    const minutes = clampLockMinutes(lockMinutes);
    const token = randomUUID();
    const expiresAt = Date.now() + minutes * 60 * 1000;

    slotLocks.set(token, {
      token,
      userId: effectiveUserId,
      serviceId: serviceRecord.id,
      stylistId: stylistIdNum,
      startTimeMs: startObj.getTime(),
      endTimeMs: endObj.getTime(),
      expiresAt,
    });

    return res.status(201).json({
      message: "Slot locked",
      lockToken: token,
      expiresAt: new Date(expiresAt).toISOString(),
      lockMinutes: minutes,
    });
  } catch (err) {
    return res.status(500).json({ message: "Error locking slot", error: err.message });
  }
};

export const unlockSlot = async (req, res) => {
  const { token } = req.params;
  if (!token) return res.status(400).json({ message: "Lock token is required" });
  const existed = slotLocks.delete(token);
  return res.json({ message: existed ? "Slot unlocked" : "Lock not found or already expired" });
};

// Get all bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching bookings", error: err.message });
  }
};

// Get booking by ID
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({ where: { id: Number(id) } });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: "Error fetching booking", error: err.message });
  }
};

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const { userId, serviceId, service, date, time, startTime, endTime, stylistId, lockToken } = req.body;
    const stylistIdNum = parsePositiveInt(stylistId);
    const normalizedServiceName = typeof service === "string" ? service.trim() : "";
    const errors = [];

    const effectiveUserId = await resolveUserId(req, userId);
    if (!effectiveUserId) {
      errors.push("userId is required when no users exist in the database");
    }

    const serviceResolution = await resolveService({ serviceId, normalizedServiceName });
    if (serviceResolution.error) {
      errors.push(serviceResolution.error);
    }
    const serviceRecord = serviceResolution.serviceRecord;
    const durationMinutes = Number(serviceRecord?.duration) > 0 ? Number(serviceRecord.duration) : 60;

    const window = resolveBookingWindow({ date, time, startTime, endTime, durationMinutes });
    if (window.error) {
      errors.push(window.error);
    }

    const startObj = window.startObj;
    const endObj = window.endObj;

    if (startObj && endObj) {
      errors.push(...validateBusinessRules({ startObj, endObj, durationMinutes }));
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: "Invalid input", errors });
    }

    const user = await prisma.user.findUnique({ where: { id: effectiveUserId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent overlap for same service slot and (when provided) same stylist context.
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        AND: [
          { startTime: { lt: endObj } },
          { endTime: { gt: startObj } },
          {
            OR: [
              { serviceId: serviceRecord.id },
              ...(stylistIdNum ? [{ stylistId: stylistIdNum }] : []),
            ],
          },
        ],
      },
    });

    if (conflictingBooking && normalizedStatusIsActive(conflictingBooking.status)) {
      return res.status(409).json({
        message: "Booking conflicts with an existing appointment",
        conflictBookingId: conflictingBooking.id,
      });
    }

    const conflictingLock = findConflictingLock({
      serviceId: serviceRecord.id,
      stylistId: stylistIdNum,
      startObj,
      endObj,
      excludeToken: lockToken,
      currentUserId: effectiveUserId,
    });
    if (conflictingLock) {
      return res.status(409).json({
        message: "This slot is temporarily reserved by another customer",
        lockedUntil: new Date(conflictingLock.expiresAt).toISOString(),
      });
    }

    if (lockToken) {
      const ownLock = slotLocks.get(lockToken);
      if (!ownLock || ownLock.expiresAt <= Date.now()) {
        return res.status(409).json({ message: "Your slot lock expired. Please select the slot again." });
      }
    }

    const dateObj = new Date(startObj);
    dateObj.setHours(0, 0, 0, 0);

    const booking = await prisma.booking.create({
      data: {
        userId: effectiveUserId,
        serviceId: serviceRecord.id,
        stylistId: stylistIdNum,
        date: dateObj,
        startTime: startObj,
        endTime: endObj,
      },
    });

    releaseLockByToken(lockToken);
    res.status(201).json(booking);
  } catch (err) {
    if (
      err?.code === "P2003" ||
      err?.message?.includes("Foreign key constraint violated") ||
      err?.message?.includes("Booking_userId_fkey")
    ) {
      return res.status(400).json({
        message: "Invalid userId or serviceId. Ensure both records exist.",
      });
    }
    res.status(500).json({ message: "Error creating booking", error: err.message });
  }
};

// Update a booking
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const booking = await prisma.booking.update({
      where: { id: Number(id) },
      data: { status },
    });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: "Error updating booking", error: err.message });
  }
};

// Delete a booking
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.booking.delete({ where: { id: Number(id) } });
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting booking", error: err.message });
  }
};

