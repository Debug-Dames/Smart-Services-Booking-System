import express from "express";
import {
  initiatePayment,
  stripeWebhook,
  getPaymentStatus,
} from "../../controllers/payments.controller.js";
import { protect } from "../../middlewares/auth.middleware.js"; // adjust path if needed

const router = express.Router();

// ── Stripe webhook ─────────────────────────────────────────────
// MUST use express.raw() so Stripe can verify the signature.
// This route intentionally has NO auth middleware.
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// ── Authenticated routes ────────────────────────────────────────
router.use(protect);

// Initiate 10% deposit checkout for an existing booking
router.post("/checkout/:bookingId", initiatePayment);

// Get payment status for a booking
router.get("/booking/:bookingId", getPaymentStatus);

export default router;