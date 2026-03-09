// backend/src/modules/bookings/bookings.routes.js
import express from "express";

import { protect } from "../../middlewares/auth.middleware.js";

import { validateBooking } from "../../middlewares/bookingValidation.js"; // fix this!!!
import * as bookingController from "../../controllers/bookingController.js";

const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 12
 *         userId:
 *           type: integer
 *           example: 5
 *         serviceId:
 *           type: integer
 *           example: 2
 *         date:
 *           type: string
 *           format: date
 *           example: 2026-03-10
 *         startTime:
 *           type: string
 *           example: "10:00"
 *         endTime:
 *           type: string
 *           example: "11:00"
 *         status:
 *           type: string
 *           enum: [PENDING, CONFIRMED, CANCELLED]
 *           example: CONFIRMED
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2026-03-01T08:30:00Z
 *       required:
 *         - userId
 *         - serviceId
 *         - date
 *         - startTime
 *         - endTime
 *
 *     CreateBookingInput:
 *       type: object
 *       properties:
 *         serviceId:
 *           type: integer
 *           example: 2
 *         date:
 *           type: string
 *           format: date
 *           example: 2026-03-10
 *         startTime:
 *           type: string
 *           example: "10:00"
 *         endTime:
 *           type: string
 *           example: "11:00"
 *       required:
 *         - serviceId
 *         - date
 *         - startTime
 *         - endTime
 */



/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get all bookings for the authenticated user
 *     description: Returns a list of bookings belonging to the logged-in user.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Unauthorized
 */


router.get("/", protect, bookingController.getAllBookings);


/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get a booking by ID
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
 *         description: Booking details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       404:
 *         description: Booking not found
 *       401:
 *         description: Unauthorized
 */

router.get("/:id", protect, bookingController.getBookingById);


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
 *         description: Unauthorized – JWT token missing or invalid
 *       409:
 *         description: Time slot already booked
 */

router.post("/", protect, bookingController.createBookingController);

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



router.post("/lock", validateBooking, bookingController.lockSlotController);
router.delete("/lock/:token", bookingController.unlockSlotController);


export default router;
