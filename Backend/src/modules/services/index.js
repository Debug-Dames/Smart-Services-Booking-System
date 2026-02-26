const express = require("express");
const { db, createId } = require("../../config/database");
const { requireAuth } = require("../../middlewares/auth.middleware");
const { requireRole } = require("../../middlewares/role.middleware");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({ services: db.services });
});

router.post("/", requireAuth, requireRole("admin"), (req, res) => {
  const service = {
    id: createId("svc"),
    name: req.body.name,
    durationMins: Number(req.body.durationMins || 30),
    price: Number(req.body.price || 0),
    category: req.body.category || "general",
  };

  if (!service.name) {
    return res.status(400).json({ message: "Service name is required" });
  }

  db.services.push(service);
  return res.status(201).json({ service });
});

router.patch("/:id", requireAuth, requireRole("admin"), (req, res) => {
  const service = db.services.find((item) => item.id === req.params.id);
  if (!service) {
    return res.status(404).json({ message: "Service not found" });
  }

  if (req.body.name) service.name = req.body.name;
  if (req.body.durationMins) service.durationMins = Number(req.body.durationMins);
  if (req.body.price !== undefined) service.price = Number(req.body.price);
  if (req.body.category) service.category = req.body.category;

  return res.json({ service });
});

module.exports = {
  router,
};
