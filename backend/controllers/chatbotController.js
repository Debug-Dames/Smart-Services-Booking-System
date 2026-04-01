import fetch from "node-fetch";
import { processMessage } from "../src/modules/Chat/ChatbotServices.js";

const isTestEnv = () =>
  process.env.NODE_ENV === "test" ||
  typeof process.env.JEST_WORKER_ID !== "undefined";

export const chatbotHealth = (_req, res) => {
  const hasGroqKey = Boolean(process.env.GROQ_API_KEY);
  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
  return res.json({ hasGroqKey, model });
};

export const chatbotHandler = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ response: "Message is required" });
    }

    if (isTestEnv()) {
      const reply = await processMessage(message, { userId: req.user?.id });
      return res.json({ response: reply });
    }

    if (!process.env.GROQ_API_KEY) {
      const reply = await processMessage(message, { userId: req.user?.id });
      return res.json({ response: reply });
    }

    const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

    const aiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "You are a helpful salon assistant." },
          { role: "user", content: message },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      const reply = await processMessage(message, { userId: req.user?.id });
      return res.json({
        response: reply || "Chatbot provider error",
        details: errorText,
      });
    }

    const data = await aiResponse.json();
    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      const fallbackReply = await processMessage(message, { userId: req.user?.id });
      return res.json({ response: fallbackReply || "Chatbot returned no reply" });
    }

    return res.json({ response: reply });
  } catch (error) {
    console.error(error);
    try {
      const reply = await processMessage(req.body?.message || "", { userId: req.user?.id });
      if (reply) {
        return res.json({ response: reply });
      }
    } catch (fallbackError) {
      console.error("Chatbot fallback failed:", fallbackError);
    }
    return res.status(500).json({ response: "Something went wrong with the chatbot." });
  }
};
