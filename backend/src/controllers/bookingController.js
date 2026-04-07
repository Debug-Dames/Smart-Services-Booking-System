// backend/src/controllers/booking.controller.js
import prisma from "../config/database.js";
<<<<<<< HEAD
import { createBooking, getBookingsByDate, getMonthlyBookings } from "../modules/bookings/bookings.service.js"

export const getAllBookings = async(req, res) => {
    try {
        const bookings = await prisma.booking.findMany()
        res.json(bookings)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export const getBookingsByDateController = async(req, res) => {
    try {

        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ message: "date is required" });
        }

        const bookings = await getBookingsByDate(date);

        res.json(bookings);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


export const getMonthlyBookingsController = async(req, res) => {
    try {

        const data = await getMonthlyBookings(req.query);

        res.json(data);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


export const getMyBookings = async(req, res) => {
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

export const getBookingById = async(req, res) => {
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

export const createBookingController = async(req, res) => {
    try {
        const payload = {
            ...req.body,
            userId: req.user ?.id ?? req.body?.userId,
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

export const updateBooking = async(req, res) => {
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

export const deleteBooking = async(req, res) => {
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
=======
import { createBooking, lockSlot, unlockSlot } from "../modules/bookings/bookings.service.js";

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
    res.status(500).json({ message: err.message });
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
>>>>>>> e62622b5828e5f667d9cf7ff705437ad65f58a2b
