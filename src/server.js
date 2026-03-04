const dotenv = require("dotenv");
const { createApp } = require("./app");

dotenv.config();

const port = Number.parseInt(process.env.PORT || "3000", 10);
const dataStoragePath = process.env.DATA_STORAGE_PATH || "/app/data";

const app = createApp({ dataStoragePath });

async function start() {
  await app.locals.initializeStorage();

  app.listen(port, () => {
    process.stdout.write(`Spreadsheet API listening on port ${port}\n`);
  });
}

start().catch((error) => {
  process.stderr.write(`Failed to start server: ${error.message}\n`);
  process.exit(1);
});
