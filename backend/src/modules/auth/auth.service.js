import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dbPromise, { initDB } from "../../config/database.js";
import { env } from "../../config/env.js";

await initDB();

export async function register(req, res) {
  const { name, email, password } = req.body;
  const db = await dbPromise;

  const hashed = await bcrypt.hash(password, 10);

  try {
    await db.run(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashed]
    );

    res.status(201).json({ message: "User registered" });
  } catch {
    res.status(400).json({ message: "User already exists" });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  const db = await dbPromise;

  const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ token });
}