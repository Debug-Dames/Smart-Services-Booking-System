const express = require("express");
const { errorHandler } = require("./middlewares/error.middleware");
const authModule = require("./modules/auth");
const customersModule = require("./modules/customers");
const staffModule = require("./modules/staff");
const servicesModule = require("./modules/services");
const bookingsModule = require("./modules/bookings");
const availabilityModule = require("./modules/availability");
const aiModule = require("./modules/ai");
const paymentsModule = require("./modules/payments");

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "smart-salon-api" });
});

app.use("/api/auth", authModule.router);
app.use("/api/customers", customersModule.router);
app.use("/api/staff", staffModule.router);
app.use("/api/services", servicesModule.router);
app.use("/api/bookings", bookingsModule.router);
app.use("/api/availability", availabilityModule.router);
app.use("/api/ai", aiModule.router);
app.use("/api/payments", paymentsModule.router);

app.use(errorHandler);

module.exports = app;
