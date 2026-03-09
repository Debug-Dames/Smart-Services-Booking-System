import prisma from "../config/database.js";
import { createBooking } from "../modules/bookings/bookings.service.js"

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany()
    res.json(bookings)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getBookingById = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: Number(req.params.id) }
    })

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    res.json(booking)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const createBookingController = async (req, res) => {
  try {
    const booking = await createBooking(req.body)
    res.status(201).json(booking)
  } catch (err) {
    if (err.message === "Time slot already booked") {
      return res.status(409).json({ message: err.message })
    }
    res.status(400).json({ message: err.message })
  }
}

export const updateBooking = async (req, res) => {
  try {
    const { status } = req.body
    const booking = await prisma.booking.update({
      where: { id: Number(req.params.id) },
      data: { status } // only update what is allowed
    })
    res.json(booking)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const deleteBooking = async (req, res) => {
  try {
    await prisma.booking.delete({
      where: { id: Number(req.params.id) }
    })

    res.json({ message: "Booking deleted successfully" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}