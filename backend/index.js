const express = require("express");
const app = express();
const bookingRoutes = require("./routes/bookingRoutes");
const { errorHandler } = require("./middlewares/errorHandler");

app.use(express.json()); // parse JSON

// Booking routes
app.use("/bookings", bookingRoutes);

// Global error handler
app.use(errorHandler);

app.use("/auth", authRoutes);
app.use("/bookings", bookingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));