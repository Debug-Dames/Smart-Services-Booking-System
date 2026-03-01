import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dbPromise from "../../config/database.js";
import { env } from "../../config/env.js";

export async function register(req, res) {
  const { name, email, password } = req.body;
  const db = await dbPromise;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await db.run(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ message: "Email already exists" });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  const db = await dbPromise;

  const user = await db.get(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }
  });
}