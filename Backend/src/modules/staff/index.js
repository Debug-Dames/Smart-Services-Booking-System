const express = require("express");
const { db, createId } = require("../../config/database");
const { requireAuth } = require("../../middlewares/auth.middleware");
const { requireRole } = require("../../middlewares/role.middleware");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({ staff: db.staff });
});

router.post("/", requireAuth, requireRole("admin"), (req, res) => {
  const staff = {
    id: createId("stf"),
    userId: req.body.userId || null,
    specialties: req.body.specialties || [],
    active: req.body.active !== false,
  };
  db.staff.push(staff);
  res.status(201).json({ staff });
});

router.patch("/:id", requireAuth, requireRole("admin"), (req, res) => {
  const staff = db.staff.find((item) => item.id === req.params.id);
  if (!staff) {
    return res.status(404).json({ message: "Staff not found" });
  }
  if (Array.isArray(req.body.specialties)) {
    staff.specialties = req.body.specialties;
  }
  if (typeof req.body.active === "boolean") {
    staff.active = req.body.active;
  }
  return res.json({ staff });
});

module.exports = {
  router,
};
