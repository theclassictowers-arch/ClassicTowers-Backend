import mongoose from "mongoose";

const { Schema, model } = mongoose;

const statusSchema = new Schema(
  {
    status: { type: String, required: true, default: "normal" },
    message: { type: String, required: true, default: "No message" },
    date: { type: String, required: true },
    time: { type: String, required: true },
  },
  { _id: false },
);

const sensorStatusSchema = new Schema(
  {
    coordinates: { type: [Number], required: true },
    siteName: { type: String, required: true },
    vibrationSpeed: statusSchema,
    vibrationDisplacement: statusSchema,
    vibrationAngle: statusSchema,
    vibrationFrequency: statusSchema,
    vibrationPitchAngle: statusSchema,
    vibrationRollAngle: statusSchema,
    vibrationYawAngle: statusSchema,
    vibrationResonance: statusSchema,
    windSpeed: statusSchema,
    windDirection: statusSchema,
    windHumidity: statusSchema,
    windTemperature: statusSchema,
  },
  {
    timestamps: true,
  },
);

export const Archives = model("Archives", sensorStatusSchema);
