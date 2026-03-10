import prisma from "../config/database.js";
import { createBooking } from "../modules/bookings/bookings.service.js"

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany()
    res.json(bookings)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getMyBookings = async (req, res) => {
  try {
    const userId = Number(req.user?.id);

    if (!Number.isInteger(userId)) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: { service: true },
      orderBy: { date: "desc" },
    });

    return res.json(bookings);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const bookingId = Number(req.params.id);
    if (!Number.isInteger(bookingId)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    })

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    res.json(booking)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const createBookingController = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      userId: req.user?.id ?? req.body?.userId,
    };

    const booking = await createBooking(payload);
    return res.status(201).json(booking);
  } catch (err) {
    if (err.message === "Time slot already booked") {
      return res.status(409).json({ message: err.message });
    }

    if (
      err.message === "Invalid userId" ||
      err.message === "Invalid userId or serviceId" ||
      err.message === "Date is required" ||
      err.message === "Invalid date" ||
      err.message === "Invalid start time" ||
      err.message === "Invalid time range" ||
      err.message === "Cannot book in the past" ||
      err.message === "User not found" ||
      err.message === "Service not found"
    ) {
      return res.status(400).json({ message: err.message });
    }

    return res.status(500).json({ message: "Error creating booking", error: err.message });
  }
};

export const updateBooking = async (req, res) => {
  try {
    const bookingId = Number(req.params.id);
    if (!Number.isInteger(bookingId)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    const { status } = req.body
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status } // only update what is allowed
    })
    res.json(booking)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const deleteBooking = async (req, res) => {
  try {
    const bookingId = Number(req.params.id);
    if (!Number.isInteger(bookingId)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    await prisma.booking.delete({
      where: { id: bookingId }
    })

    res.json({ message: "Booking deleted successfully" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
