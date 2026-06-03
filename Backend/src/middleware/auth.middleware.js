import createError from "http-errors";

import { env } from "#config/index.js";
import { asyncHandler, decodeToken } from "#utils/index.js";

const { COOKIE_NAME } = env;

const verifyAuthToken = asyncHandler(async (req, res, next) => {
  // Check cookie first, then Authorization header
  let token = req.cookies[COOKIE_NAME];

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    throw createError(401, "Auth token is missing.");
  }

  const decoded = await decodeToken(token);
  if (!decoded) {
    throw createError(401, "Invalid or expired token.");
  }
  req.user = decoded;
  next();
});

const attachAuthUserIfPresent = asyncHandler(async (req, res, next) => {
  let token = req.cookies[COOKIE_NAME];

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return next();
  }

  const decoded = await decodeToken(token);
  if (decoded) {
    req.user = decoded;
  }

  next();
});

const verifyAuthRole = (...authorizedRole) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw createError(401, "Authentication required.");
    }
    if (!authorizedRole.includes(req.user.role)) {
      throw createError(
        403,
        `Access denied: ${authorizedRole.join(", ")} role required.`
      );
    }
    next();
  });

export { verifyAuthToken, attachAuthUserIfPresent, verifyAuthRole };
