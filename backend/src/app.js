import express from "express";
import cors from "cors";

import authRoutes from "./modules/auth/auth.routes.js";
import paymentRoutes from "./modules/payments/payments.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_, res) => {
  res.json({ message: "Smart Services API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);

app.use(errorHandler);

export default app;