const fs = require("fs");
const path = require("path");

const legacyEntry = path.join(__dirname, "src", "server. js");

if (fs.existsSync(legacyEntry) && fs.statSync(legacyEntry).size > 0) {
  require(legacyEntry);
} else {
  const express = require("express");
  const cors = require("cors");
  require("dotenv").config();

  const app = express();
  const PORT = process.env.PORT || 5000;

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true, service: "backend" });
  });

  app.get("/", (_req, res) => {
    res.status(200).json({
      message: "Backend is running. Implement src/server. js to use full app logic.",
    });
  });

  app.listen(PORT, () => {
    console.log(`Backend listening on port ${PORT}`);
  });
}
