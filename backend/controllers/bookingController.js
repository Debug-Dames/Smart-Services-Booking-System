import prisma from "../../config/database.js";

export const createBooking = async (req, res) => {
  try {
    const { userId, serviceId, date, startTime, endTime } = req.body;

    const uId = Number(userId);
    const sId = Number(serviceId);
    const d = new Date(date);
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(uId) || isNaN(sId) || isNaN(d) || isNaN(start) || isNaN(end)) {
      return res.status(400).json({
        message: "Invalid input. Use numeric userId/serviceId and valid date/time formats."
      });
    }

    const booking = await prisma.booking.create({
      data: {
        userId: uId,
        serviceId: sId,
        date: d,
        startTime: start,
        endTime: end
      }
    });

    res.status(201).json(booking);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating booking", error: error.message });
  }
};