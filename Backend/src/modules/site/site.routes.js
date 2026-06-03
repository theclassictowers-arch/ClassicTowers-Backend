import express from "express";

import { sensorDto } from "#dtos/index.js";
import { verifyAuthToken, attachAuthUserIfPresent, validateDto } from "#middleware/index.js";
import siteController from "./site.controllers.js";

export const siteRoutes = express.Router();

siteRoutes
  .post("/", attachAuthUserIfPresent, validateDto(sensorDto), siteController.addSite)
  .get("/", verifyAuthToken, siteController.getAllSites)
  .get("/:siteId", verifyAuthToken, siteController.getSiteById)
  .patch("/:siteId", verifyAuthToken, siteController.partialUpdateSiteById)
  .delete("/:siteId", verifyAuthToken, siteController.deleteSite);
