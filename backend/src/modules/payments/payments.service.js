import Stripe from "stripe";
import prisma from "../../config/database.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const DEPOSIT_PERCENT = 0.1; // 10%


// ─── helpers ───────────────────────────────────────────────────

/**
 * Calculate the 10% deposit amount in cents (Stripe requires integer cents).
 * @param {number} price  Full service price in your currency unit (e.g. dollars)
 * @returns {number}      Amount in cents
 */
export function calcDepositCents(price) {
  return Math.round(price * DEPOSIT_PERCENT * 100);
}

// ─── create checkout session ───────────────────────────────────

/**
 * Creates a Stripe Checkout Session for the 10% deposit and a pending Payment row.
 *
 * @param {{
 *   bookingId: number,
 *   userId: number,
 *   serviceId: number,
 *   servicePrice: number,
 *   serviceName: string,
 *   customerEmail: string,
 * }} options
 * @returns {Promise<{ sessionUrl: string, payment: object }>}
 */
export async function createDepositCheckoutSession({
  bookingId,
  userId,
  servicePrice,
  serviceName,
  customerEmail,
}) {
  const depositCents = calcDepositCents(servicePrice);

  if (depositCents < 50) {
    // Stripe minimum charge is $0.50
    throw new Error("Deposit amount is below Stripe minimum charge of $0.50");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: depositCents,
          product_data: {
            name: `10% Deposit — ${serviceName}`,
            description: `Booking #${bookingId} confirmation deposit`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      bookingId: String(bookingId),
      userId: String(userId),
    },
    success_url: `${process.env.CLIENT_URL}/bookings/${bookingId}?payment=success`,
    cancel_url: `${process.env.CLIENT_URL}/bookings/${bookingId}?payment=cancelled`,
  });

  // Persist payment row (status = pending until webhook confirms)
  const payment = await prisma.payment.create({
    data: {
      bookingId,
      userId,
      amount: depositCents / 100,
      currency: "usd",
      status: "pending",
      stripeSessionId: session.id,
    },
  });

  return { sessionUrl: session.url, payment };
}

// ─── webhook handler ───────────────────────────────────────────

/**
 * Verifies the Stripe webhook signature and processes the event.
 * Call this from your webhook controller with the raw request body.
 *
 * @param {Buffer} rawBody   Raw request body (must NOT be JSON-parsed)
 * @param {string} signature Value of the `stripe-signature` header
 * @returns {Promise<void>}
 */
export async function handleStripeWebhook(rawBody, signature) {
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;

      if (session.payment_status !== "paid") break;

      const bookingId = Number(session.metadata?.bookingId);
      if (!bookingId) break;

      // Update payment row
      await prisma.payment.updateMany({
        where: { stripeSessionId: session.id },
        data: {
          status: "paid",
          stripePaymentIntentId: session.payment_intent ?? null,
          updatedAt: new Date(),
        },
      });

      // Confirm booking
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "confirmed" },
      });

      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object;

      await prisma.payment.updateMany({
        where: { stripeSessionId: session.id },
        data: { status: "failed", updatedAt: new Date() },
      });

      // Mark booking as cancelled when session expires unpaid
      const bookingId = Number(session.metadata?.bookingId);
      if (bookingId) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: "cancelled" },
        });
      }

      break;
    }

    case "charge.refunded": {
      const charge = event.data.object;

      await prisma.payment.updateMany({
        where: { stripePaymentIntentId: charge.payment_intent },
        data: { status: "refunded", updatedAt: new Date() },
      });

      break;
    }

    default:
      // Unhandled event — silently ignore
      break;
  }
}

// ─── query helpers ─────────────────────────────────────────────

/**
 * Returns the payment record for a given booking.
 */
export async function getPaymentByBookingId(bookingId) {
  return prisma.payment.findUnique({
    where: { bookingId },
  });
}