const validateCreatePaymentInput = (payload) => {
  const required = ["bookingId", "amount", "method"];
  const missing = required.filter((field) => payload[field] === undefined);
  if (missing.length) {
    return { valid: false, message: `Missing fields: ${missing.join(", ")}` };
  }

  if (Number(payload.amount) <= 0) {
    return { valid: false, message: "Amount must be greater than 0" };
  }

  return { valid: true };
};

module.exports = {
  validateCreatePaymentInput,
};
