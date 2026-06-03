import express from "express";

import emailController from "./email.controllers.js";

export const emailRoutes = express.Router();

emailRoutes
  .get("/verify-email/:verificationToken", emailController.verifyEmail)
  .post("/send-verification-email", emailController.sendVerificationEmail);
