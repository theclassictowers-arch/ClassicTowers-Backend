/* eslint-disable no-console */
import mongoose from "mongoose";
import redis from "redis";
import dotenv from "dotenv";

dotenv.config();

if (process.env.CONFIRM_CLEAR_TELEMETRY !== "yes") {
  console.error(
    "Refusing to clear telemetry. Run with CONFIRM_CLEAR_TELEMETRY=yes.",
  );
  process.exit(1);
}

const databaseUri = process.env.DATABASE_URI?.trim();
if (!databaseUri) {
  console.error("DATABASE_URI is not configured.");
  process.exit(1);
}

const clearMatchingRedisKeys = async (client, pattern) => {
  for await (const keys of client.scanIterator({ MATCH: pattern, COUNT: 100 })) {
    const keyList = Array.isArray(keys) ? keys : [keys];
    if (keyList.length) await client.del(keyList);
  }
};

let redisClient;

try {
  await mongoose.connect(databaseUri, { serverSelectionTimeoutMS: 5000 });

  const sensorResult = await mongoose.connection.collection("sensors").deleteMany({});
  const statusResult = await mongoose.connection
    .collection("sensorstatuses")
    .deleteMany({});
  const archiveResult = await mongoose.connection
    .collection("archives")
    .deleteMany({});

  redisClient = redis.createClient({
    socket: {
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT || 6379),
    },
  });
  redisClient.on("error", (error) =>
    console.warn(`Redis cache cleanup warning: ${error.message}`),
  );

  try {
    await redisClient.connect();
    await clearMatchingRedisKeys(redisClient, "sites:all*");
    await clearMatchingRedisKeys(redisClient, "site:*");
  } catch (error) {
    console.warn(`Telemetry cleared, but Redis cache cleanup failed: ${error.message}`);
  }

  console.log(`Deleted sensor readings: ${sensorResult.deletedCount}`);
  console.log(`Deleted current sensor statuses: ${statusResult.deletedCount}`);
  console.log(`Deleted sensor archives: ${archiveResult.deletedCount}`);
  console.log("Sites, users, organizations and limits were preserved.");
} catch (error) {
  console.error(`Telemetry cleanup failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  if (redisClient?.isOpen) await redisClient.quit();
  await mongoose.disconnect();
}
