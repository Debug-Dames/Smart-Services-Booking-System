const express = require("express");
const { db, createId } = require("../../config/database");
const { requireAuth } = require("../../middlewares/auth.middleware");
const { requireRole } = require("../../middlewares/role.middleware");

const router = express.Router();

const hasOverlap = (existingBooking, startAt, endAt) => {
  if (existingBooking.status === "cancelled") return false;
  const existingStart = new Date(existingBooking.startAt).getTime();
  const existingEnd = new Date(existingBooking.endAt).getTime();
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  return start < existingEnd && end > existingStart;
};

router.use(requireAuth);

router.get("/", (req, res) => {
  if (req.user.role === "admin" || req.user.role === "staff") {
    return res.json({ bookings: db.bookings });
  }
  const bookings = db.bookings.filter((item) => item.customerUserId === req.user.id);
  return res.json({ bookings });
});

router.post("/", requireRole("customer", "admin"), (req, res) => {
  const { serviceId, staffId, startAt } = req.body;
  const service = db.services.find((item) => item.id === serviceId);
  if (!service) {
    return res.status(404).json({ message: "Service not found" });
  }

  const start = new Date(startAt);
  const end = new Date(start.getTime() + service.durationMins * 60000);
  if (Number.isNaN(start.getTime())) {
    return res.status(400).json({ message: "Invalid startAt datetime" });
  }

  const conflict = db.bookings.find(
    (item) => item.staffId === staffId && hasOverlap(item, start.toISOString(), end.toISOString())
  );
  if (conflict) {
    return res.status(409).json({ message: "Timeslot is already booked" });
  }

  const booking = {
    id: createId("bkg"),
    customerUserId: req.user.id,
    staffId,
    serviceId,
    startAt: start.toISOString(),
    endAt: end.toISOString(),
    status: "confirmed",
    notes: req.body.notes || "",
    createdAt: new Date().toISOString(),
  };
  db.bookings.push(booking);
  return res.status(201).json({ booking });
});

router.patch("/:id/cancel", requireRole("customer", "admin"), (req, res) => {
  const booking = db.bookings.find((item) => item.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }
  if (req.user.role === "customer" && booking.customerUserId !== req.user.id) {
    return res.status(403).json({ message: "Cannot cancel another customer's booking" });
  }
  booking.status = "cancelled";
  return res.json({ booking });
});

module.exports = {
  router,
};
