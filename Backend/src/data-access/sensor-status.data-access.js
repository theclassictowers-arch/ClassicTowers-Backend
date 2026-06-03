import { SensorStatus } from "#models/index.js";

export const sensorStatus = {
  save: {
    sensorStatus: async (coordinates, sensorStatus) =>
      await SensorStatus.findOneAndUpdate({ coordinates }, sensorStatus, {
        new: true,
        upsert: true,
        select: "-_id -__v -coordinates",
      }),
  },

  read: {
    siteCurrentStatus: async () =>
      await SensorStatus.find().sort({ createdAt: 1 }).select("-_id -__v"),
    sensorStatus: async () => await SensorStatus.find(),
  },

  remove: {
    currentSensorStatusByCoordinates: async (coordinates) =>
      await SensorStatus.deleteMany({ coordinates }),
  },
};
