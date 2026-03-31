
// import prisma from "../../config/database.js";


// // Create a new booking
// export const createBooking = async ({ userId, serviceId, date, startTime, endTime }) => {

//   const bookingDate = new Date(date)
//   const start = new Date(startTime.includes("T") ? startTime : `${date}T${startTime}`)
//   const end = new Date(endTime.includes("T") ? endTime : `${date}T${endTime}`)

//   const today = new Date()
//   today.setHours(0,0,0,0)

//   if (bookingDate < today) {
//     throw new Error("Cannot book in the past")
//   }

//   if (end <= start) {
//     throw new Error("Invalid time range")
//   }

//   const existing = await prisma.booking.findFirst({
//     where: {
//       serviceId,
//       startTime: {
//         lt: end
//       },
//       endTime: {
//         gt: start
//       }
//     }
//   })

//   if (existing) {
//     throw new Error("Time slot already booked")
//   }

//   return prisma.booking.create({
//     data: {
//       userId,
//       serviceId,
//       date: bookingDate,
//       startTime: start,
//       endTime: end
//     }
//   })
// }



import prisma from "../../config/database.js";
import { createDepositCheckoutSession } from "../payments/payments.service.js";

/**
 * Creates a booking and immediately generates a Stripe checkout session
 * for the 10% deposit.  The booking starts with status "pending" and is
 * only moved to "confirmed" after the webhook fires.
 *
 * @returns {{ booking: object, sessionUrl: string, payment: object }}
 */
export const createBooking = async ({
  userId,
  serviceId,
  date,
  startTime,
  endTime,
}) => {
  if (!userId || isNaN(Number(userId))) throw new Error("Invalid userId");
  if (!serviceId || isNaN(Number(serviceId)))
    throw new Error("Invalid userId or serviceId");
  if (!date) throw new Error("Date is required");

  const bookingDate = new Date(date);
  if (isNaN(bookingDate.getTime())) throw new Error("Invalid date");

  if (!startTime) throw new Error("Invalid start time");

  const start = new Date(
    startTime.includes("T") ? startTime : `${date}T${startTime}`
  );
  if (isNaN(start.getTime())) throw new Error("Invalid start time");

  const end = endTime
    ? new Date(endTime.includes("T") ? endTime : `${date}T${endTime}`)
    : new Date(start.getTime() + 60 * 60_000); // default 1 hour

  if (isNaN(end.getTime())) throw new Error("Invalid time range");

  if (end <= start) throw new Error("Invalid time range");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (bookingDate < today) throw new Error("Cannot book in the past");

  // Verify user & service exist
  const [user, service] = await Promise.all([
    prisma.user.findUnique({ where: { id: Number(userId) } }),
    prisma.service.findUnique({ where: { id: Number(serviceId) } }),
  ]);

  if (!user) throw new Error("User not found");
  if (!service) throw new Error("Service not found");

  // Check for conflicting bookings
  const existing = await prisma.booking.findFirst({
    where: {
      serviceId: Number(serviceId),
      startTime: { lt: end },
      endTime: { gt: start },
    },
  });

  if (existing) throw new Error("Time slot already booked");

  // Create booking (status = "pending" until payment confirmed)
  const booking = await prisma.booking.create({
    data: {
      userId: Number(userId),
      serviceId: Number(serviceId),
      date: bookingDate,
      startTime: start,
      endTime: end,
      status: "pending",
    },
    include: { service: true },
  });

  // Create Stripe checkout session for 10% deposit
  const { sessionUrl, payment } = await createDepositCheckoutSession({
    bookingId: booking.id,
    userId: Number(userId),
    servicePrice: service.price,
    serviceName: service.name,
    customerEmail: user.email,
  });

  return { booking, sessionUrl, payment };
};