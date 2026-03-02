const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Test route
app.get("/", (req, res) => {
    res.json({ message: "Backend is running successfully 🚀" });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});