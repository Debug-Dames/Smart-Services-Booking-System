import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function test() {
  try {
    const response = await openai.models.list();
    console.log("Connected to OpenAI ✅");
  } catch (error) {
    console.error("Failed to connect ❌", error);
  }
}

test();