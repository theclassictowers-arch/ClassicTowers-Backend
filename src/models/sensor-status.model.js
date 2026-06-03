import mongoose from "mongoose";

const { Schema, model } = mongoose;

const statusSchema = new Schema(
  {
    status: { type: String, required: true, default: "normal" },
    message: { type: String, required: true, default: "normal" },
    date: { type: String, required: true },
    time: { type: String, required: true },
  },
  { _id: false },
);

const sensorStatusSchema = new Schema({
  coordinates: { type: [Number], required: true },
  vibrationSpeed: statusSchema,
  vibrationDisplacement: statusSchema,
  vibrationFrequency: statusSchema,
  vibrationAngle: statusSchema,
  vibrationPitchAngle: statusSchema,
  vibrationRollAngle: statusSchema,
  windSpeed: statusSchema,
  windDirection: statusSchema,
  windHumidity: statusSchema,
  windTemperature: statusSchema,
});

export const SensorStatus = model("SensorStatus", sensorStatusSchema);
