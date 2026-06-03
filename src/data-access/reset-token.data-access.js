import { ResetToken } from "#models/index.js";

export const resetToken = {
  save: {
    resetToken: async (userId, email, otp, expiresAt) => {
      // Delete any existing tokens for this user
      await ResetToken.deleteMany({ userId });

      return await ResetToken.create({
        userId,
        email,
        otp,
        expiresAt,
      });
    },
  },

  read: {
    resetTokenByOtpAndEmail: async (otp, email) => await ResetToken.findOne({ otp, email }),
    resetTokenByUserId: async (userId) => await ResetToken.findOne({ userId }),
  },

  remove: {
    resetTokenByOtpAndEmail: async (otp, email) => await ResetToken.deleteOne({ otp, email }),
    resetTokenByUserId: async (userId) => await ResetToken.deleteMany({ userId }),
  },
};
