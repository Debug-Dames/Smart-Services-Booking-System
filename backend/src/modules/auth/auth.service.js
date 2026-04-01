import prisma from "../../config/database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

// 🔐 REGISTER
export async function register(req, res) {
<<<<<<< HEAD
  try {
    await ensureUserSchemaCompatibility();

    const rawName = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const firstName = typeof req.body?.firstName === "string" ? req.body.firstName.trim() : "";
    const lastName = typeof req.body?.lastName === "string" ? req.body.lastName.trim() : "";
    const name = rawName || `${firstName} ${lastName}`.trim();
    const email = req.body?.email?.trim()?.toLowerCase();
    const rawPassword = typeof req.body?.password === "string" ? req.body.password : "";
    const password = rawPassword.trim();
    const phone = req.body?.phone?.trim();
    const gender = req.body?.gender || null;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        message: "Name, email, password and phone are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUsers = await prisma.$queryRaw`
      SELECT id
      FROM "User"
      WHERE email = ${email}
      LIMIT 1
    `;

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUsers = await prisma.$queryRaw`
      INSERT INTO "User" ("name", "email", "password", "phone", "gender", "updatedAt")
      VALUES (${name}, ${email}, ${hashedPassword}, ${phone}, ${gender}, CURRENT_TIMESTAMP)
      RETURNING id, name, email, phone, gender, role::text AS role
    `;
    const user = createdUsers[0];

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    if (error?.code === "P2002") {
      return res.status(400).json({ message: "User already exists" });
    }
    return res.status(500).json({
      message: "Server error",
      ...(process.env.NODE_ENV === "development" ? { error: error.message } : {}),
    });
  }
}

// -------------------- LOGIN --------------------
export async function login(req, res) {
  try {
    let { email, password } = req.body;

    email = email?.trim().toLowerCase();
    const rawPassword = typeof password === "string" ? password : "";
    const normalizedPassword = rawPassword.trim();

    if (!email || !rawPassword) {
      return res.status(400).json({
        message: "Email and password required",
      });
    }

    const users = await prisma.$queryRaw`
      SELECT id, name, email, password, role::text AS role
      FROM "User"
      WHERE email = ${email}
      LIMIT 1
    `;
    const user = users[0];

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
        ...(process.env.NODE_ENV === "development" ? { reason: "email_not_found" } : {}),
      });
    }

    let isMatch = false;
=======
>>>>>>> 745975f65fd934f64e73d81887b124bcdfd6cc68
    try {
        const { name, email, password, phone, gender } = req.body;

        // Validate required fields
        if (!name || !email || !password || !phone) {
            return res.status(400).json({
                message: "Name, email, password and phone are required"
            });
        }

        // Check existing user
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone,
                gender,
                role: "CUSTOMER"
            }
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                gender: user.gender,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: "Server error" });
    }
}

export async function login(req, res) {
    try {
        let { email, password } = req.body;

        email = email?.trim().toLowerCase();

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password required"
            });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
        // console.log("JWT_SECRET =", process.env.JWT_SECRET);

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
}


// 👤 GET PROFILE
export async function getProfile(req, res) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                gender: true,
                role: true,
                createdAt: true,
            }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ user });

    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ message: "Server error" });
    }
<<<<<<< HEAD

    // Backward compatibility: some older records may store plain text passwords.
    if (
      !isMatch &&
      (user.password === rawPassword || (normalizedPassword && user.password === normalizedPassword))
    ) {
      isMatch = true;
      const upgradedHash = await bcrypt.hash(normalizedPassword || rawPassword, 10);
      await prisma.$executeRaw`
        UPDATE "User"
        SET password = ${upgradedHash}, "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = ${user.id}
      `;
    }

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
        ...(process.env.NODE_ENV === "development" ? { reason: "password_mismatch" } : {}),
      });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
=======
>>>>>>> 745975f65fd934f64e73d81887b124bcdfd6cc68
}
