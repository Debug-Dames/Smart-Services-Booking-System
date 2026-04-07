import express from "express";
import { protect } from "../../middlewares/auth.middleware.js";

import { validateBooking } from "../../middlewares/bookingValidation.js"; // fix this!!!
import * as bookingController from "../../controllers/bookingController.js";

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

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     description: Allows an authenticated user to create a booking for a specific service and time slot.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBookingInput'
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Invalid input or validation error
 *       401:
 *         description: Unauthorized � JWT token missing or invalid
 *       409:
 *         description: Time slot already booked
 */

router.post("/", protect, validateBooking, bookingController.createBookingController);

/**
 * @swagger
 * /bookings/{id}:
 *   put:
 *     summary: Update booking status
 *     description: Allows admin or user to update booking status.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             status: CONFIRMED
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *       400:
 *         description: Invalid status value
 *       404:
 *         description: Booking not found
 *       401:
 *         description: Unauthorized
 */

router.put("/:id", protect, bookingController.updateBooking);


/**
 * @swagger
 * /bookings/{id}:
 *   delete:
 *     summary: Cancel a booking
 *     description: Deletes or cancels an existing booking.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       404:
 *         description: Booking not found
 *       401:
 *         description: Unauthorized
 */
router.delete("/:id", protect, bookingController.deleteBooking);
router.post("/lock", protect, validateBooking, bookingController.lockSlotController);
router.delete("/lock/:token", protect, bookingController.unlockSlotController);

export default router;
