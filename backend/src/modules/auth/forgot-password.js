import prisma from "../../config/database.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

export async function forgotPassword(req, res) {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return res.status(404).json({ message: "No account with that email" });

    // Generate JWT token valid for 1 hour
    const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    // Save token and expiry in DB
    const expiry = new Date(Date.now() + 3600 * 1000); // 1 hour
    await prisma.user.update({
        where: { id: user.id },
        data: { resetToken: token, resetTokenExpiry: expiry }
    });

    // Send email
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const message = {
        from: process.env.SMTP_USER,
        to: user.email,
        subject: "Password Reset Request",
        text: `You requested a password reset. Click here to reset: ${resetUrl}`,
        html: `<p>You requested a password reset.</p><p><a href="${resetUrl}">Click here to reset your password</a></p>`
    };

    try {
        await transporter.sendMail(message);
        res.status(200).json({ message: "Password reset email sent" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error sending email" });
    }
}