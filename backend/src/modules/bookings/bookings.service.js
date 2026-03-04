import prisma from "../../config/database.js";

// Get all bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching bookings", error: err.message });
  }
};

// Get booking by ID
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({ where: { id: Number(id) } });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: "Error fetching booking", error: err.message });
  }
};

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const { userId, serviceId, date, startTime, endTime } = req.body;
    const effectiveUserId = Number(req.user?.id ?? userId);
    const serviceIdNum = Number(serviceId);

    const dateObj = new Date(`${date}T00:00:00.000Z`);
    const startObj = new Date(startTime);
    const endObj = new Date(endTime);

    if (
      Number.isNaN(effectiveUserId) ||
      Number.isNaN(serviceIdNum) ||
      Number.isNaN(dateObj.getTime()) ||
      Number.isNaN(startObj.getTime()) ||
      Number.isNaN(endObj.getTime())
    ) {
      return res.status(400).json({
        message:
          "Invalid input. Use numeric userId/serviceId and valid date/time formats.",
      });
    }

    const [user, service] = await Promise.all([
      prisma.user.findUnique({ where: { id: effectiveUserId } }),
      prisma.service.findUnique({ where: { id: serviceIdNum } }),
    ]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const booking = await prisma.booking.create({
      data: {
        userId: effectiveUserId,
        serviceId: serviceIdNum,
        date: dateObj,
        startTime: startObj,
        endTime: endObj,
      },
    });
    res.status(201).json(booking);
  } catch (err) {
    if (
      err?.code === "P2003" ||
      err?.message?.includes("Foreign key constraint violated") ||
      err?.message?.includes("Booking_userId_fkey")
    ) {
      return res.status(400).json({
        message: "Invalid userId or serviceId. Ensure both records exist.",
      });
    }
    res.status(500).json({ message: "Error creating booking", error: err.message });
  }
};

// Update a booking
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const booking = await prisma.booking.update({
      where: { id: Number(id) },
      data: { status },
    });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: "Error updating booking", error: err.message });
  }
};

// Delete a booking
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.booking.delete({ where: { id: Number(id) } });
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting booking", error: err.message });
  }
};
