import app from "./app.js";
import { env } from "./config/env.js";
import { ensureBookingTimeColumns } from "./config/database.js";

const PORT = env.PORT || 5000;

<<<<<<< HEAD
function startServer() {
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}
=======
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
>>>>>>> 40f5c115f31d08af3d54757a50d3ba53b0bf67ee

startServer();
