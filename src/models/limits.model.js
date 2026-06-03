import mongoose from "mongoose";

const { Schema, model } = mongoose;

const RangeSchema = new Schema(
  {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
  },
  {
    _id: false,
  },
);

const DirectionalSchema = new Schema(
  {
    green: RangeSchema,
    yellow: RangeSchema,
    red: RangeSchema,
  },
  {
    _id: false,
  },
);

const AxisSchema = new Schema(
  {
    x: DirectionalSchema,
    y: DirectionalSchema,
    z: DirectionalSchema,
  },
  {
    _id: false,
  },
);

const LimitsSchema = new Schema(
  {
    coordinates: {
      type: [Number],
      required: true,
      unique: true,
    },
    imei: { type: [Number], required: true, unique: true },
    vibrationSpeed: AxisSchema,
    vibrationDisplacement: AxisSchema,
    vibrationFrequency: AxisSchema,
    vibrationAngle: AxisSchema,
    vibrationPitchAngle: DirectionalSchema,
    vibrationRollAngle: DirectionalSchema,
    windSpeed: DirectionalSchema,
    windDirection: DirectionalSchema,
    windHumidity: DirectionalSchema,
    windTemperature: DirectionalSchema,
  },
  {
    timestamps: true,
  },
);

export const Limits = model("Limit", LimitsSchema);
