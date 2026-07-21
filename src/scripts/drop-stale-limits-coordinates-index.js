import mongoose from "mongoose";

import { env } from "#config/env.config.js";
import { Limits } from "#models/index.js";

const run = async () => {
  console.log("Connecting to database...");
  await mongoose.connect(env.DATABASE_URI);

  const existingIndexes = await Limits.collection.indexes();
  const staleIndex = existingIndexes.find(
    (index) => index.name === "coordinates_1",
  );

  if (!staleIndex) {
    console.log("No stale coordinates_1 index found, nothing to do.");
    process.exit(0);
  }

  await Limits.collection.dropIndex("coordinates_1");
  console.log("Dropped stale unique index coordinates_1 on limits collection.");

  process.exit(0);
};

run().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
