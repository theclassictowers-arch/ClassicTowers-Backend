import { PendingUser } from "#models/index.js";

export const pendingUser = {
  save: {
    pendingUser: async (userData) => {
      // Delete any existing pending user with same email
      await PendingUser.deleteMany({ email: userData.email });

      return await PendingUser.create(userData);
    },
  },

  read: {
    pendingUserByToken: async (approvalToken) =>
      await PendingUser.findOne({ approvalToken }),
    pendingUserByEmail: async (email) =>
      await PendingUser.findOne({ email }),
    pendingUserById: async (id) =>
      await PendingUser.findById(id),
  },

  remove: {
    pendingUserById: async (id) =>
      await PendingUser.findByIdAndDelete(id),
    pendingUserByToken: async (approvalToken) =>
      await PendingUser.deleteOne({ approvalToken }),
    pendingUserByEmail: async (email) =>
      await PendingUser.deleteMany({ email }),
  },
};
