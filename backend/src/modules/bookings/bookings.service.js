import prisma from "../../config/database.js";

const DEFAULT_SERVICE_META = {
    Haircut: { price: 150, duration: 60 },
    "Hair Styling": { price: 200, duration: 60 },
    "Hair Coloring": { price: 350, duration: 90 },
    Nails: { price: 220, duration: 90 },
    Braids: { price: 350, duration: 180 },
};

// ─────────────────────────────────────────────────────────────
// GET /api/bookings?date=YYYY-MM-DD   (public – slot availability)
// ─────────────────────────────────────────────────────────────
export const getAllBookings = async(req, res) => {
    try {
        const { date } = req.query;
        let where = {};

        if (date) {
            const dateObj = new Date(`${date}T00:00:00.000Z`);
            const nextDay = new Date(dateObj);
            nextDay.setUTCDate(nextDay.getUTCDate() + 1);
            where = { date: { gte: dateObj, lt: nextDay } };
        }

        const bookings = await prisma.booking.findMany({
            where,
            select: {
                id: true,
                date: true,
                startTime: true,
                endTime: true,
                status: true,
                service: { select: { name: true } }
            },
            orderBy: { startTime: "asc" }
        });

        const result = bookings.map(b => ({
            id: b.id,
            date: b.date.toISOString().split("T")[0],
            // Time is stored as UTC – keep it UTC when displaying so it matches what was picked
            time: b.startTime.toISOString().substring(11, 16),
            startTime: b.startTime,
            endTime: b.endTime,
            status: b.status,
            service: b.service ? .name || ""
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: "Error fetching bookings", error: err.message });
    }
};

// ─────────────────────────────────────────────────────────────
// GET /api/bookings/mine   (protected – current user's bookings)
// ─────────────────────────────────────────────────────────────
export const getMyBookings = async(req, res) => {
    try {
        const userId = req.user ? .id;
        if (!userId) return res.status(401).json({ message: "Not authenticated" });

        const bookings = await prisma.booking.findMany({
            where: { userId },
            select: {
                id: true,
                date: true,
                startTime: true,
                status: true,
                service: { select: { name: true, price: true } }
            },
            orderBy: { date: "desc" }
        });

        const result = bookings.map(b => ({
            id: b.id,
            date: b.date.toISOString().split("T")[0],
            time: b.startTime.toISOString().substring(11, 16),
            status: b.status,
            service: b.service ? .name || "Appointment",
            price: b.service ? .price || 0,
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: "Error fetching your bookings", error: err.message });
    }
};

// ─────────────────────────────────────────────────────────────
// GET /api/bookings/monthly?year=YYYY&month=MM   (public)
// ─────────────────────────────────────────────────────────────
export const getMonthlyBookings = async(req, res) => {
    try {
        const { year, month } = req.query;
        const y = parseInt(year) || new Date().getUTCFullYear();
        const m = parseInt(month) || new Date().getUTCMonth() + 1;

        const start = new Date(Date.UTC(y, m - 1, 1));
        const end = new Date(Date.UTC(y, m, 1));

        const bookings = await prisma.booking.findMany({
            where: { date: { gte: start, lt: end } },
            select: { date: true }
        });

        const counts = {};
        bookings.forEach(b => {
            const day = b.date.toISOString().split("T")[0];
            counts[day] = (counts[day] || 0) + 1;
        });

        res.json(counts);
    } catch (err) {
        res.status(500).json({ message: "Error fetching monthly data", error: err.message });
    }
};

// ─────────────────────────────────────────────────────────────
// GET /api/bookings/:id
// ─────────────────────────────────────────────────────────────
export const getBookingById = async(req, res) => {
    try {
        const { id } = req.params;
        const booking = await prisma.booking.findUnique({ where: { id: Number(id) } });
        if (!booking) return res.status(404).json({ message: "Booking not found" });
        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: "Error fetching booking", error: err.message });
    }
};

// ─────────────────────────────────────────────────────────────
// POST /api/bookings   (protected)
// ─────────────────────────────────────────────────────────────
export const createBooking = async(req, res) => {
    try {
        const { serviceId, service, date, time } = req.body;
        const normalizedName = typeof service === "string" ? service.trim() : "";

        const userId = req.user ? .id;
        if (!userId) return res.status(401).json({ message: "Authentication required" });

        // ── Resolve service ─────────────────────────────────────
        const ensureService = async(name) => {
            if (!name) return null;
            const found = await prisma.service.findFirst({
                where: { name: { equals: name, mode: "insensitive" } }
            });
            if (found) return found;
            const meta = DEFAULT_SERVICE_META[name] || { price: 200, duration: 60 };
            return prisma.service.create({
                data: { name, description: `${name} service`, price: meta.price, duration: meta.duration }
            });
        };

        let serviceRecord = null;
        if (serviceId) {
            serviceRecord = await prisma.service.findUnique({ where: { id: Number(serviceId) } });
        }
        if (!serviceRecord && normalizedName) {
            serviceRecord = await ensureService(normalizedName);
        }
        if (!serviceRecord) {
            return res.status(400).json({ message: "Service name or ID is required" });
        }

        // ── Build UTC-safe datetimes ─────────────────────────────
        // Append 'Z' so the time is ALWAYS treated as UTC regardless of server timezone
        if (!date || !time) {
            return res.status(400).json({ message: "date (YYYY-MM-DD) and time (HH:MM) are required" });
        }

        const dateObj = new Date(`${date}T00:00:00.000Z`);
        const startObj = new Date(`${date}T${time}:00.000Z`); // ← explicit UTC
        const durationMins = Number(serviceRecord.duration) > 0 ? Number(serviceRecord.duration) : 60;
        const endObj = new Date(startObj.getTime() + durationMins * 60 _000);

        if (isNaN(dateObj.getTime()) || isNaN(startObj.getTime())) {
            return res.status(400).json({ message: "Invalid date or time format" });
        }

        // ── Check daily limit ────────────────────────────────────
        const nextDay = new Date(dateObj);
        nextDay.setUTCDate(nextDay.getUTCDate() + 1);

        const dailyCount = await prisma.booking.count({
            where: { date: { gte: dateObj, lt: nextDay } }
        });
        if (dailyCount >= 4) {
            return res.status(400).json({ message: "This day is fully booked (max 4 appointments)" });
        }

        // ── Check slot conflict ──────────────────────────────────
        const slotTaken = await prisma.booking.findFirst({
            where: { startTime: startObj }
        });
        if (slotTaken) {
            return res.status(400).json({ message: "This time slot is already booked" });
        }

        // ── Create booking ───────────────────────────────────────
        const booking = await prisma.booking.create({
            data: { userId, serviceId: serviceRecord.id, date: dateObj, startTime: startObj, endTime: endObj, status: "pending" }
        });

        res.status(201).json({
            ...booking,
            service: serviceRecord.name,
            time: startObj.toISOString().substring(11, 16)
        });

    } catch (err) {
        console.error("Create booking error:", err);
        res.status(500).json({ message: "Error creating booking", error: err.message });
    }
};

// ─────────────────────────────────────────────────────────────
// PUT / DELETE
// ─────────────────────────────────────────────────────────────
export const updateBooking = async(req, res) => {
    try {
        const booking = await prisma.booking.update({
            where: { id: Number(req.params.id) },
            data: { status: req.body.status }
        });
        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: "Error updating booking", error: err.message });
    }
};

export const deleteBooking = async(req, res) => {
    try {
        await prisma.booking.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: "Booking deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting booking", error: err.message });
    }
};