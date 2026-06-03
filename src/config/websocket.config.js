import { Server } from "socket.io";

import { env } from "#config/env.config.js";
import { logger } from "#config/logger.config.js";

let websocketInstance;

const parseOrigins = (origins = "") =>
  origins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const configuredOrigins = parseOrigins(env.CORS_ORIGINS);
if (env.FRONTEND_URL) {
  configuredOrigins.push(env.FRONTEND_URL.trim());
}

const localOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const fallbackOrigins =
  env.NODE_ENV === "production" ? [] : localOrigins;

const socketOrigins = [...new Set([...configuredOrigins, ...fallbackOrigins])];

export const setupWebSocket = (server) => {
  websocketInstance = new Server(server, {
    cors: {
      origin: socketOrigins.length ? socketOrigins : true,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  websocketInstance.on("connection", (socket) => {
    logger.info("New client connected").cyan;
    socket.on("disconnect", () => {
      logger.warn("Client disconnected");
    });
  });

  return websocketInstance;
};

export const getWebSocketInstance = () => {
  if (!websocketInstance) {
    throw new Error("WebSocket has not been initialized.");
  }
  return websocketInstance;
};
