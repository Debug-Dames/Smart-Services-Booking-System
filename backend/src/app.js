import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.routes.js";
import paymentRoutes from "./modules/payments/payments.routes.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import bookingRoutes from "./modules/bookings/bookings.routes.js";
import contactRoutes from "./modules/contact/contact.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => {
  res.status(200).send("OK");
});

app.get("/", (_, res) => {
    res.json({ message: "Smart Services API is running" });
});

 

app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/bookings", bookingRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use(notFoundHandler);
app.use(errorHandler);

export default app;


