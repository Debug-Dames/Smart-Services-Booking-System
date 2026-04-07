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
    const userKey = req.user?.id || req.ip;

    if (!message) {
      return res.status(400).json({ response: "Message is required" });
    }

    if (isTestEnv()) {
      const reply = await processMessage(message, { userId: req.user?.id, userKey });
      return res.json({ response: reply });
    }

    const useGroq = process.env.CHATBOT_PROVIDER === "groq";

    if (!process.env.GROQ_API_KEY || !useGroq) {
      const reply = await processMessage(message, { userId: req.user?.id, userKey });
      return res.json({ response: reply });
    }

    const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
    const canonicalReply = await processMessage(message, { userId: req.user?.id, userKey });

    const aiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are a salon assistant. You must answer using ONLY the canonical response provided. " +
              "Do not add, remove, or alter any facts. If unsure, return the canonical response exactly.",
          },
          {
            role: "user",
            content: `Canonical response:\n${canonicalReply}\n\nUser message:\n${message}\n\nReturn the canonical response only.`,
          },
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
      const fallbackReply = await processMessage(message, { userId: req.user?.id, userKey });
      return res.json({ response: fallbackReply || "Chatbot returned no reply" });
    }

    if (!reply.includes(canonicalReply)) {
      return res.json({ response: canonicalReply });
    }

    return res.json({ response: canonicalReply });
  } catch (error) {
    console.error(error);
    try {
      const reply = await processMessage(req.body?.message || "", { userId: req.user?.id, userKey });
      if (reply) {
        return res.json({ response: reply });
      }
    } catch (fallbackError) {
      console.error("Chatbot fallback failed:", fallbackError);
    }
    return res.status(500).json({ response: "Something went wrong with the chatbot." });
  }
};
