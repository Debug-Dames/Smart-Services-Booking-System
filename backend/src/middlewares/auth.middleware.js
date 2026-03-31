import jwt from "jsonwebtoken";
import prisma from "../config/database.js";
import { env } from "../config/env.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, env.JWT_SECRET);
    const decodedUserId = Number(decoded?.userId ?? decoded?.id);

    if (Number.isNaN(decodedUserId)) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: decodedUserId },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(401).json({ message: "Not authorized" });
  }
};
