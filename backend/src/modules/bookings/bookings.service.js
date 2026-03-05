<<<<<<< HEAD
import dbPromise, { initDB } from "../../config/database.js";

await initDB();

const VALID_STATUSES = new Set(["Pending", "Confirmed", "Cancelled", "Completed", "Rejected"]);

function normalizeStatus(status) {
  if (!status) return null;
  const value = String(status).trim().toLowerCase();
  if (value === "pending") return "Pending";
  if (value === "confirmed") return "Confirmed";
  if (value === "cancelled") return "Cancelled";
  if (value === "completed") return "Completed";
  if (value === "rejected") return "Rejected";
  return null;
}

async function hasSlotConflict(db, { date, time, excludeId = null }) {
  const params = [date, time];
  let sql = `
    SELECT id
    FROM appointments
    WHERE appointment_date = ?
      AND appointment_time = ?
      AND LOWER(COALESCE(status, 'pending')) NOT IN ('cancelled', 'rejected')
  `;

  if (excludeId !== null) {
    sql += ` AND id != ?`;
    params.push(excludeId);
  }

  sql += ` LIMIT 1`;
  const conflict = await db.get(sql, params);
  return Boolean(conflict);
}
=======
import prisma from "../../config/database.js";
>>>>>>> 3c5ed21b3d16e53a3fe6e5f915627005c1687a98

const DEFAULT_SERVICE_META = {
  Haircut: { price: 150, duration: 60 },
  Nails: { price: 220, duration: 90 },
  Braids: { price: 350, duration: 180 },
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

<<<<<<< HEAD
  const isBooked = await hasSlotConflict(db, { date, time });
  if (isBooked) {
    return res.status(409).json({ message: "Selected slot is already booked" });
  }

  await db.run(
    `INSERT INTO appointments (user_id, service, appointment_date, appointment_time, status, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, service, date, time, "Pending", notes || ""]
  );
=======
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
>>>>>>> 3c5ed21b3d16e53a3fe6e5f915627005c1687a98

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const { userId, serviceId, service, date, time, startTime, endTime } = req.body;
    const normalizedServiceName = typeof service === "string" ? service.trim() : "";
    const errors = [];
    let effectiveUserId = Number(req.user?.id ?? userId);
    let serviceRecord = null;

    // Support unauthenticated requests by falling back to the first existing user.
    if (Number.isNaN(effectiveUserId)) {
      const fallbackUser = await prisma.user.findFirst({ orderBy: { id: "asc" } });
      if (fallbackUser) {
        effectiveUserId = fallbackUser.id;
      } else {
        errors.push("userId is required when no users exist in the database");
      }
    }

<<<<<<< HEAD
  const appointments = await db.all(
    `SELECT * FROM appointments WHERE user_id = ? ORDER BY appointment_date DESC, appointment_time DESC`,
    [req.user.id]
  );

  res.json(appointments);
}

export async function getAllAppointments(_req, res) {
  const db = await dbPromise;

  const appointments = await db.all(`
    SELECT
      a.id,
      a.user_id AS userId,
      u.name AS userName,
      u.email AS userEmail,
      a.service,
      a.appointment_date AS date,
      a.appointment_time AS time,
      a.status,
      a.notes,
      a.created_at AS createdAt
    FROM appointments a
    LEFT JOIN users u ON u.id = a.user_id
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `);

  res.json(appointments);
}

export async function updateAppointment(req, res) {
  const { id } = req.params;
  const { service, date, time, notes, status } = req.body;
  const db = await dbPromise;

  const current = await db.get(`SELECT * FROM appointments WHERE id = ?`, [id]);
  if (!current) {
    return res.status(404).json({ message: "Booking not found" });
  }

  const nextService = service ?? current.service;
  const nextDate = date ?? current.appointment_date;
  const nextTime = time ?? current.appointment_time;
  const nextNotes = notes ?? current.notes ?? "";
  const normalizedStatus = status ? normalizeStatus(status) : normalizeStatus(current.status) || "Pending";

  if (!nextService || !nextDate || !nextTime) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!normalizedStatus || !VALID_STATUSES.has(normalizedStatus)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  const isBooked = await hasSlotConflict(db, { date: nextDate, time: nextTime, excludeId: Number(id) });
  if (isBooked) {
    return res.status(409).json({ message: "Selected slot is already booked" });
  }

  await db.run(
    `UPDATE appointments
     SET service = ?, appointment_date = ?, appointment_time = ?, notes = ?, status = ?
     WHERE id = ?`,
    [nextService, nextDate, nextTime, nextNotes, normalizedStatus, id]
  );

  const updated = await db.get(
    `SELECT id, user_id AS userId, service, appointment_date AS date, appointment_time AS time, status, notes
     FROM appointments
     WHERE id = ?`,
    [id]
  );

  res.json(updated);
}

export async function updateAppointmentStatus(req, res) {
  const { id } = req.params;
  const normalizedStatus = normalizeStatus(req.body.status);
  const db = await dbPromise;

  if (!normalizedStatus || !VALID_STATUSES.has(normalizedStatus)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  const current = await db.get(`SELECT id FROM appointments WHERE id = ?`, [id]);
  if (!current) {
    return res.status(404).json({ message: "Booking not found" });
  }

  await db.run(`UPDATE appointments SET status = ? WHERE id = ?`, [normalizedStatus, id]);
  res.json({ message: "Booking status updated", status: normalizedStatus });
}

export async function cancelAppointment(req, res) {
  req.body.status = "Cancelled";
  return updateAppointmentStatus(req, res);
}
=======
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

    if (serviceId !== undefined && serviceId !== null && serviceId !== "") {
      const serviceIdNum = Number(serviceId);
      if (Number.isNaN(serviceIdNum)) {
        errors.push("serviceId must be numeric");
      } else {
        serviceRecord = await prisma.service.findUnique({ where: { id: serviceIdNum } });
      }
      // If provided ID is stale, use service name if present.
      if (!serviceRecord && normalizedServiceName) {
        serviceRecord = await ensureServiceByName(normalizedServiceName);
      }
      if (!serviceRecord && !Number.isNaN(serviceIdNum)) {
        errors.push("Service not found");
      }
    } else if (normalizedServiceName) {
      serviceRecord = await ensureServiceByName(normalizedServiceName);
    } else {
      errors.push("serviceId or service name is required");
    }

    const dateObj = new Date(`${date}T00:00:00.000Z`);
    if (Number.isNaN(dateObj.getTime())) {
      errors.push("date must be in YYYY-MM-DD format");
    }

    const startCandidate = startTime || (date && time ? `${date}T${time}:00` : null);
    const startObj = new Date(startCandidate);
    if (!startCandidate || Number.isNaN(startObj.getTime())) {
      errors.push("Provide startTime (ISO-8601) or date + time");
    }

    const endCandidate =
      endTime ||
      (Number.isNaN(startObj.getTime())
        ? null
        : new Date(
            startObj.getTime() + (Number(serviceRecord?.duration) > 0 ? Number(serviceRecord.duration) : 60) * 60000
          ).toISOString());
    const endObj = new Date(endCandidate);
    if (!endCandidate || Number.isNaN(endObj.getTime())) {
      errors.push("Provide endTime (ISO-8601) or a valid time to auto-calculate duration");
    }

    if (!Number.isNaN(startObj.getTime()) && !Number.isNaN(endObj.getTime()) && endObj <= startObj) {
      errors.push("endTime must be later than startTime");
    }

    if (Number.isNaN(effectiveUserId)) {
      errors.push("userId must be numeric");
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: "Invalid input", errors });
    }

    const user = await prisma.user.findUnique({ where: { id: effectiveUserId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!serviceRecord) {
      return res.status(404).json({ message: "Service not found" });
    }

    const booking = await prisma.booking.create({
      data: {
        userId: effectiveUserId,
        serviceId: serviceRecord.id,
        date: dateObj,
        startTime: startObj,
        endTime: endObj,
      },
    });
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
>>>>>>> 3c5ed21b3d16e53a3fe6e5f915627005c1687a98
