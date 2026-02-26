const requireFields = (payload, fields) => {
  const missing = fields.filter((field) => !payload[field]);
  if (missing.length) {
    return { valid: false, message: `Missing fields: ${missing.join(", ")}` };
  }
  return { valid: true };
};

const validateRegisterInput = (payload) => {
  const base = requireFields(payload, ["name", "email", "password", "phone"]);
  if (!base.valid) return base;

  if (!String(payload.email).includes("@")) {
    return { valid: false, message: "Invalid email address" };
  }

  if (String(payload.password).length < 6) {
    return { valid: false, message: "Password must be at least 6 characters" };
  }

  return { valid: true };
};

const validateLoginInput = (payload) => {
  return requireFields(payload, ["email", "password"]);
};

module.exports = {
  validateRegisterInput,
  validateLoginInput,
};
