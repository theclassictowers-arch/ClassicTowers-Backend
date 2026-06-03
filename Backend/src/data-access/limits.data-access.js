import { Limits } from "#models/index.js";

const toImeiArray = (imei) => {
  const rawValues = Array.isArray(imei)
    ? imei
    : typeof imei === "string"
      ? imei.split(",").map((value) => value.trim())
      : [];

  const imeiValues = rawValues
    .filter(Boolean)
    .map((value) => Number(value));

  return imeiValues.filter((value) => !Number.isNaN(value));
};

const buildImeiFilter = (imei) => {
  const imeiValues = toImeiArray(imei);

  return {
    $all: imeiValues,
    $size: imeiValues.length,
  };
};

export const limits = {
  save: {
    limits: async (limitsData) => await Limits.create(limitsData),
  },

  read: {
    limits: async () => await Limits.find(),

    limitsById: async (limitsId) =>
      await Limits.findById(limitsId).select("-__v -coordinates"),

    limitsByCoordinates: async (longitude, latitude) =>
      await Limits.findOne({ coordinates: [longitude, latitude] }).select(
        "-__v -coordinates",
      ),

    limitsByImei: async (imei) => await Limits.findOne({ imei }),

    limitsByImeiAndParameter: async (parameter, imei) => {
      return await Limits.findOne(
        {
          imei: buildImeiFilter(imei),
        },
        {
          [parameter]: 1,
          _id: 0,
        },
      );
    },
  },

  update: {
    limitsById: async (limitsId, limitsData) =>
      await Limits.findByIdAndUpdate(limitsId, limitsData, {
        new: true,
        upsert: true,
      }),
  },

  remove: {
    limitsByCoordinates: async (coordinates) =>
      await Limits.deleteOne({ coordinates }),
    limitsByImei: async (imei) => await Limits.deleteOne({ imei }),
  },
};
