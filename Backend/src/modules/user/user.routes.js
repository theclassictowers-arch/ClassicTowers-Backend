import express from "express";

import userController from "./user.controllers.js";
import { verifyAuthRole } from "#middleware/index.js";
import { uploadFiles } from "#middleware/index.js";
import { ROLES } from "#constants/index.js";

export const userRoutes = express.Router();

userRoutes
  .get("/", verifyAuthRole(ROLES.ADMIN, ROLES.ORGANIZATION, ROLES.TEAM_LEAD), userController.getAll)
  .patch(
    "/:userId/dashboard-theme",
    verifyAuthRole(ROLES.ADMIN, ROLES.ORGANIZATION),
    userController.updateDashboardTheme
  )
  .get("/:userId", userController.getById)
  .patch("/:userId", uploadFiles, userController.partialUpdateUserById)
  .delete("/:userId", verifyAuthRole("admin"), userController.deleteById);

userRoutes
  .route("/:userId/sites")
  .get(userController.getAssignedSites)
  .post(verifyAuthRole(ROLES.ADMIN, ROLES.ORGANIZATION), userController.assignSite);
