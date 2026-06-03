import createError from "http-errors";
import { dataAccess } from "#dataAccess/index.js";
import { redisClient, logger } from "#config/index.js"; // Adjust the import path as needed
import { User } from "#models/user.model.js";
import { Site } from "#models/site.model.js";
import { ROLES } from "#constants/index.js";
import { Archives } from "#models/archives.model.js";
import { LeadSite } from "#models/lead-sites.model.js";

const { read } = dataAccess;

const normalizeImei = (imei) => {
  const rawValues = Array.isArray(imei)
    ? imei
    : typeof imei === "string"
      ? imei.split(",").map((value) => value.trim())
      : [];

  const normalizedImei = rawValues
    .filter(Boolean)
    .map((value) => Number(value));

  if (!normalizedImei.length || normalizedImei.some(Number.isNaN)) {
    throw createError(400, "A valid IMEI is required");
  }

  return normalizedImei;
};

const archivesService = {
  getAll: async function (skip, limit, currentUserId) {
    const user = await User.findById(currentUserId);

    const cacheKey = getCacheKey(user);

    try {
      // Attempt to retrieve cached data
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        logger.info("Serving archives from cache");
        return JSON.parse(cachedData);
      }
    } catch (err) {
      logger.error("Redis cache retrieval error:", err.message);
    }

    const result = await getUserAssignedArchives(user, skip, limit);

    if (!result.archives || result.archives.length === 0) {
      throw createError(404, "No archives found");
    }

    try {
      // Cache the result with a 1-hour expiration
      await redisClient.set(cacheKey, JSON.stringify(result), { EX: 3600 });
    } catch (err) {
      logger.error("Error setting cache for archives:", err.message);
    }

    return result;
  },

  getByCoordinatesAndParameter: async function (
    parameter,
    longitude,
    latitude,
    startTime,
    endTime
  ) {
    const archivesData = await read.archivesByCoordinatesAndParameter(
      parameter,
      longitude,
      latitude,
      startTime,
      endTime
    );

    if (!archivesData || archivesData.length === 0) {
      throw createError(
        404,
        "No data available in the selected time span"
      );
    }

    return archivesData;
  },

  getByImeiAndParameter: async function (parameter, imei, startTime, endTime) {
    const normalizedImei = normalizeImei(imei);
    const site = await read.siteByImei(normalizedImei);

    if (!site?.coordinates?.length) {
      throw createError(404, "No site found for the given IMEI");
    }

    const [longitude, latitude] = site.coordinates;
    const archivesData = await read.archivesByCoordinatesAndParameter(
      parameter,
      longitude,
      latitude,
      startTime,
      endTime
    );

    if (!archivesData || archivesData.length === 0) {
      throw createError(
        404,
        "No data available in the selected time span"
      );
    }

    return archivesData;
  },
};

function getCacheKey(user, skip, limit) {
  let cacheKey = `archives:skip:${skip}:limit:${limit}`;
  if (user.role === ROLES.ADMIN) {
    // pass
  }
  if (user.role === ROLES.TEAM_LEAD) {
    cacheKey = `${cacheKey}:team:${user._id}`;
  }
  if (user.role === ROLES.OPERATOR) {
    cacheKey = `${cacheKey}:team:${user.teamLead}`;
  }
  return cacheKey;
}

async function getUserAssignedArchives(user, skip, limit) {
  // get user sites and then get archives based on site name
  const filters = {};
  if (user.role === ROLES.ADMIN) {
    // pass
  }
  if (user.role === ROLES.TEAM_LEAD) {
    const assigned = await LeadSite.find({ leadId: user._id });
    const sites = await Site.find({
      _id: { $in: assigned.map((site) => site.siteId) },
    })
      .sort({ lat: -1, lon: -1 })
      .select("display_name")
      .lean();

    filters.siteName = { $in: sites.map((site) => site.display_name) };
  }
  if (user.role === ROLES.OPERATOR) {
    const assigned = await LeadSite.find({ leadId: user.teamLead });
    const sites = await Site.find({
      _id: { $in: assigned.map((site) => site.siteId) },
    }).sort({ lat: -1, lon: -1 });
    filters.siteName = { $in: sites.map((site) => site.display_name) };
  }

  const archives = await Archives.find(filters)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();

  const archivesCount = await Archives.countDocuments(filters);

  return { archives, archivesCount };
}

export default archivesService;
