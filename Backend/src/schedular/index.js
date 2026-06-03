import cron from "node-cron";
import { logger } from "#config/index.js";
import { CRON_SCHEDULE } from "./sensor-constants.js";
import { processSitesInBatches } from "./site-processor.js";
import { allCoordinates } from "./sites.js";

// Validate all coordinates before starting
const validateAllCoordinates = () => {
  if (
    !allCoordinates ||
    !Array.isArray(allCoordinates) ||
    allCoordinates.length === 0
  ) {
    throw new Error("No coordinates found or invalid coordinates data format");
  }

  const invalidCoords = allCoordinates.filter(
    (coords) =>
      !Array.isArray(coords) ||
      coords.length !== 2 ||
      !Number.isFinite(coords[0]) ||
      !Number.isFinite(coords[1]),
  );

  if (invalidCoords.length > 0) {
    logger.error(`Found ${invalidCoords.length} invalid coordinates`);
    throw new Error(
      `Invalid coordinates detected: ${JSON.stringify(
        invalidCoords.slice(0, 3),
      )}...`,
    );
  }

  logger.info(`Validated ${allCoordinates.length} coordinates successfully`);
  return true;
};

// Task tracking for graceful shutdown
let isTaskRunning = false;

// Initialize and run the system
const init = () => {
  try {
    // Pre-validate all coordinates
    validateAllCoordinates();

    // Set up the scheduled task with improved error handling
    const scheduledTask = cron.schedule(CRON_SCHEDULE, async () => {
      // Skip if previous task is still running
      if (isTaskRunning) {
        logger.warn("Previous task still running, skipping this execution");
        return;
      }

      isTaskRunning = true;
      const startTime = Date.now();
      logger.info(`Running scheduled task at ${new Date().toISOString()}`);

      try {
        await processSitesInBatches(allCoordinates);
        const duration = Date.now() - startTime;
        logger.info(`Task completed in ${duration}ms`);
      } catch (error) {
        logger.error(`Task failed: ${error.message}`);
      } finally {
        isTaskRunning = false;
      }
    });

    // Handle graceful shutdown
    process.on("SIGTERM", () => {
      logger.info("SIGTERM received, shutting down gracefully");
      scheduledTask.stop();
      // Give ongoing tasks time to complete
      setTimeout(() => process.exit(0), 3000);
    });

    logger.info(`Scheduler initialized with cron pattern: ${CRON_SCHEDULE}`);
  } catch (error) {
    logger.error(`Initialization error: ${error.message}`);
    process.exit(1);
  }
};

// Start the system
init();
