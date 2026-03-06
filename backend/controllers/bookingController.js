const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create Booking
exports.createBooking = async (req, res) => {
  try {
    const booking = await prisma.booking.create({
      data: req.body
    });
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get All Bookings
exports.getBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Booking By ID
exports.getBookingById = async (req, res) => {
  const { id } = req.params;
  try {
    const booking = await prisma.booking.findUnique({ where: { id: parseInt(id) } });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Booking
exports.updateBooking = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedBooking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: req.body
    });
    res.json(updatedBooking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Cancel Booking
exports.cancelBooking = async (req, res) => {
  const { id } = req.params;
  try {
    const cancelledBooking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { status: 'cancelled' }
    });
    res.json(cancelledBooking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete Booking
exports.deleteBooking = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.booking.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};