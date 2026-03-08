import express from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import * as ctrl from "./bookings.service.js";

const router = express.Router();

// Public – slot availability check
router.get("/", ctrl.getAllBookings);

// Public – calendar day-count coloring  (MUST be before /:id)
router.get("/monthly", ctrl.getMonthlyBookings);

// Protected – current user's own bookings  (MUST be before /:id)
router.get("/mine", protect, ctrl.getMyBookings);

// Public – single booking by id
router.get("/:id", ctrl.getBookingById);

// Protected – create
router.post("/", protect, ctrl.createBooking);

// Admin-ish – update / delete
router.put("/:id", ctrl.updateBooking);
router.delete("/:id", ctrl.deleteBooking);

export default router;