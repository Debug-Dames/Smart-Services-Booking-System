import prisma from "../../config/database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function resetPassword(req, res) {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password required" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

        if (!user || user.resetToken !== token || user.resetTokenExpiry < new Date()) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        res.status(200).json({ message: "Password has been reset successfully" });

    } catch (err) {
        console.error(err);
        res.status(400).json({ message: "Invalid token" });
    }
}