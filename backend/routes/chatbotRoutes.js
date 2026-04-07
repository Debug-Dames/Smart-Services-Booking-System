import express from "express";
import { chatbotHandler, chatbotHealth } from "../controllers/chatbotController.js";

const router = express.Router();

router.post("/", chatbotHandler);
router.post("/chat", chatbotHandler);
router.post("/Chat", chatbotHandler);
router.get("/health", chatbotHealth);

export default router;
