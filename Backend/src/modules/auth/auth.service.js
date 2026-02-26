const crypto = require("crypto");
const { db, createId } = require("../../config/database");

const hashPassword = (password) => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

const createToken = (user) => {
  return Buffer.from(`${user.id}:${user.role}`).toString("base64url");
};

const sanitizeUser = (user) => {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

const register = (payload) => {
  const existing = db.users.find((item) => item.email === payload.email);
  if (existing) {
    const error = new Error("Email already exists");
    error.statusCode = 409;
    throw error;
  }

  const role = payload.role || "customer";
  const user = {
    id: createId("usr"),
    name: payload.name,
    email: payload.email.toLowerCase(),
    phone: payload.phone,
    role,
    passwordHash: hashPassword(payload.password),
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);

  if (role === "customer") {
    db.customers.push({
      id: createId("cus"),
      userId: user.id,
      loyaltyPoints: 0,
      preferences: payload.preferences || [],
    });
  }

  if (role === "staff") {
    db.staff.push({
      id: createId("stf"),
      userId: user.id,
      specialties: payload.specialties || [],
      active: true,
    });
  }

  return {
    user: sanitizeUser(user),
    token: createToken(user),
  };
};

const login = ({ email, password }) => {
  const user = db.users.find((item) => item.email === String(email).toLowerCase());
  if (!user || user.passwordHash !== hashPassword(password)) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  return {
    user: sanitizeUser(user),
    token: createToken(user),
  };
};

module.exports = {
  register,
  login,
};
