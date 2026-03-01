import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  createAppointment,
  getMyAppointments
} from "./bookings.service.js";

const router = express.Router();

router.post("/", authMiddleware, createAppointment);
router.get("/mine", authMiddleware, getMyAppointments);

export default router;