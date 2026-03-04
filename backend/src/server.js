import app from "./app.js";
import { env } from "./config/env.js";
import { ensureBookingTimeColumns } from "./config/database.js";

const PORT = env.PORT || 5000;

const startServer = async () => {
  try {
    await ensureBookingTimeColumns();

    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to initialize database schema:", error);
    process.exit(1);
  }
};

startServer();
