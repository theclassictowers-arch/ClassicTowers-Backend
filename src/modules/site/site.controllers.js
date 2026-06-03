import { asyncHandler } from "#utils/index.js";
import siteService from "./site.services.js";

const siteController = {
  addSite: asyncHandler(async function (req, res) {
    const sensorsData = req.body;
    const result = await siteService.addSite(sensorsData, req.user);
    res.status(201).json(result);
  }),

  getAllSites: asyncHandler(async function (req, res) {
    const result = await siteService.getAllSites(req.user.id);
    res.status(200).json(result);
  }),

  getSiteById: asyncHandler(async function (req, res) {
    const { siteId } = req.params;
    const result = await siteService.getSiteById(siteId);
    res.status(200).json(result);
  }),

  partialUpdateSiteById: asyncHandler(async function (req, res) {
    const { siteId } = req.params;
    const updateData = req.body;
    const result = await siteService.partialUpdateSiteById(siteId, updateData);
    res.status(200).json(result);
  }),

  deleteSite: asyncHandler(async function (req, res) {
    const { siteId } = req.params;
    await siteService.deleteSite(siteId);
    res.status(204).send();
  }),
};

export default siteController;
