import { processMessage } from '../src/modules/Chat/ChatbotServices.js';




export const chatWithBot = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user?.id ? Number(req.user.id) : null;
    const userKey = req.user?.id ? `user:${req.user.id}` : `ip:${req.ip}`;
    const reply = await processMessage(message, { userId, userKey });
    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
