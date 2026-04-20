import prisma from "../../config/database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

// 🔐 REGISTER
export async function register(req, res) {
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
}

// 👤 LOGOUT
export async function logout(req, res) {
  try {
    // With JWT there's nothing to invalidate server-side.
    // The client deletes the token from SecureStore (already handled in authThunks).
    // This endpoint exists so the client has a consistent API contract,
    // and so you can add server-side token revocation here in the future.
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}