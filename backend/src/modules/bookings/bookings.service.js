import prisma from "../../config/database.js";

const DEFAULT_SERVICE_META = {
    Haircut: { price: 150, duration: 60 },
    "Hair Styling": { price: 200, duration: 60 },
    "Hair Coloring": { price: 350, duration: 90 },
    Nails: { price: 220, duration: 90 },
    Braids: { price: 350, duration: 180 },
};

// ─────────────────────────────────────
// Create booking
// ─────────────────────────────────────
export const createBooking = async({ userId, serviceId, service, date, time }) => {

    if (!userId) throw new Error("Invalid userId");

    if (!date || !time) {
        throw new Error("Date and time are required");
    }

    const dateObj = new Date(`${date}T00:00:00.000Z`);
    const start = new Date(`${date}T${time}:00.000Z`);

    if (isNaN(dateObj) || isNaN(start)) {
        throw new Error("Invalid date or time");
    }

    // Resolve service
    let serviceRecord = null;

    if (serviceId) {
        serviceRecord = await prisma.service.findUnique({
            where: { id: Number(serviceId) },
        });
    }

    if (!serviceRecord && service) {
        const normalized = service.trim();

        serviceRecord = await prisma.service.findFirst({
            where: { name: { equals: normalized, mode: "insensitive" } },
        });

        if (!serviceRecord) {
            const meta = DEFAULT_SERVICE_META[normalized] || {
                price: 200,
                duration: 60,
            };

            serviceRecord = await prisma.service.create({
                data: {
                    name: normalized,
                    description: `${normalized} service`,
                    price: meta.price,
                    duration: meta.duration,
                },
            });
        }
    }

    if (!serviceRecord) {
        throw new Error("Service not found");
    }

    const duration = serviceRecord.duration || 60;
    const end = new Date(start.getTime() + duration * 60000);

    // daily booking limit
    const nextDay = new Date(dateObj);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    const dailyCount = await prisma.booking.count({
        where: { date: { gte: dateObj, lt: nextDay } },
    });

    if (dailyCount >= 4) {
        throw new Error("This day is fully booked");
    }

    // slot check
    const slotTaken = await prisma.booking.findFirst({
        where: {
            startTime: start,
        },
    });

    if (slotTaken) {
        throw new Error("Time slot already booked");
    }

    return prisma.booking.create({
        data: {
            userId,
            serviceId: serviceRecord.id,
            date: dateObj,
            startTime: start,
            endTime: end,
            status: "PENDING",
        },
    });
};

// ─────────────────────────────────────
// Calendar Monthly Counts
// ─────────────────────────────────────
export const getMonthlyBookings = async({ year, month }) => {

    const y = parseInt(year) || new Date().getUTCFullYear();
    const m = parseInt(month) || new Date().getUTCMonth() + 1;

    const start = new Date(Date.UTC(y, m - 1, 1));
    const end = new Date(Date.UTC(y, m, 1));

    const bookings = await prisma.booking.findMany({
        where: {
            date: { gte: start, lt: end },
        },
        select: { date: true },
    });

    const counts = {};

    bookings.forEach((b) => {
        const day = b.date.toISOString().split("T")[0];
        counts[day] = (counts[day] || 0) + 1;
    });

    return counts;
};

// ─────────────────────────────────────
// Day bookings (calendar slots)
// ─────────────────────────────────────
export const getBookingsByDate = async(date) => {

    const dateObj = new Date(`${date}T00:00:00.000Z`);
    const nextDay = new Date(dateObj);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    const bookings = await prisma.booking.findMany({
        where: {
            date: { gte: dateObj, lt: nextDay },
        },
        include: {
            service: true,
        },
        orderBy: {
            startTime: "asc",
        },
    });

    return bookings.map((b) => ({
        id: b.id,
        date: b.date.toISOString().split("T")[0],
        time: b.startTime.toISOString().substring(11, 16),
        status: b.status,
        service: b.service ?.name || "",
    }));
};