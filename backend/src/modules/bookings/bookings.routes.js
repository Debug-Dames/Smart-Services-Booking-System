import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  createAppointment,
  getAllAppointments,
  getMyAppointments,
  updateAppointment,
  updateAppointmentStatus,
  cancelAppointment,
} from "./bookings.service.js";

const router = express.Router();

router.post("/", authMiddleware, createAppointment);
router.get("/", getAllAppointments);
router.get("/mine", authMiddleware, getMyAppointments);
router.put("/:id", updateAppointment);
router.patch("/:id/status", updateAppointmentStatus);
router.patch("/:id/cancel", cancelAppointment);

export default router;
