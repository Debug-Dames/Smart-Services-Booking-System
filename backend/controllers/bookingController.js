import prisma from "../../config/database.js";


// CREATE BOOKING (POST /bookings)
export const createBooking = async (req, res) => {
  try {
    const { userId, serviceId, date, startTime, endTime } = req.body;

    const uId = Number(userId);
    const sId = Number(serviceId);
    const d = new Date(date);
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(uId) || isNaN(sId) || isNaN(d) || isNaN(start) || isNaN(end)) {
      return res.status(400).json({
        message: "Invalid input. Use numeric userId/serviceId and valid date/time formats."
      });
    }

    const booking = await prisma.booking.create({
      data: {
        userId: uId,
        serviceId: sId,
        date: d,
        startTime: start,
        endTime: end,
        status: "pending"
      }
    });

    res.status(201).json(booking);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create booking" });
  }
};



// GET ALL BOOKINGS (GET /bookings)
export const getBookings = async (req, res) => {
  try {

    const bookings = await prisma.booking.findMany();

    res.json(bookings);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};



// GET BOOKING BY ID (GET /bookings/:id)
export const getBookingById = async (req, res) => {
  try {

    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: Number(id) }
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch booking" });
  }
};



// UPDATE BOOKING (PUT /bookings/:id)
export const updateBooking = async (req, res) => {
  try {

    const { id } = req.params;
    const { status } = req.body;

    const updatedBooking = await prisma.booking.update({
      where: { id: Number(id) },
      data: { status }
    });

    res.json(updatedBooking);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update booking" });
  }
};



// CANCEL BOOKING (DELETE /bookings/:id)
export const deleteBooking = async (req, res) => {
  try {

    const { id } = req.params;

    const cancelledBooking = await prisma.booking.update({
      where: { id: Number(id) },
      data: { status: "cancelled" }
    });

    res.json({
      message: "Booking cancelled successfully",
      booking: cancelledBooking
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to cancel booking" });
  }
};