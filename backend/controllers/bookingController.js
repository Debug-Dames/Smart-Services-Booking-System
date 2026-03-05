import prisma from "../../config/database.js";

// ==========================
// GET ALL BOOKINGS
// GET /api/bookings
// ==========================
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching bookings", error: err.message });
  }
};

// ==========================
// GET BOOKING BY ID
// GET /api/bookings/:id
// ==========================
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({
      where: { id: Number(id) },
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: "Error fetching booking", error: err.message });
  }
};

// ==========================
// CREATE BOOKING
// POST /api/bookings
// ==========================
export const createBooking = async (req, res) => {
  try {
    const { userId, serviceId, date, startTime, endTime } = req.body;

    // Validate input
    if (!userId || !serviceId || !date || !startTime || !endTime) {
      return res.status(400).json({
        message: "Invalid input",
        errors: ["userId, serviceId, date, startTime, and endTime are all required"],
      });
    }

    const uId = Number(userId);
    const sId = Number(serviceId);
    const dateObj = new Date(date);
    const startObj = new Date(startTime);
    const endObj = new Date(endTime);

    if (Number.isNaN(uId) || Number.isNaN(sId) || isNaN(dateObj) || isNaN(startObj) || isNaN(endObj)) {
      return res.status(400).json({
        message: "Invalid input",
        errors: ["userId/serviceId must be numeric and date/startTime/endTime must be valid ISO dates"],
      });
    }

    // Verify user and service exist
    const [user, service] = await Promise.all([
      prisma.user.findUnique({ where: { id: uId } }),
      prisma.service.findUnique({ where: { id: sId } }),
    ]);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!service) return res.status(404).json({ message: "Service not found" });

    const booking = await prisma.booking.create({
      data: {
        userId: uId,
        serviceId: sId,
        date: dateObj,
        startTime: startObj,
        endTime: endObj,
        status: "pending",
      },
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: "Error creating booking", error: err.message });
  }
};

// ==========================
// UPDATE BOOKING STATUS
// PUT /api/bookings/:id
// ==========================
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status field is required" });
    }

    const booking = await prisma.booking.update({
      where: { id: Number(id) },
      data: { status },
    });

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: "Error updating booking", error: err.message });
  }
};

// ==========================
// CANCEL BOOKING
// DELETE /api/bookings/:id
// (sets status to "cancelled")
// ==========================
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.update({
      where: { id: Number(id) },
      data: { status: "cancelled" },
    });

    res.json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (err) {
    res.status(500).json({ message: "Error cancelling booking", error: err.message });
  }
};