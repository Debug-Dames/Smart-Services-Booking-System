// backend/src/controllers/booking.controller.js
import prisma from "../config/database.js";
import { createBooking, lockSlot, unlockSlot } from "../modules/bookings/bookings.service.js";

/**
 * Get all bookings
 */
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get booking by ID
 */
export const getBookingById = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Lock a slot
 */
export const lockSlotController = async (req, res) => {
  try {
    const lock = await lockSlot(req.body, req.user);
    res.status(201).json(lock);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Unlock a slot
 */
export const unlockSlotController = async (req, res) => {
  try {
    const result = await unlockSlot(req.params.token);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Create booking
 * Requires that the user locked the slot first
 */
export const createBookingController = async (req, res) => {
  try {
    const booking = await createBooking(req.body, req.user);
    res.status(201).json(booking);
  } catch (err) {
    if (
      err.message === "Time slot already booked" ||
      err.message === "You must lock the slot before booking"
    ) {
      return res.status(409).json({ message: err.message });
    }
    if (err.message === "Cannot book in the past" || err.message === "Invalid time range") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};

/**
 * Update a booking
 */
export const updateBooking = async (req, res) => {
  try {
    const { startTime, endTime, status } = req.body;
    const dataToUpdate = {};

    if (startTime) dataToUpdate.startTime = new Date(startTime);
    if (endTime) dataToUpdate.endTime = new Date(endTime);
    if (status) dataToUpdate.status = status;

    const booking = await prisma.booking.update({
      where: { id: Number(req.params.id) },
      data: dataToUpdate,
    });

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Delete a booking
 */
export const deleteBooking = async (req, res) => {
  try {
    await prisma.booking.delete({
      where: { id: Number(req.params.id) },
    });
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};