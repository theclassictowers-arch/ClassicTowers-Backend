import mongoose from "mongoose";

import { env } from "#config/env.config.js";
import { Limits } from "#models/index.js";
import { defaultLimits } from "#helpers/index.js";

const run = async () => {
  console.log("Connecting to database...");
  await mongoose.connect(env.DATABASE_URI);

  const yawResult = await Limits.updateMany(
    { vibrationYawAngle: { $exists: false } },
    { $set: { vibrationYawAngle: defaultLimits.vibrationYawAngle } },
  );

  const resonanceResult = await Limits.updateMany(
    { vibrationResonance: { $exists: false } },
    { $set: { vibrationResonance: defaultLimits.vibrationResonance } },
  );

  console.log(
    `Backfilled vibrationYawAngle on ${yawResult.modifiedCount} limits document(s).`,
  );
  console.log(
    `Backfilled vibrationResonance on ${resonanceResult.modifiedCount} limits document(s).`,
  );

  process.exit(0);
};

run().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
