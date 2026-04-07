import prisma from "../config/database.js";

const WORKING_HOURS_START = 8;
const WORKING_HOURS_END = 20;

export const validateBooking = async (req, res, next) => {
    try {
        const { serviceId, service, date, time, startTime, endTime, stylistId } = req.body;
        const errors = [];

        if (
            (serviceId === undefined || serviceId === null || serviceId === "") &&
            (typeof service !== "string" || service.trim() === "")
        ) {
            errors.push("serviceId or service name is required");
        }

        const serviceIdNum = Number(serviceId);
        if (serviceId !== undefined && serviceId !== null && serviceId !== "") {
            if (Number.isNaN(serviceIdNum)) {
                errors.push("serviceId must be numeric");
            } else {
                const serviceRecord = await prisma.service.findUnique({ where: { id: serviceIdNum } });
                if (!serviceRecord) {
                    errors.push("Service not found");
                }
            }
        }

        if (stylistId !== undefined && stylistId !== null && stylistId !== "") {
            const stylistIdNum = Number(stylistId);
            if (!Number.isInteger(stylistIdNum) || stylistIdNum <= 0) {
                errors.push("stylistId must be a positive integer when provided");
            }
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
            const now = Date.now();
            if (startObj.getTime() < now) {
                errors.push("Past date/time bookings are not allowed");
            }

            const startHour = startObj.getHours() + startObj.getMinutes() / 60;
            const inferredEnd = endObj || new Date(startObj.getTime() + 60 * 60000);
            const endHour = inferredEnd.getHours() + inferredEnd.getMinutes() / 60;
            if (startHour < WORKING_HOURS_START || endHour > WORKING_HOURS_END) {
                errors.push(
                    `Booking time must be within working hours (${WORKING_HOURS_START}:00-${WORKING_HOURS_END}:00 local time)`
                );
            }
        }

        if (!Number.isNaN(startObj.getTime()) && endObj && endObj <= startObj) {
            errors.push("endTime must be later than startTime");
        }

        if (!Number.isNaN(startObj.getTime()) && !Number.isNaN(serviceIdNum)) {
            const bookingDate = new Date(startObj);
            bookingDate.setHours(0, 0, 0, 0);

            const existingBooking = await prisma.booking.findFirst({
                where: {
                    serviceId: serviceIdNum,
                    date: bookingDate
                },
            });

            if (existingBooking) {
                // Detailed overlap checks happen in createBooking; this is a quick early warning.
                if (startObj >= existingBooking.startTime && startObj < existingBooking.endTime) {
                    errors.push("This time slot is already booked");
                }
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
