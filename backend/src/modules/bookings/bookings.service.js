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

export async function createAppointment(req, res) {
  const { service, date, time, notes } = req.body;
  const userId = req.user.id;
  const db = await dbPromise;

  if (!service || !date || !time) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const isBooked = await hasSlotConflict(db, { date, time });
  if (isBooked) {
    return res.status(409).json({ message: "Selected slot is already booked" });
  }

  await db.run(
    `INSERT INTO appointments (user_id, service, appointment_date, appointment_time, status, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, service, date, time, "Pending", notes || ""]
  );

  res.status(201).json({ message: "Appointment booked successfully" });
}

export async function getMyAppointments(req, res) {
  const db = await dbPromise;

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
