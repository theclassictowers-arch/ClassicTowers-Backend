// site-processor.js
import { logger } from "#config/index.js";
import { apiClient } from "./api-client.js";
import {
  BATCH_SIZE,
  MAX_CONCURRENT_BATCHES,
  BATCH_INTERVAL_MS,
} from "./sensor-constants.js";
import { generatePayload } from "./sensor-data-generator.js";

export const callAddSiteApi = async (payload, retries = 3) => {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await apiClient.post("", payload);

      logger.debug(
        `Successfully added site at coordinates: ${JSON.stringify(payload.coordinates)}`,
      );

      return response.data;
    } catch (error) {
      lastError = error;
      const isLastAttempt = attempt === retries;
      const isNetworkError = error.code === "ECONNABORTED" || !error.response;
      const logLevel = isLastAttempt ? "error" : "warn";

      logger.log(
        logLevel,
        `API Error (attempt ${attempt}/${retries}): ${error.message}, Status: ${error.response?.status || "Network Error"}`,
      );

      const statusCode = error.response?.status;
      const baseDelay = isNetworkError || statusCode === 429 ? 1000 : 500;

      if (isLastAttempt) {
        break;
      }

      const backoffDelay = baseDelay * Math.pow(1.5, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
    }
  }

  throw lastError;
};

const processBatch = async (batch, batchIndex) => {
  try {
    const results = await Promise.allSettled(
      batch.map(async (coords) => {
        try {
          const payload = generatePayload(coords);
          return await callAddSiteApi(payload);
        } catch (error) {
          logger.error(
            `Failed to process site at ${JSON.stringify(coords)}: ${error.message}`,
          );
          throw error;
        }
      }),
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    if (failed > 0) {
      logger.warn(
        `Batch ${batchIndex} stats: ${succeeded} succeeded, ${failed} failed`,
      );
    }

    // Don't wait after the last batch
    if (batchIndex < MAX_CONCURRENT_BATCHES - 1) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_INTERVAL_MS));
    }
  } catch (error) {
    logger.error(`Error processing batch ${batchIndex}: ${error.message}`);
  }
};

export const processSitesInBatches = async (sites) => {
  try {
    logger.info(
      `Starting to process ${sites.length} sites in batches of ${BATCH_SIZE}`,
    );

    for (
      let i = 0;
      i < sites.length;
      i += BATCH_SIZE * MAX_CONCURRENT_BATCHES
    ) {
      const batchPromises = [];

      for (
        let j = 0;
        j < MAX_CONCURRENT_BATCHES && i + j * BATCH_SIZE < sites.length;
        j++
      ) {
        const startIdx = i + j * BATCH_SIZE;
        const endIdx = Math.min(startIdx + BATCH_SIZE, sites.length);
        const batch = sites.slice(startIdx, endIdx);

        const batchPromise = processBatch(batch, j);
        batchPromises.push(batchPromise);
      }

      await Promise.all(batchPromises);
    }

    logger.info(`Completed processing all ${sites.length} sites`);
  } catch (error) {
    logger.error(`Batch processing error: ${error.message}`);
  }
};
