import createError from "http-errors";

import {
  defaultLimits,
  sequenceAndCollectSensorsData,
  evaluateLimits,
} from "#helpers/index.js";
import { logger, getWebSocketInstance, redisClient } from "#config/index.js";
import { dataAccess } from "#dataAccess/index.js";
import { Site } from "#models/site.model.js";
import { User } from "#models/user.model.js";
import { ROLES } from "#constants/index.js";
import { LeadSite } from "#models/lead-sites.model.js";

const { save, read, update, remove } = dataAccess;

const resolveCreatedAt = (createdAt) => {
  if (!createdAt) {
    return new Date().toISOString();
  }

  const parsedDate = new Date(createdAt);
  if (Number.isNaN(parsedDate.getTime())) {
    return new Date().toISOString();
  }

  return parsedDate.toISOString();
};

const siteService = {
  addSite: async function (sensorsData, currentUser = null) {
    const { imei, coordinates } = sensorsData;

    const [lon, lat] = coordinates;
    const existingSite = await read.siteByImei(imei);

    let operation = "updated";
    let siteName = existingSite?.display_name || "Unknown";

    if (!Boolean(existingSite)) {
      let organization = null;
      if (currentUser?.role === ROLES.ORGANIZATION) {
        const organizationUser = await User.findById(currentUser.id);
        if (!organizationUser) {
          throw createError(401, "Organization user not found");
        }

        const existingTowerCount = await Site.countDocuments({
          organization: organizationUser._id,
        });
        const towerLimit = Number(organizationUser.towerLimit || 0);
        if (existingTowerCount >= towerLimit) {
          throw createError(
            400,
            `Tower limit reached. Maximum allowed: ${towerLimit}`
          );
        }
        organization = organizationUser._id;
      }

      const { city, countryName } = await read.siteMetaData(lon, lat);

      const display_name = `${city}, ${countryName}`;

      const siteData = {
        name: city || "Unknown",
        display_name: city && countryName ? display_name : "Unknown",
        lon: lon || 0,
        lat: lat || 0,
        imei: imei || [0, 0],
        region: sensorsData.region || "",
        infrastructure_id: sensorsData.infrastructure_id || "",
        organization,
      };

      const limitsData = {
        coordinates: [lon, lat],
        imei: imei || [0, 0],
        ...defaultLimits,
      };

      const result = await Promise.all([
        save.site(siteData),
        save.limits(limitsData),
      ]);

      if (!result[0] || !result[1]) {
        await Promise.all([remove.siteByImei(imei), remove.limitsByImei(imei)]);
        throw createError(500, "Failed to save site data");
      }

      siteName = result[0].display_name || siteData.display_name || siteName;
      operation = "added";
    }

    sensorsData.createdAt = resolveCreatedAt(sensorsData.createdAt);
    const sensorsDataArr = [sensorsData];

    const sensorsProperties = sequenceAndCollectSensorsData(sensorsDataArr);
    const sensorsStatus = await evaluateLimits(sensorsProperties);

    await Promise.all([
      redisClient.del("sites:all"),
      currentUser?.id ? redisClient.del(`sites:all:${currentUser.id}`) : Promise.resolve(),
      redisClient.del(`site:${existingSite && existingSite._id}`),
      save.sensor(sensorsData),
      save.sensorStatus(sensorsData.coordinates, sensorsStatus),
      save.archives(sensorsData.coordinates, siteName, sensorsStatus),
    ]);

    getWebSocketInstance().emit("newData", "New data added");

    return `Site ${operation}. IMEI: ${imei}.`;
  },

  getAllSites: async function (loggedInUserId) {
    const user = await User.findById(loggedInUserId);
    let cacheKey = getCacheKey(user);

    // Attempt to retrieve cached sites data
    const cachedSites = await redisClient.get(cacheKey);
    if (cachedSites) {
      logger.info("Serving all sites from cache.");
      return JSON.parse(cachedSites);
    }

    // Fetch from database if cache miss
    const sites = await getUserAssignedSites(user);
    if (!sites.length) {
      throw createError(404, "No sites found");
    }

    const sensorStatus = await read.siteCurrentStatus();
    if (!sensorStatus.length) {
      throw createError(404, "No current sensor status found");
    }

    const sitesWithStatus = sites.map((site) => {
      const status = sensorStatus.find(
        (status) =>
          status.coordinates[0] === parseFloat(site.lon) &&
          status.coordinates[1] === parseFloat(site.lat)
      );

      return {
        ...site._doc,
        status: status || {},
      };
    });

    // Cache the data with a 1-hour expiration
    await redisClient.set(cacheKey, JSON.stringify(sitesWithStatus), {
      EX: 3600,
    });
    return sitesWithStatus;
  },

  getSiteById: async function (siteId) {
    const cacheKey = `site:${siteId}`;

    // Attempt to retrieve cached site data
    const cachedSite = await redisClient.get(cacheKey);
    if (cachedSite) {
      logger.info(`Serving site ${siteId} from cache.`);
      return JSON.parse(cachedSite);
    }

    // Fetch from database if cache miss
    const site = await read.siteById(siteId);
    if (!site) {
      throw createError(404, "Site not found");
    }

    const sensorStatus = await read.siteCurrentStatus();
    if (!sensorStatus.length) {
      throw createError(404, "No current sensor status found");
    }

    const status = sensorStatus.find(
      (status) =>
        status.coordinates[0] === parseFloat(site.lon) &&
        status.coordinates[1] === parseFloat(site.lat)
    );

    const siteWithStatus = {
      ...site._doc,
      status: status || {},
    };

    // Cache the result with a 1-hour expiration
    await redisClient.set(cacheKey, JSON.stringify(siteWithStatus), {
      EX: 3600,
    });
    return siteWithStatus;
  },

  partialUpdateSiteById: async function (siteId, updateData) {
    const site = await read.siteById(siteId);
    if (!site) {
      throw createError(404, "Site not found");
    }

    const updatedSite = await update.siteById(siteId, updateData);
    return updatedSite;
  },

  deleteSite: async function (siteId) {
    const site = await read.siteById(siteId);
    if (!site) {
      throw createError(404, "Site not found");
    }

    await Promise.all([
      remove.siteById(siteId),
      remove.limitsByCoordinates(site.coordinates),
      remove.sensorByCoordinates(site.coordinates),
      remove.archiveByCoordinates(site.coordinates),
      remove.currentSensorStatusByCoordinates(site.coordinates),
    ]);

    return;
  },
};

function getCacheKey(user) {
  let cacheKey;
  if (user.role === ROLES.ADMIN) {
    cacheKey = "sites:all";
  } else if (user.role === ROLES.ORGANIZATION) {
    cacheKey = `sites:all:${user._id}`;
  } else if (user.role === ROLES.TEAM_LEAD) {
    cacheKey = `sites:all:${user._id}`;
  } else {
    cacheKey = `sites:all:${user.teamLead}`;
  }

  return cacheKey;
}

async function getUserAssignedSites(user) {
  let sites = [];
  if (user.role === ROLES.ADMIN) {
    sites = await Site.find().sort({ lat: -1, lon: -1 });
  }
  if (user.role === ROLES.ORGANIZATION) {
    sites = await Site.find({ organization: user._id }).sort({ lat: -1, lon: -1 });
  }
  if (user.role === ROLES.TEAM_LEAD) {
    const assigned = await LeadSite.find({ leadId: user._id });
    sites = await Site.find({
      _id: { $in: assigned.map((site) => site.siteId) },
    }).sort({ lat: -1, lon: -1 });
  }
  if (user.role === ROLES.OPERATOR) {
    const assigned = await LeadSite.find({ leadId: user.teamLead });
    sites = await Site.find({
      _id: { $in: assigned.map((site) => site.siteId) },
    }).sort({ lat: -1, lon: -1 });
  }

  return sites;
}

export default siteService;
