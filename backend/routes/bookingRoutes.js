// backend/src/modules/bookings/bookings.routes.js
import express from "express";
import * as bookingController from "./bookings.services.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", bookingController.getAllBookings);
router.get("/:id", bookingController.getBookingById);

// Protected routes
router.post("/", bookingController.createBooking); // can add protect later
router.put("/:id", bookingController.updateBooking);
router.delete("/:id", bookingController.deleteBooking);

export default router;