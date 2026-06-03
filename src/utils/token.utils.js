import jwt from "jsonwebtoken";
import createError from "http-errors";

import { env, logger } from "#config/index.js";

const { JWT_SECRET_KEY, JWT_EXPIRY } = env;

const generateToken = (userId, role) => {
  try {
    return jwt.sign({ id: userId, role }, JWT_SECRET_KEY, {
      expiresIn: JWT_EXPIRY,
    });
  } catch (error) {
    logger.error(
      `An error occurred while generating the token: ${error.message}`,
    );
    throw createError(500, "An error occurred while generating the token");
  }
};

const decodeToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET_KEY);
  } catch (error) {
    logger.error(
      `An error occurred while decoding the token: ${error.message}`,
    );
    throw createError(401, "Invalid token");
  }
};

export { generateToken, decodeToken };
