import express from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import * as ctrl from "../../controllers/bookingController.js";


const router = express.Router();

// Public – slot availability check
// Get all bookings
router.get("/", protect, bookingController.getAllBookings);

// Calendar monthly data
router.get("/monthly", bookingController.getMonthlyBookings);

// Current user bookings
router.get("/mine", protect, bookingController.getMyBookings);

// Get booking by id
router.get("/:id", protect, bookingController.getBookingById);

// Create booking
router.post("/", protect, bookingController.createBookingController);

// Update booking
router.put("/:id", protect, bookingController.updateBooking);

// Delete booking
router.delete("/:id", protect, bookingController.deleteBooking);

export default router;