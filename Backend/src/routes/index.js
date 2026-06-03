import express from "express";

import {
  authRoutes,
  archivesRoutes,
  siteRoutes,
  sensorRoutes,
  limitsRoutes,
  userRoutes,
  emailRoutes,
} from "#modules/index.js";
import { verifyAuthToken } from "#middleware/index.js";

const rootRouter = express.Router();
const v1Router = express.Router();

rootRouter.get("/", (_, res) => {
  res.json({ message: "Server is working..." });
});

rootRouter.use("/api/v1", v1Router);

v1Router.use(authRoutes, emailRoutes);
v1Router.use("/archives", archivesRoutes);
v1Router.use("/sites", siteRoutes);
v1Router.use("/sensors", sensorRoutes);
v1Router.use("/limits", verifyAuthToken, limitsRoutes);
v1Router.use("/users", verifyAuthToken, userRoutes);

export default rootRouter;
