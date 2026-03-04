// backend/src/modules/bookings/bookings.routes.js
import express from "express";
import { protect } from "../../middlewares/auth.middleware.js";

import * as bookingController from "./bookings.service.js";

const router = express.Router();

// Public routes (no token needed)
router.get("/", bookingController.getAllBookings);
router.get("/:id", bookingController.getBookingById);

// Protected routes (token required)
router.post("/", protect, bookingController.createBooking);
router.put("/:id", protect, bookingController.updateBooking);
router.delete("/:id", protect, bookingController.deleteBooking);


export default router;
