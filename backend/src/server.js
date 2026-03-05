import app from "./app.js";
import { env } from "./config/env.js";

const PORT = env.PORT || 5000;

function startServer() {
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

startServer();
