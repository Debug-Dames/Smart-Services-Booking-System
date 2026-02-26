const app = require("./app");
const env = require("./config/env");
const { connectDatabase } = require("./config/database");

const start = async () => {
  await connectDatabase();
  app.listen(env.port, () => {
    console.log(`${env.appName} listening on port ${env.port}`);
  });
};

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
