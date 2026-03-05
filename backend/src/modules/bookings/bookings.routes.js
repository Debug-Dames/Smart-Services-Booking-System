// backend/src/modules/bookings/bookings.routes.js
import express from "express";
import { protect } from "../../middlewares/auth.middleware.js";

import * as bookingController from "./bookings.service.js";

const router = express.Router();

// Public routes (no token needed)
router.get("/", bookingController.getAllBookings);
router.get("/:id", bookingController.getBookingById);

// Create route is public for now (no token required)
router.post("/", bookingController.createBooking);
router.put("/:id", bookingController.updateBooking);
router.delete("/:id", bookingController.deleteBooking);


export default router;
