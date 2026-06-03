import redis from "redis";
import { logger, env } from "./index.js";

// Validate and parse environment variables
const parseRedisConfig = () => {
  const { REDIS_HOST = "localhost", REDIS_PORT = "6379" } = env;
  const port = Number(REDIS_PORT);

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    logger.error(`Invalid Redis port: ${REDIS_PORT}`);
    process.exit(1);
  }

  return { host: REDIS_HOST, port };
};

// Create Redis client with configuration
const createRedisClient = () => {
  const { host, port } = parseRedisConfig();

  return redis.createClient({
    socket: {
      host,
      port,
      reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
    },
  });
};

// Unified error handler with detailed logging
const handleRedisError = (error) => {
  if (error instanceof AggregateError) {
    error.errors.forEach((innerError, index) => {
      logger.error({
        message: `Redis inner error ${index + 1}\nError: ${innerError.message}\nStack: ${innerError.stack}`,
        error: innerError.message,
        stack: innerError.stack,
      });
    });
    return;
  }

  logger.error({
    message: "Redis error",
    error: error.message,
    stack: error.stack,
  });
};

// Event handlers configuration
const configureEventHandlers = (client) => {
  const events = [
    ["connect", "Redis client connected"],
    ["ready", "Redis client is ready to use"],
    ["end", "Redis client has disconnected"],
  ];

  events.forEach(([event, message]) => {
    client.on(event, () => logger.info(message));
  });

  client.on("error", handleRedisError);
};

// Connection management
const connectRedis = async (client) => {
  try {
    await client.connect();
    logger.info("Redis client connection established");
    return client;
  } catch (error) {
    handleRedisError(error);
    process.exit(1);
  }
};

// Graceful shutdown handler
const configureGracefulShutdown = (client) => {
  process.on("SIGINT", async () => {
    try {
      await client.quit();
      logger.info("Redis client gracefully disconnected");
      process.exit(0);
    } catch (error) {
      logger.error({
        message: "Redis disconnection failed",
        error: error.message,
      });
      process.exit(1);
    }
  });
};

// Main initialization flow
export const redisClient = (() => {
  const client = createRedisClient();
  configureEventHandlers(client);
  configureGracefulShutdown(client);

  // Use void for explicit fire-and-forget promise
  void connectRedis(client);

  return client;
})();
