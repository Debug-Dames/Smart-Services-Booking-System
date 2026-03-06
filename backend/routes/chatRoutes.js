import express from "express";
import { getChatResponse, getAvailableSlots } from "../src/chatbotService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    console.log("Request body:", req.body); // 🔹 check what is coming in

    const { message, service } = req.body;
    if (!message) return res.status(400).json({ reply: "Message is required." });

    const slots = await getAvailableSlots(service);
    console.log("Available slots:", slots); // 🔹 debug available slots

    const reply = await getChatResponse(message, slots);
    console.log("GPT reply:", reply); // 🔹 debug GPT response

    res.json({ reply });
  } catch (error) {
    console.error("Chat route error:", error); // 🔹 show full error
    res.status(500).json({ reply: "Something went wrong." });
  }
});

export default router;
