import prisma from "../../config/database.js";

export const createBooking = async (req, res) => {
  try {
    const { userId, serviceId, date, startTime, endTime } = req.body;
    
    const booking = await prisma.booking.create({
      data: {
        userId: Number(userId),
        serviceId: Number(serviceId),
        date: new Date(date),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Error creating booking", error: error.message });
  }
};