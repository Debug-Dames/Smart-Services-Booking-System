const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  appName: process.env.APP_NAME || "Smart Salon Booking API",
  defaultCurrency: process.env.DEFAULT_CURRENCY || "USD",
};

module.exports = env;
