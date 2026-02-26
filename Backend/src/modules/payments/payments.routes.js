const express = require("express");
const controller = require("./payments.controller");
const { requireAuth } = require("../../middlewares/auth.middleware");
const { requireRole } = require("../../middlewares/role.middleware");

const router = express.Router();

router.use(requireAuth);
router.get("/", controller.list);
router.post("/", controller.create);
router.patch("/:id/refund", requireRole("admin"), controller.markRefunded);

module.exports = router;
