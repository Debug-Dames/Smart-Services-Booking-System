import app from "./app.js";
import { env } from "./config/env.js";
import { initDB } from "./config/database.js";

const PORT = env.PORT || 5000;

async function startServer() {
  await initDB(); // 🔥 ENSURE DB + TABLES EXIST
  app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
  });
}

startServer();