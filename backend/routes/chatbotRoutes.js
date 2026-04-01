import express from "express";
import { chatbotHandler, chatbotHealth } from "../controllers/chatbotController.js";

const router = express.Router();

router.post("/", chatbotHandler);
router.get("/health", chatbotHealth);

export default router;
