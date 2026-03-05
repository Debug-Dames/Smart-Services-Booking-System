import express from "express";
import bookingRoutes from "./modules/bookings/bookings.routes.js"; // adjust path

const app = express();

// Important: parse JSON bodies
app.use(express.json());

// Mount booking routes
app.use("/api/bookings", bookingRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});