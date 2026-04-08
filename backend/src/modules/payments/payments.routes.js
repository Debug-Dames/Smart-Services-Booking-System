import express from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { createPayment } from "./payments.service.js";

const router = express.Router();

router.post("/", protect, createPayment);

export default router;
