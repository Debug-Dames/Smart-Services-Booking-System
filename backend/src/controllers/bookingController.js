import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create booking
export const createBooking = async(req, res) => {
    try {
        const { date, userId, serviceId } = req.body;

        const booking = await prisma.booking.create({
            data: {
                date: new Date(date),
                userId: Number(userId),
                serviceId: Number(serviceId),
            },
        });

        res.status(201).json(booking);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create booking" });
    }
};

// Get all bookings
export const getBookings = async(req, res) => {
    try {
        const bookings = await prisma.booking.findMany({
            include: {
                user: true,
                service: true,
            },
        });

        res.json(bookings);

    } catch (error) {
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
};