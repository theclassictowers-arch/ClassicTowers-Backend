import { createServer } from "node:http";

import { setupWebSocket, connectDatabase } from "#config/index.js";
import { logger, env } from "#config/index.js";

import app from "./app.js";

const { PORT } = env;

const startServer = async () => {
  await connectDatabase();

  const server = createServer(app);

  setupWebSocket(server);

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(PORT || 5000, resolve);
  });

  logger.info(`Server running on http://localhost:${PORT || 5000}`);

  return server;
};

export { startServer };
