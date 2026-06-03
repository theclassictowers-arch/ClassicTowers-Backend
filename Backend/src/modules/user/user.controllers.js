import { LeadSite } from "#models/lead-sites.model.js";
import { Site } from "#models/site.model.js";
import { asyncHandler } from "#utils/index.js";
import createHttpError from "http-errors";
import userService from "./user.services.js";
import { ROLES } from "#constants/index.js";

const userController = {
  getAll: asyncHandler(async function (req, res) {
    const result = await userService.getAll(req.user, req.query);
    res.status(200).json({ data: result });
  }),

  getById: asyncHandler(async function (req, res) {
    const { userId } = req.params;
    const result = await userService.getById(userId);
    res.status(200).json(result);
  }),

  partialUpdateUserById: asyncHandler(async function (req, res) {
    const { userId } = req.params;
    const userData = req.body;

    if (req.files && req.files.profilePicture) {
      const file = req.files.profilePicture[0];
      userData.profilePicture = `/uploads/${file.filename}`;
    }

    const result = await userService.partialUpdateUserById(userId, userData);
    res.status(200).json(result);
  }),

  updateDashboardTheme: asyncHandler(async function (req, res) {
    const { userId } = req.params;
    const result = await userService.updateDashboardTheme(
      req.user,
      userId,
      req.body
    );
    res.status(200).json(result);
  }),

  deleteById: asyncHandler(async function (req, res) {
    const { userId } = req.params;
    const result = await userService.deleteById(userId);
    res.status(201).json(result);
  }),

  getAssignedSites: asyncHandler(async function (req, res) {
    const assignedSites = await LeadSite.find({ leadId: req.params.userId });
    const sites = await Site.find({
      _id: { $in: assignedSites.map((site) => site.siteId) },
    });
    res.status(200).json(sites);
  }),

  assignSite: asyncHandler(async function (req, res) {
    const { userId } = req.params;
    const { siteId } = req.body;
    const actor = await userService.getById(req.user.id);
    // validation
    const user = await userService.getById(userId);
    if (user.role !== ROLES.TEAM_LEAD) {
      throw createHttpError(403, "Only Team Lead can assign sites");
    }
    if (
      actor.role === ROLES.ORGANIZATION &&
      String(user.organization) !== String(actor._id)
    ) {
      throw createHttpError(403, "Team Lead does not belong to your organization");
    }
    const site = await Site.findById(siteId);
    if (!site) {
      throw createHttpError(404, "Site not found");
    }
    if (
      actor.role === ROLES.ORGANIZATION &&
      String(site.organization) !== String(actor._id)
    ) {
      throw createHttpError(403, "This site is not available for your organization");
    }

    const alreadyAssigned = await LeadSite.findOne({ leadId: userId, siteId });
    const assignedCount = await LeadSite.countDocuments({ leadId: userId });
    const assignedTowerLimit = Number(user.assignedTowerLimit || 0);
    if (!alreadyAssigned && assignedCount >= assignedTowerLimit) {
      throw createHttpError(
        400,
        `Team Lead tower limit reached. Maximum allowed: ${assignedTowerLimit}`
      );
    }

    const result = await LeadSite.updateOne(
      { leadId: userId, siteId: siteId },
      { $set: { leadId: userId, siteId: siteId } },
      { upsert: true, new: true }
    );
    res.status(201).json(result);
  }),
};

export default userController;
