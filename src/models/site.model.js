import mongoose from "mongoose";

const { Schema, model } = mongoose;

const siteSchema = new Schema(
  {
    lat: { type: Number, required: true }, // Consider using Number for coordinates
    lon: { type: Number, required: true },
    name: { type: String, required: true },
    display_name: { type: String, required: true },
    region: { type: String, default: "" },
    infrastructure_id: { type: String, default: "" },
    imei: { type: [Number], required: true, unique: true },
    organization: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Create compound index for coordinate lookups
siteSchema.index({ lon: 1, lat: 1 }, { unique: true });

export const Site = model("Site", siteSchema);
