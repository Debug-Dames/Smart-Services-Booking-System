// backend/src/controllers/booking.controller.js
import prisma from "../config/database.js";
<<<<<<< HEAD
import * as bookingService from "../modules/bookings/bookingService.js";
=======
import { createBooking, lockSlot, unlockSlot } from "../modules/bookings/bookings.service.js";
>>>>>>> ce812cbce06a0241ba33d22c99ecefe74bccddf7

/**
 * Get all bookings
 */
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
        stylist: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get booking by ID
 */
export const getBookingById = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
        stylist: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (err) {
<<<<<<< HEAD
    res.status(500).json({ message: err.message })
  }
}

export const createBookingController = async (req, res) => {
  try {
    const userId = req.user.id; // from protect middleware
    const { serviceId, date, startTime, endTime } = req.body;

    console.log("Incoming booking:", req.body); // 🔍 debug

    const booking = await bookingService.createBooking({
      userId,
      serviceId,
      date,
      startTime,
      endTime
    });

    return res.status(201).json(booking);

  } catch (error) {
    console.error("Booking error:", error.message);

    if (error.message === "Time slot already booked") {
      return res.status(409).json({ message: error.message });
    }

    if (error.message === "Cannot book in the past") {
      return res.status(400).json({ message: error.message });
    }

    if (error.message === "End time must be after start time") {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({
      message: "Failed to create booking",
      error: error.message
    });
=======
    res.status(500).json({ message: err.message });
>>>>>>> ce812cbce06a0241ba33d22c99ecefe74bccddf7
  }
};

/**
 * Lock a slot
 */
export const lockSlotController = async (req, res) => {
  try {
    const lock = await lockSlot(req.body, req.user);
    res.status(201).json(lock);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Unlock a slot
 */
export const unlockSlotController = async (req, res) => {
  try {
    const result = await unlockSlot(req.params.token);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Create booking
 * Requires that the user locked the slot first
 */
export const createBookingController = async (req, res) => {
  try {
    const booking = await createBooking(req.body, req.user);
    res.status(201).json(booking);
  } catch (err) {
    if (
      err.message === "Time slot already booked" ||
      err.message === "You must lock the slot before booking"
    ) {
      return res.status(409).json({ message: err.message });
    }
    if (err.message === "Cannot book in the past" || err.message === "Invalid time range") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};

/**
 * Update a booking
 */
export const updateBooking = async (req, res) => {
  try {
    const { startTime, endTime, status, stylistId } = req.body;
    const dataToUpdate = {};

    if (startTime) dataToUpdate.startTime = new Date(startTime);
    if (endTime) dataToUpdate.endTime = new Date(endTime);
    if (status) dataToUpdate.status = status;

    if (stylistId !== undefined) {
      if (stylistId === null || stylistId === "") {
        dataToUpdate.stylistId = null;
      } else {
        const parsedStylistId = Number(stylistId);
        if (!Number.isInteger(parsedStylistId) || parsedStylistId <= 0) {
          return res.status(400).json({ message: "stylistId must be a positive integer or null" });
        }

        const stylist = await prisma.stylist.findUnique({
          where: { id: parsedStylistId },
          select: { id: true },
        });

        if (!stylist) {
          return res.status(404).json({ message: "Stylist not found" });
        }

        dataToUpdate.stylistId = parsedStylistId;
      }
    }

    const booking = await prisma.booking.update({
      where: { id: Number(req.params.id) },
      data: dataToUpdate,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
        stylist: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Delete a booking
 */
export const deleteBooking = async (req, res) => {
  try {
    await prisma.booking.delete({
      where: { id: Number(req.params.id) },
    });
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
