import axios from "axios";

import { Site } from "#models/index.js";
import { siteApi } from "#constants/index.js";

export const site = {
  save: {
    site: async (siteData) => await Site.create(siteData),
  },

  read: {
    siteById: async (siteId) => await Site.findById(siteId),
    siteByCoordinates: async (longitude, latitude) =>
      await Site.findOne({ lon: longitude, lat: latitude }),
    siteByImei: async (imei) => await Site.findOne({ imei }),
    allSites: async () => await Site.find().sort({ lat: -1, lon: -1 }),
    siteMetaData: async (longitude, latitude) => {
      const api = siteApi(longitude, latitude);
      const { data } = await axios.get(api);
      return data;
    },
  },

  update: {
    siteById: async (siteId, siteData) =>
      await Site.findByIdAndUpdate(siteId, siteData, { new: true }),
  },

  remove: {
    siteById: async (siteId) => await Site.findByIdAndDelete(siteId),
    siteByCoordinates: async (coordinates) =>
      await Site.deleteOne({ coordinates }),
    siteByImei: async (imei) => await Site.deleteOne({ imei }),
  },
};
