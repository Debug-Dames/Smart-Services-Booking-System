
import prisma from "../../config/database.js";


// Create a new booking
export const createBooking = async ({ userId, serviceId, date, startTime, endTime }) => {

  const bookingDate = new Date(date)
  const start = new Date(startTime.includes("T") ? startTime : `${date}T${startTime}`)
  const end = new Date(endTime.includes("T") ? endTime : `${date}T${endTime}`)

  const today = new Date()
  today.setHours(0,0,0,0)

  if (bookingDate < today) {
    throw new Error("Cannot book in the past")
  }

  if (end <= start) {
    throw new Error("Invalid time range")
  }

  const existing = await prisma.booking.findFirst({
    where: {
      serviceId,
      startTime: {
        lt: end
      },
      endTime: {
        gt: start
      }
    }
  })

  if (existing) {
    throw new Error("Time slot already booked")
  }

  return prisma.booking.create({
    data: {
      userId,
      serviceId,
      date: bookingDate,
      startTime: start,
      endTime: end
    }
  })
}

