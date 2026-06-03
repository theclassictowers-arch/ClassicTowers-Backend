import createError from "http-errors";

import {
  decodeToken,
  generateToken,
  sendVerificationNotification,
  sendVerificationEmail,
} from "#utils/index.js";
import { dataAccess } from "#dataAccess/index.js";

const { read, update } = dataAccess;

const emailService = {
  verifyEmail: async function (verificationToken) {
    const decoded = await decodeToken(verificationToken);
    if (!decoded) {
      throw createError(400, "Invalid verification token");
    }

    const userId = decoded.id;

    const isUserUpdated = await update.userById(userId, {
      isEmailVerified: true,
    });
    if (!isUserUpdated) {
      throw createError(500, "An error occurred while verifying the email");
    }

    return sendVerificationNotification();
  },

  sendVerificationEmail: async function (email) {
    const user = await read.userByEmail(email);
    if (!user) {
      throw createError(404, "User not found");
    }

    const verificationToken = generateToken(user._id);
    if (!verificationToken) {
      throw createError(500, "An error occurred while generating the token.");
    }

    const isEmailSent = await sendVerificationEmail(email, verificationToken);
    if (!isEmailSent) {
      throw createError(500, "Failed to send the welcome email.");
    }

    return "Verification email sent successfully";
  },
};

export default emailService;
