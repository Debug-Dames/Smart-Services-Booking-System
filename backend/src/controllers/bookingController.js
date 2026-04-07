import prisma from "../config/database.js";
import * as bookingService from "../modules/bookings/bookingService.js";

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
  }
};

export const updateBooking = async (req, res) => {
  try {
    const bookingId = Number(req.params.id);
    if (!Number.isInteger(bookingId)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const { date, time, startTime, endTime } = req.body || {};
    const hasTimeInput = Boolean(time || startTime || endTime);
    const hasDateInput = Boolean(date);

    if (!hasDateInput && !hasTimeInput) {
      return res.status(400).json({ message: "Date or time update is required" });
    }

    const durationMs =
      booking?.startTime && booking?.endTime
        ? new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()
        : 60 * 60000;

    const bookingDate = hasDateInput
      ? new Date(`${date}T00:00:00.000Z`)
      : new Date(booking.date);

    if (Number.isNaN(bookingDate.getTime())) {
      return res.status(400).json({ message: "Invalid date" });
    }

    let start = booking.startTime ? new Date(booking.startTime) : null;
    if (time) {
      start = new Date(`${date || bookingDate.toISOString().slice(0, 10)}T${time}:00`);
    } else if (startTime) {
      if (typeof startTime === "string" && /^\d{2}:\d{2}/.test(startTime)) {
        const baseDate = (date || bookingDate.toISOString().slice(0, 10));
        start = new Date(`${baseDate}T${startTime}:00`);
      } else {
        start = new Date(startTime);
      }
    }

    if (start && Number.isNaN(start.getTime())) {
      return res.status(400).json({ message: "Invalid start time" });
    }

    let end = booking.endTime ? new Date(booking.endTime) : null;
    if (endTime) {
      if (typeof endTime === "string" && /^\d{2}:\d{2}/.test(endTime)) {
        const baseDate = (date || bookingDate.toISOString().slice(0, 10));
        end = new Date(`${baseDate}T${endTime}:00`);
      } else {
        end = new Date(endTime);
      }
    } else if (start) {
      end = new Date(start.getTime() + durationMs);
    }

    if (end && start && end <= start) {
      return res.status(400).json({ message: "Invalid time range" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDay = new Date(bookingDate);
    bookingDay.setHours(0, 0, 0, 0);
    if (bookingDay < today) {
      return res.status(400).json({ message: "Cannot book in the past" });
    }

    function isMissingTimeFieldError(err) {
      const msg = String(err?.message || "");
      return (
        msg.includes("Unknown argument `startTime`") ||
        msg.includes("Unknown argument `endTime`") ||
        msg.includes("Unknown arg `startTime`") ||
        msg.includes("Unknown arg `endTime`") ||
        msg.includes('column "startTime" does not exist') ||
        msg.includes('column "endTime" does not exist')
      );
    }

    if (start && end) {
      try {
        const overlap = await prisma.booking.findFirst({
          where: {
            id: { not: bookingId },
            serviceId: booking.serviceId,
            startTime: { lt: end },
            endTime: { gt: start },
          },
        });
        if (overlap) {
          return res.status(409).json({ message: "Time slot already booked" });
        }
      } catch (err) {
        if (!isMissingTimeFieldError(err)) {
          throw err;
        }
      }
    }

    try {
      const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          date: bookingDate,
          ...(start ? { startTime: start } : {}),
          ...(end ? { endTime: end } : {}),
        },
        include: { service: true },
      });
      return res.json(updated);
    } catch (err) {
      if (!isMissingTimeFieldError(err)) {
        throw err;
      }

      const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: { date: bookingDate },
        include: { service: true },
      });
      return res.json(updated);
    }
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
