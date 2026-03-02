import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { createPayment } from "./payments.service.js";

const router = express.Router();

router.post("/", authMiddleware, createPayment);

export default router;