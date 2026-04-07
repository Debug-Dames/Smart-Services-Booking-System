import express from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { validateBooking } from "./middleware/bookingValidation.js";
import * as bookingController from "../../controllers/bookingController.js";

const router = express.Router();

// GET MY BOOKINGS
router.get("/", protect, bookingController.getAllBookings);

// GET BOOKING BY ID
router.get("/:id", protect, bookingController.getBookingById);

// LOCK SLOT
router.post("/lock", protect, validateBooking, bookingController.lockSlotController);

// UNLOCK SLOT
router.delete("/lock/:token", protect, bookingController.unlockSlotController);

// CREATE BOOKING
router.post("/", protect, validateBooking, bookingController.createBookingController);

// UPDATE BOOKING
router.put("/:id", protect, bookingController.updateBooking);

// DELETE BOOKING
router.delete("/:id", protect, bookingController.deleteBooking);

export default router;
