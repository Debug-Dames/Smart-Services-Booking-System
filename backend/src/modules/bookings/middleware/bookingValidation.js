import prisma from "../../../config/database.js";

const WORKING_HOURS_START = 8;
const WORKING_HOURS_END = 20;

export const validateBooking = async (req, res, next) => {
  try {
    const { serviceId, date, time, startTime, endTime } = req.body;
    const errors = [];

    if (serviceId === undefined || serviceId === null || serviceId === "") {
      errors.push("serviceId is required");
    }

    const serviceIdNum = Number(serviceId);
    if (!Number.isNaN(serviceIdNum)) {
      try {
        const serviceRecord = await prisma.service.findUnique({ where: { id: serviceIdNum } });
        if (!serviceRecord) {
          errors.push("Service not found");
        }
      } catch (err) {
        console.warn("Service lookup failed during booking validation:", err?.message || err);
      }
    } else {
      errors.push("serviceId must be numeric");
    }

    function buildDateTime(input, dateStr) {
      if (!input) return null;
      if (typeof input === "string" && /^\d{2}:\d{2}$/.test(input)) {
        if (!dateStr) return null;
        return new Date(`${dateStr}T${input}:00`);
      }
      const dt = new Date(input);
      return Number.isNaN(dt.getTime()) ? null : dt;
    }

    if (!date) {
      errors.push("date is required");
    }

    const startObj =
      buildDateTime(startTime, date) ||
      (date && time ? buildDateTime(`${date}T${time}:00`) : null);
    if (!startObj) {
      errors.push("Provide startTime (ISO-8601 or HH:mm) or date + time");
    }

    const endObj = buildDateTime(endTime, date);
    if (endTime && !endObj) {
      errors.push("endTime must be a valid ISO-8601 datetime or HH:mm");
    }

    if (startObj) {
      const hour = startObj.getHours();
      if (hour < WORKING_HOURS_START || hour >= WORKING_HOURS_END) {
        errors.push(
          `Booking time must be within working hours (${WORKING_HOURS_START}:00-${WORKING_HOURS_END}:00)`
        );
      }
    }

    if (startObj && endObj && endObj <= startObj) {
      errors.push("endTime must be later than startTime");
    }

    if (startObj && !Number.isNaN(serviceIdNum)) {
      try {
        const bookingDate = new Date(startObj);
        bookingDate.setHours(0, 0, 0, 0);

        const existingBooking = await prisma.booking.findFirst({
          where: {
            serviceId: serviceIdNum,
            date: bookingDate,
            startTime: startObj,
          },
        });

        if (existingBooking) {
          errors.push("This time slot is already booked");
        }
      } catch (err) {
        console.warn("Booking overlap check failed during validation:", err?.message || err);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: "Booking validation failed", errors });
    }

    next();
  } catch (err) {
    return res.status(500).json({ message: "Error validating booking", error: err.message });
  }
};

