import createError from "http-errors";

import { dataAccess } from "#dataAccess/index.js";
import { ROLES } from "#constants/index.js";
import { LeadSite } from "#models/lead-sites.model.js";
import { Site } from "#models/site.model.js";
import { Limits } from "#models/limits.model.js";

const { read, update } = dataAccess;

const limitsService = {
  getAll: async function (currentUserId) {
    const user = await read.userById(currentUserId);

    // const limits = await read.limits();
    const limits = await getUserAssignedLimits(user);
    if (!limits) {
      throw createError(404, "No limits found");
    }

    return limits;
  },

  getByCoordinates: async function (longitude, latitude) {
    const limits = await read.limitsByCoordinates(longitude, latitude);
    if (!limits) {
      throw createError(404, "No limits found");
    }

    return limits;
  },

  getById: async function (limitsId) {
    const limits = await read.limitsById(limitsId);
    if (!limits) {
      throw createError(404, "No limits found");
    }

    return limits;
  },

  getByCoordinatesAndParameter: async function (
    parameter,
    longitude,
    latitude
  ) {
    const limitsData = await read.limitsByCoordinatesAndParameter(
      parameter,
      longitude,
      latitude
    );

    if (!limitsData) {
      throw createError(
        404,
        "No limits found for the given parameter at the given coordinates"
      );
    }

    return limitsData;
  },

  updateById: async function (limitsId, limitsData) {
    const limits = await update.limitsById(limitsId, limitsData);
    if (!limits) {
      throw createError(404, "No limits found");
    }

    return "Limits updated successfully";
  },
};

async function getUserAssignedLimits(user) {
  const filters = {};
  if (user.role === ROLES.ADMIN) {
    // pass
  }
  if (user.role === ROLES.TEAM_LEAD) {
    const assigned = await LeadSite.find({ leadId: user._id });
    const sites = await Site.find({
      _id: { $in: assigned.map((site) => site.siteId) },
    })
      .select("imei")
      .sort({ lat: -1, lon: -1 })
      .lean();
    filters.imei = { $in: sites.map((site) => site.imei) };
  }
  if (user.role === ROLES.OPERATOR) {
    const assigned = await LeadSite.find({ leadId: user.teamLead });
    const sites = await Site.find({
      _id: { $in: assigned.map((site) => site.siteId) },
    })
      .select("imei")
      .sort({ lat: -1, lon: -1 })
      .lean();
    filters.imei = { $in: sites.map((site) => site.imei) };
  }

  const limits = await Limits.find(filters).lean();

  return limits;
}

export default limitsService;
