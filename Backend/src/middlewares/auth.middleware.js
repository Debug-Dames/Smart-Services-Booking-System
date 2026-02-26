const { db } = require("../config/database");

const decodeToken = (token) => {
  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const [userId, role] = raw.split(":");
    if (!userId || !role) {
      return null;
    }
    return { userId, role };
  } catch (_error) {
    return null;
  }
};

const requireAuth = (req, res, next) => {
  const authorization = req.headers.authorization || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Unauthorized: missing token" });
  }

  const payload = decodeToken(token);
  if (!payload) {
    return res.status(401).json({ message: "Unauthorized: invalid token" });
  }

  const user = db.users.find((item) => item.id === payload.userId);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized: user not found" });
  }

  req.user = { id: user.id, role: user.role, email: user.email };
  return next();
};

module.exports = {
  requireAuth,
};
