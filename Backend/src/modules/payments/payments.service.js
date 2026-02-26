const { db, createId } = require("../../config/database");

const createPayment = (payload, user) => {
  const booking = db.bookings.find((item) => item.id === payload.bookingId);
  if (!booking) {
    const error = new Error("Booking not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.role === "customer" && booking.customerUserId !== user.id) {
    const error = new Error("Cannot pay for another customer's booking");
    error.statusCode = 403;
    throw error;
  }

  const payment = {
    id: createId("pay"),
    bookingId: payload.bookingId,
    amount: Number(payload.amount),
    method: payload.method,
    status: "paid",
    transactionId: payload.transactionId || createId("txn"),
    createdAt: new Date().toISOString(),
  };
  db.payments.push(payment);
  return payment;
};

const listPayments = (user) => {
  if (user.role === "admin") {
    return db.payments;
  }

  if (user.role === "customer") {
    const customerBookingIds = db.bookings
      .filter((item) => item.customerUserId === user.id)
      .map((item) => item.id);
    return db.payments.filter((item) => customerBookingIds.includes(item.bookingId));
  }

  return db.payments;
};

const updateStatus = (id, status) => {
  const payment = db.payments.find((item) => item.id === id);
  if (!payment) {
    const error = new Error("Payment not found");
    error.statusCode = 404;
    throw error;
  }
  payment.status = status;
  return payment;
};

module.exports = {
  createPayment,
  listPayments,
  updateStatus,
};
