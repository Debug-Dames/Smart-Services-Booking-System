import { processMessage } from '../src/modules/Chat/ChatbotServices.js';




export const chatWithBot = async (req, res) => {
  try {
    const { message } = req.body;
    const reply = await processMessage(message);
    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};