import dbPromise from "../../config/database.js";

export async function submitContact(req, res) {
  const { name, email, message } = req.body;
  const db = await dbPromise;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields required" });
  }

  await db.run(
    `INSERT INTO contacts (name, email, message)
     VALUES (?, ?, ?)`,
    [name, email, message]
  );

  res.status(201).json({ message: "Message sent successfully" });
}