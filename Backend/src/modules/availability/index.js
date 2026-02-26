const express = require("express");
const { db, createId } = require("../../config/database");
const { requireAuth } = require("../../middlewares/auth.middleware");
const { requireRole } = require("../../middlewares/role.middleware");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({ availability: db.availability });
});

router.post("/", requireAuth, requireRole("staff", "admin"), (req, res) => {
  const slot = {
    id: createId("avl"),
    staffId: req.body.staffId || req.user.id,
    startAt: req.body.startAt,
    endAt: req.body.endAt,
    isBooked: false,
  };

  if (!slot.startAt || !slot.endAt) {
    return res.status(400).json({ message: "startAt and endAt are required" });
  }

  db.availability.push(slot);
  return res.status(201).json({ slot });
});

module.exports = {
  router,
};
