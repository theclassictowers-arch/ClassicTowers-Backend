import { BlacklistedToken } from "#models/index.js";

export const blacklistedToken = {
  save: {
    blacklistedToken: async (token) => await BlacklistedToken.create({ token }),
  },
};
