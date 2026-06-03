import createError from "http-errors";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

import { deleteFile } from "#utils/index.js";
import { dataAccess } from "#dataAccess/index.js";
import { ROLES } from "#constants/index.js";
import { LeadSite } from "#models/lead-sites.model.js";

const { read, update, remove, find } = dataAccess;
const DEFAULT_ORGANIZATION_MAP_ZOOM = 4.8;
const DEFAULT_DASHBOARD_THEME = {
  primaryColor: "#0b70c2",
  backgroundColor: "#f5f7fb",
  textColor: "#0f172a",
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const normalizeMapOpeningLocation = (mapOpeningLocation) => {
  if (!mapOpeningLocation || typeof mapOpeningLocation !== "object") {
    return null;
  }

  const lat = Number(mapOpeningLocation.lat);
  const lng = Number(mapOpeningLocation.lng);
  const zoom =
    mapOpeningLocation.zoom === undefined || mapOpeningLocation.zoom === null
      ? DEFAULT_ORGANIZATION_MAP_ZOOM
      : Number(mapOpeningLocation.zoom);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    !Number.isFinite(zoom) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180 ||
    zoom < 1 ||
    zoom > 20
  ) {
    return null;
  }

  return { lat, lng, zoom };
};

const normalizeDashboardTheme = (dashboardTheme) => {
  if (dashboardTheme === undefined || dashboardTheme === null) {
    return { ...DEFAULT_DASHBOARD_THEME };
  }
  if (typeof dashboardTheme !== "object") {
    return null;
  }

  const toHexOrNull = (value) => {
    const normalized = String(value || "")
      .trim()
      .toLowerCase();

    if (!/^#([a-f0-9]{6})$/.test(normalized)) {
      return null;
    }

    return normalized;
  };

  const primaryColor = toHexOrNull(
    dashboardTheme.primaryColor ?? DEFAULT_DASHBOARD_THEME.primaryColor
  );
  const backgroundColor = toHexOrNull(
    dashboardTheme.backgroundColor ?? DEFAULT_DASHBOARD_THEME.backgroundColor
  );
  const textColor = toHexOrNull(
    dashboardTheme.textColor ?? DEFAULT_DASHBOARD_THEME.textColor
  );

  if (!primaryColor || !backgroundColor || !textColor) {
    return null;
  }

  return { primaryColor, backgroundColor, textColor };
};

const resolveUserMapOpeningLocation = async (user) => {
  if (!user || user.role === ROLES.ADMIN) {
    return null;
  }

  if (user.role === ROLES.ORGANIZATION) {
    return normalizeMapOpeningLocation(user.mapOpeningLocation);
  }

  if (user.organization) {
    const organization = await read.userById(user.organization);
    if (organization?.role === ROLES.ORGANIZATION) {
      return normalizeMapOpeningLocation(organization.mapOpeningLocation);
    }
  }

  return null;
};

const resolveUserDashboardTheme = async (user) => {
  if (!user) {
    return { ...DEFAULT_DASHBOARD_THEME };
  }

  if (user.role === ROLES.ADMIN || user.role === ROLES.ORGANIZATION) {
    return normalizeDashboardTheme(user.dashboardTheme) || {
      ...DEFAULT_DASHBOARD_THEME,
    };
  }

  if (user.organization) {
    const organization = await read.userById(user.organization);
    if (organization?.role === ROLES.ORGANIZATION) {
      return normalizeDashboardTheme(organization.dashboardTheme) || {
        ...DEFAULT_DASHBOARD_THEME,
      };
    }
  }

  return { ...DEFAULT_DASHBOARD_THEME };
};

const userService = {
  getAll: async function (currentUser, queryParams = {}) {
    let users = [];
    const { role: filterRole, organization: filterOrganization } = queryParams;

    const user = await read.userById(currentUser.id);

    // If query params are provided, filter by them
    if (filterRole || filterOrganization) {
      const filters = {};

      if (filterRole) {
        filters.role = filterRole;
      }

      if (filterOrganization) {
        filters.organization = filterOrganization;
      }

      users = await find.many(filters);
    } else {
      // Default behavior based on current user role
      switch (user.role) {
        case ROLES.ADMIN:
          users = await read.allUsers();
          break;
        case ROLES.ORGANIZATION:
          // Organization apne team leads aur operators dekh sakta hai
          users = await find.many({ organization: user._id });
          break;
        case ROLES.TEAM_LEAD:
          users = await find.many({ teamLead: user._id });
          break;
      }
    }

    if (!users.length) {
      throw createError(404, "Users not found");
    }

    return users;
  },
  getById: async function (userId) {
    const user = await read.userById(userId);
    if (!user) {
      throw createError(404, "User not found");
    }

    const mapOpeningLocation = await resolveUserMapOpeningLocation(user);
    const dashboardTheme = await resolveUserDashboardTheme(user);
    const serializedUser =
      typeof user.toObject === "function" ? user.toObject() : user;

    return {
      ...serializedUser,
      mapOpeningLocation,
      dashboardTheme,
    };
  },

  updateDashboardTheme: async function (currentUser, userId, themeData = {}) {
    const actor = await read.userById(currentUser.id);
    if (!actor) {
      throw createError(401, "User not authenticated");
    }

    const targetUser = await read.userById(userId);
    if (!targetUser) {
      throw createError(404, "Target user not found");
    }

    const existingTheme =
      normalizeDashboardTheme(targetUser.dashboardTheme) || {
        ...DEFAULT_DASHBOARD_THEME,
      };
    const normalizedTheme = normalizeDashboardTheme({
      ...existingTheme,
      ...(themeData || {}),
    });
    if (!normalizedTheme) {
      throw createError(
        400,
        "Invalid dashboard theme. Use a valid hex color like #0b70c2."
      );
    }

    if (actor.role === ROLES.ADMIN) {
      if (
        targetUser.role !== ROLES.ADMIN &&
        targetUser.role !== ROLES.ORGANIZATION
      ) {
        throw createError(
          403,
          "Admin can only set dashboard theme for admin or organization accounts."
        );
      }
    } else if (actor.role === ROLES.ORGANIZATION) {
      if (
        String(actor._id) !== String(targetUser._id) ||
        targetUser.role !== ROLES.ORGANIZATION
      ) {
        throw createError(
          403,
          "Organization can only update its own dashboard theme."
        );
      }
    } else {
      throw createError(403, "You are not authorized to update dashboard theme.");
    }

    const updatedUser = await update.userById(userId, {
      dashboardTheme: normalizedTheme,
    });

    if (!updatedUser) {
      throw createError(500, "Failed to update dashboard theme");
    }

    return {
      userId,
      dashboardTheme: normalizedTheme,
      message: "Dashboard theme updated successfully",
    };
  },

  partialUpdateUserById: async function (userId, userData) {
    const existingUser = await read.userById(userId);
    if (!existingUser) {
      throw createError(404, "User not found");
    }

    // Dashboard theme is managed via dedicated endpoint with role checks.
    if (Object.prototype.hasOwnProperty.call(userData, "dashboardTheme")) {
      delete userData.dashboardTheme;
    }

    if (userData.profilePicture && existingUser.profilePicture) {
      const oldProfilePicturePath = path.join(
        __dirname,
        "../../../public",
        existingUser.profilePicture
      );
      deleteFile(oldProfilePicturePath);
    }

    // if team_lead changed operator role to team_lead, unlink his team lead
    if (userData.role === ROLES.TEAM_LEAD) {
      userData.teamLead = null;
      // assign default devices
      const sites = await LeadSite.find({
        leadId: existingUser.teamLead,
      }).lean();
      const payload = sites.map((site) => ({
        siteId: site.siteId,
        leadId: userId,
      }));
      if (payload.length > 0) {
        await LeadSite.insertMany(payload);
      }
    }

    const updatedUser = await update.userById(userId, userData);
    if (!updatedUser) {
      throw createError(500, "User update failed");
    }

    return updatedUser;
  },
  deleteById: async function (userId) {
    const user = await remove.userById(userId);
    if (!user) {
      throw createError(404, "User not found");
    }

    return "User deleted successfully";
  },
};

export default userService;
