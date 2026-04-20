import {
  createDepositCheckoutSession,
  handleStripeWebhook,
  getPaymentByBookingId,
} from "../modules/payments/payments.service.js";
import prisma from "../config/database.js";

// ─── POST /payments/checkout/:bookingId ────────────────────────
/**
 * Initiates a Stripe Checkout session for an existing pending booking.
 * The booking must belong to the authenticated user.
 */
export const initiatePayment = async (req, res) => {
  try {
    const bookingId = Number(req.params.bookingId);
    if (!Number.isInteger(bookingId)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    // Load booking with service + user
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { service: true, user: true },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Only the booking owner can pay
    if (booking.userId !== Number(req.user?.id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (booking.status === "confirmed") {
      return res.status(409).json({ message: "Booking is already confirmed" });
    }

    // Prevent duplicate sessions for the same booking
    const existing = await getPaymentByBookingId(bookingId);
    if (existing && existing.status === "paid") {
      return res.status(409).json({ message: "Deposit already paid" });
    }

    const { sessionUrl, payment } = await createDepositCheckoutSession({
      bookingId,
      userId: booking.userId,
      servicePrice: booking.service.price,
      serviceName: booking.service.name,
      customerEmail: booking.user.email,
    });

    return res.status(201).json({
      message: "Checkout session created",
      sessionUrl,          // redirect the user to this URL
      payment,
    });
  } catch (err) {
    if (err.message.includes("below Stripe minimum")) {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: "Payment initiation failed", error: err.message });
  }
};

// ─── POST /payments/webhook ────────────────────────────────────
/**
 * Stripe webhook receiver.
 * IMPORTANT: This route must receive the RAW body (not JSON-parsed).
 * Register it BEFORE express.json() middleware, or use express.raw() on this route.
 */
export const stripeWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];

  if (!signature) {
    return res.status(400).json({ message: "Missing stripe-signature header" });
  }

  try {
    // req.body must be the raw Buffer here (see routes setup)
    await handleStripeWebhook(req.body, signature);
    return res.json({ received: true });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// ─── GET /payments/booking/:bookingId ─────────────────────────
/**
 * Returns the payment record for a given booking.
 * The booking must belong to the authenticated user (or user is ADMIN).
 */
export const getPaymentStatus = async (req, res) => {
  try {
    const bookingId = Number(req.params.bookingId);
    if (!Number.isInteger(bookingId)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isOwner = booking.userId === Number(req.user?.id);
    const isAdmin = req.user?.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const payment = await getPaymentByBookingId(bookingId);

    if (!payment) {
      return res.status(404).json({ message: "No payment found for this booking" });
    }

    return res.json(payment);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};