import express from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import * as bookingController from "../../controllers/bookingController.js";
import { validateBooking } from "./middleware/bookingValidation.js";

const router = express.Router();

// GET ALL BOOKINGS
router.get("/", protect, bookingController.getAllBookings);

// GET BOOKING BY ID
router.get("/:id", protect, bookingController.getBookingById);

// ✅ CREATE BOOKING (FIXED)
router.post(
  "/",
  protect,
  validateBooking, // ✅ THIS WAS MISSING
  bookingController.createBookingController
);

// UPDATE BOOKING
router.put("/:id", protect, bookingController.updateBooking);

// DELETE BOOKING
router.delete("/:id", protect, bookingController.deleteBooking);

export default router;
