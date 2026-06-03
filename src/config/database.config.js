import mongoose from "mongoose";

import { env } from "./env.config.js";
import { logger } from "./logger.config.js";

const { DATABASE_URI } = env;
let isConnected = false;
let hasShutdownHook = false;

const getErrorMessage = (error) =>
  error instanceof Error ? error.message : String(error);

export const connectDatabase = async () => {
  if (isConnected) {
    logger.warn("Using existing MongoDB connection".yellow.bold);
    return;
  }

  if (!DATABASE_URI?.trim()) {
    throw new Error("DATABASE_URI is not set in environment variables");
  }

  try {
    await mongoose.connect(DATABASE_URI.trim(), {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    logger.info("Connected to MongoDB Database".gray);

    mongoose.connection.on("error", (err) => {
      logger.error(`MongoDB connection error: ${err.message}`.red.bold);
    });

    mongoose.connection.on("disconnected", () => {
      logger.error("MongoDB disconnected".red.bold);
      isConnected = false;
    });

    if (!hasShutdownHook) {
      process.once("SIGINT", async () => {
        await mongoose.connection.close();
        logger.info("MongoDB connection closed".red.bold);
        process.exit(0);
      });
      hasShutdownHook = true;
    }
  } catch (error) {
    logger.error(
      `Failed to connect to MongoDB: ${getErrorMessage(error)}`.red.bold,
    );
    throw error;
  }
};
