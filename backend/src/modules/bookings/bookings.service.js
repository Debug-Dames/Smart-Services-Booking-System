import dbPromise from "../../config/database.js";

export async function createAppointment(req, res) {
  const { service, date, time, notes } = req.body;
  const userId = req.user.id;
  const db = await dbPromise;

  if (!service || !date || !time) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  await db.run(
    `INSERT INTO appointments (user_id, service, appointment_date, appointment_time, notes)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, service, date, time, notes || ""]
  );

  res.status(201).json({ message: "Appointment booked successfully" });
}

export async function getMyAppointments(req, res) {
  const db = await dbPromise;

  const appointments = await db.all(
    `SELECT * FROM appointments WHERE user_id = ? ORDER BY appointment_date`,
    [req.user.id]
  );

  res.json(appointments);
}