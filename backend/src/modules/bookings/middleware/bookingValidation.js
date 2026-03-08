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
      const serviceRecord = await prisma.service.findUnique({ where: { id: serviceIdNum } });
      if (!serviceRecord) {
        errors.push("Service not found");
      }
    } else {
      errors.push("serviceId must be numeric");
    }

    const startCandidate = startTime || (date && time ? `${date}T${time}:00` : null);
    const startObj = new Date(startCandidate);
    if (!startCandidate || Number.isNaN(startObj.getTime())) {
      errors.push("Provide startTime (ISO-8601) or date + time");
    }

    const endObj = endTime ? new Date(endTime) : null;
    if (endTime && Number.isNaN(endObj?.getTime())) {
      errors.push("endTime must be a valid ISO-8601 datetime");
    }

    if (!Number.isNaN(startObj.getTime())) {
      const hour = startObj.getUTCHours();
      if (hour < WORKING_HOURS_START || hour >= WORKING_HOURS_END) {
        errors.push(
          `Booking time must be within working hours (${WORKING_HOURS_START}:00-${WORKING_HOURS_END}:00 UTC)`
        );
      }
    }

    if (!Number.isNaN(startObj.getTime()) && endObj && endObj <= startObj) {
      errors.push("endTime must be later than startTime");
    }

    if (!Number.isNaN(startObj.getTime()) && !Number.isNaN(serviceIdNum)) {
      const bookingDate = new Date(startObj);
      bookingDate.setUTCHours(0, 0, 0, 0);

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
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: "Booking validation failed", errors });
    }

    next();
  } catch (err) {
    return res.status(500).json({ message: "Error validating booking", error: err.message });
  }
};

