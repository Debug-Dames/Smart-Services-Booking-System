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

    const errors = [];

    if (!req.user?.id && (userId === undefined || userId === null || userId === "")) {
      errors.push("userId is required when request is unauthenticated");
    } else if (Number.isNaN(effectiveUserId)) {
      errors.push("userId must be numeric");
    }

    if (serviceId === undefined || serviceId === null || serviceId === "") {
      errors.push("serviceId is required");
    } else if (Number.isNaN(serviceIdNum)) {
      errors.push("serviceId must be numeric");
    }

    if (Number.isNaN(dateObj.getTime())) {
      errors.push("date must be in YYYY-MM-DD format");
    }

    if (Number.isNaN(startObj.getTime())) {
      errors.push("startTime must be a valid ISO-8601 datetime");
    }

    if (Number.isNaN(endObj.getTime())) {
      errors.push("endTime must be a valid ISO-8601 datetime");
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: "Invalid input", errors });
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
