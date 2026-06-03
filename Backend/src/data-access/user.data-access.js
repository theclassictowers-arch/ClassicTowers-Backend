import { User } from "#models/index.js";

export const user = {
  save: {
    user: async (userData) => {
      return await User.create(userData);
    },
  },

  read: {
    allUsers: async () => await User.find(),
    userByEmail: async (email) => await User.findOne({ email }),
    userById: async (userId) => await User.findById(userId).select("-password"),
  },

  update: {
    userById: async (userId, userData) =>
      await User.findByIdAndUpdate(userId, userData),
  },

  remove: {
    userById: async (userId) => await User.findByIdAndDelete(userId),
  },
  find: {
    one: async (filters) => await User.find(filters).select("-password"),
    many: async (filters) =>
      await User.find(filters).select("-password").lean(),
  },
};
