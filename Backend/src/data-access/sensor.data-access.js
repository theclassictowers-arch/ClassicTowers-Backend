import createError from "http-errors";

import { Sensor } from "#models/index.js";

const sensorMapping = {
  vibrationSpeed: { sensorType: "vibrationSensor", sensorProperty: "speed" },
  vibrationDisplacement: {
    sensorType: "vibrationSensor",
    sensorProperty: "displacement",
  },
  vibrationFrequency: {
    sensorType: "vibrationSensor",
    sensorProperty: "frequency",
  },
  vibrationAngle: { sensorType: "vibrationSensor", sensorProperty: "angle" },
  vibrationPitchAngle: {
    sensorType: "vibrationSensor",
    sensorProperty: "pitchAngle",
  },
  vibrationRollAngle: {
    sensorType: "vibrationSensor",
    sensorProperty: "rollAngle",
  },
  windSpeed: { sensorType: "windSensor", sensorProperty: "speed" },
  windDirection: { sensorType: "windSensor", sensorProperty: "direction" },
  windHumidity: { sensorType: "windSensor", sensorProperty: "humidity" },
  windTemperature: { sensorType: "windSensor", sensorProperty: "temperature" },
};

const toImeiArray = (imei) => {
  const rawValues = Array.isArray(imei)
    ? imei
    : typeof imei === "string"
      ? imei.split(",").map((value) => value.trim())
      : [];

  const imeiValues = rawValues
    .filter(Boolean)
    .map((value) => Number(value));

  if (!imeiValues.length || imeiValues.some(Number.isNaN)) {
    throw createError(400, "Invalid IMEI");
  }

  return imeiValues;
};

const buildImeiFilter = (imei) => {
  const imeiValues = toImeiArray(imei);

  return {
    $all: imeiValues,
    $size: imeiValues.length,
  };
};

export const sensor = {
  save: {
    sensor: async (sensorsData) => {
      return await Sensor.create(sensorsData);
    },
  },

  read: {
    sensorByCoordinates: async (longitude, latitude) => {
      return await Sensor.find({ coordinates: [longitude, latitude] }).sort({
        createdAt: 1,
      });
    },

    sensorByImeiAndParameter: async (
      parameter,
      imei,
      startDateTime,
      endDateTime,
    ) => {
      const mapping = sensorMapping[parameter];
      if (!mapping) {
        throw createError(400, "Invalid sensor parameter");
      }
      const { sensorType, sensorProperty } = mapping;
      const query = {
        imei: buildImeiFilter(imei),
        [`${sensorType}.${sensorProperty}`]: { $exists: true },
      };

      const createdAtFilter = {};
      if (startDateTime) {
        createdAtFilter.$gte = startDateTime;
      }
      if (endDateTime) {
        createdAtFilter.$lte = endDateTime;
      }
      if (Object.keys(createdAtFilter).length) {
        query.createdAt = createdAtFilter;
      }

      return await Sensor.find(
        query,
        {
          [`${sensorType}.${sensorProperty}`]: 1,
          createdAt: 1,
          _id: 0,
        },
      ).sort({ createdAt: 1 });
    },
  },

  remove: {
    sensorByCoordinates: async (coordinates) => {
      return await Sensor.deleteMany({ coordinates });
    },
  },
};
