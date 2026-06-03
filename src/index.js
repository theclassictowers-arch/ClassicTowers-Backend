import { logger } from "#config/index.js";
import { startServer } from "#server/server.js";
// import "./schedular/index.js";

void startServer().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  logger.error(`Fatal startup error: ${message}`.red.bold);
  process.exit(1);
});
