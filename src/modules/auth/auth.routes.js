import express from "express";

import { signUpDto, signInDto, forgotPasswordDto, verifyOtpDto, resetPasswordDto } from "#dtos/index.js";
import { validateDto, verifyAuthToken, verifyAuthRole } from "#middleware/index.js";
import { ROLES } from "#constants/index.js";
import authController from "./auth.controllers.js";

export const authRoutes = express.Router();

authRoutes
  .post("/signup", verifyAuthToken, verifyAuthRole(ROLES.ADMIN, ROLES.ORGANIZATION, ROLES.TEAM_LEAD), validateDto(signUpDto), authController.signUp)
  .post("/signin", validateDto(signInDto), authController.signIn)
  .post("/signout", authController.signOut)
  .post(
    "/forgot-password",
    validateDto(forgotPasswordDto),
    authController.forgotPassword,
  )
  .post(
    "/verify-otp",
    validateDto(verifyOtpDto),
    authController.verifyOtp,
  )
  .post(
    "/reset-password",
    validateDto(resetPasswordDto),
    authController.resetPassword,
  )
  .get("/approve-account", authController.approveAccount);
