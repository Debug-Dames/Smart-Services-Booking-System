const express = require("express");
const { db } = require("../../config/database");
const { requireAuth } = require("../../middlewares/auth.middleware");
const { requireRole } = require("../../middlewares/role.middleware");

const router = express.Router();

router.use(requireAuth);

router.get("/", requireRole("admin", "staff"), (_req, res) => {
  res.json({ customers: db.customers });
});

router.get("/me", requireRole("customer"), (req, res) => {
  const profile = db.customers.find((item) => item.userId === req.user.id);
  if (!profile) {
    return res.status(404).json({ message: "Customer profile not found" });
  }
  return res.json({ customer: profile });
});

router.patch("/me/preferences", requireRole("customer"), (req, res) => {
  const profile = db.customers.find((item) => item.userId === req.user.id);
  if (!profile) {
    return res.status(404).json({ message: "Customer profile not found" });
  }
  profile.preferences = Array.isArray(req.body.preferences)
    ? req.body.preferences
    : profile.preferences;
  return res.json({ customer: profile });
});

module.exports = {
  router,
};
