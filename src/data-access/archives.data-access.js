import { Archives } from "#models/index.js";

export const archives = {
  save: {
    archives: async (coordinates, siteName, sensorStatus) => {
      return await Archives.create({ coordinates, siteName, ...sensorStatus });
    },
  },

  read: {
    archives: async (skip, limit) => {
      return await Archives.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
    },

    archiveByCoordinates: async (coordinates) => {
      return await Archives.findOne({ coordinates });
    },

    archivesCount: async () => {
      return await Archives.countDocuments();
    },

    archivesByCoordinatesAndParameter: async (
      parameter,
      longitude,
      latitude,
      startTime,
      endTime
    ) => {
      const query = { coordinates: [longitude, latitude] };
      if (startTime && endTime) {
        query.createdAt = { $gte: new Date(startTime), $lte: new Date(endTime) };
      }
      return await Archives.find(query, {
        [parameter]: 1,
        createdAt: 1,
        _id: 0,
      }).sort({ createdAt: 1 });
    },
  },

  update: {
    archiveByCoordinates: async (coordinates, updateData) => {
      return await Archives.updateOne({ coordinates }, { $set: updateData });
    },
  },

  remove: {
    archiveByCoordinates: async (coordinates) => {
      return await Archives.deleteMany({ coordinates });
    },
  },
};
