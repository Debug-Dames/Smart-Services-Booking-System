const express = require("express");
const { db } = require("../../config/database");
const { requireAuth } = require("../../middlewares/auth.middleware");

const router = express.Router();

router.use(requireAuth);

router.post("/recommendations", (req, res) => {
  const preferredCategory = req.body.preferredCategory;
  const targetDate = req.body.targetDate;

  const services = preferredCategory
    ? db.services.filter((item) => item.category === preferredCategory)
    : db.services.slice(0, 3);

  const openSlots = db.availability
    .filter((item) => !item.isBooked)
    .filter((item) => !targetDate || String(item.startAt).startsWith(targetDate))
    .slice(0, 5);

  return res.json({
    recommendations: {
      services,
      openSlots,
      message: "Based on service popularity and available staff schedule.",
    },
  });
});

module.exports = {
  router,
};
