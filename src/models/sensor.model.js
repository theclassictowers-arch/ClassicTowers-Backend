import mongoose from "mongoose";

const { Schema, model } = mongoose;

const axisSchema = new Schema(
  {
    x: { type: [Number], required: true },
    y: { type: [Number], required: true },
    z: { type: [Number], required: true },
  },
  { _id: false },
);

const vibrationSchema = new Schema(
  {
    sensorId: { type: String, required: true },
    speed: { type: axisSchema, required: true },
    displacement: { type: axisSchema, required: true },
    frequency: { type: axisSchema, required: true },
    angle: { type: axisSchema, required: true },
    pitchAngle: { type: [Number], required: true },
    rollAngle: { type: [Number], required: true },
    yawAngle: { type: [Number], required: true },
    resonance: { type: [Number], required: true },
  },
  { _id: false },
);

const imuSchema = new Schema(
  {
    pitchAngle: { type: [Number], required: true },
    rollAngle: { type: [Number], required: true },
    yawAngle: { type: [Number], required: true },
    resonance: { type: [Number], required: true },
  },
  { _id: false },
);

const windSchema = new Schema(
  {
    sensorId: { type: String, required: true },
    speed: { type: [Number], required: true },
    direction: { type: [Number], required: true },
    humidity: { type: [Number], required: true },
    temperature: { type: [Number], required: true },
  },
  { _id: false },
);

const sensorsDataSchema = new Schema(
  {
    coordinates: { type: [Number], required: true },
    imei: { type: [Number], required: true },
    vibrationSensor: { type: vibrationSchema, required: false },
    IMUSensor: { type: imuSchema, required: false },
    windSensor: { type: windSchema, required: true },
  },
  { timestamps: true },
);

export const Sensor = model("Sensor", sensorsDataSchema);
