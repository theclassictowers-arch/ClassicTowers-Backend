import morgan from "morgan";
import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import cookieParser from "cookie-parser";
// eslint-disable-next-line no-unused-vars
import colors from "colors";

import { env, logger, swaggerSpec } from "#config/index.js";
import { UPLOAD_DIR } from "#constants/index.js";

const parseOrigins = (origins = "") =>
  origins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const configuredOrigins = parseOrigins(env.CORS_ORIGINS);
if (env.FRONTEND_URL) {
  configuredOrigins.push(env.FRONTEND_URL.trim());
}

const localOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const fallbackOrigins =
  env.NODE_ENV === "production" ? [] : localOrigins;

const allowedOrigins = [...new Set([...configuredOrigins, ...fallbackOrigins])];

const originValidator = (origin, callback) => {
  if (!origin || !allowedOrigins.length || allowedOrigins.includes(origin)) {
    return callback(null, true);
  }

  const corsError = new Error(`Origin ${origin} is not allowed by CORS`);
  corsError.statusCode = 403;
  return callback(corsError);
};

const corsOptions = {
  origin: originValidator,
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
  optionsSuccessStatus: 204,
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Core error properties
  const errorInfo = {
    status: err.statusCode || 500,
    message: err.message || "Something went wrong",
    stack: err.stack || "No stack trace available",
  };

  // Construct response object
  const error_response = {
    success: false,
    status: errorInfo.status,
    message: errorInfo.message,
    stack: errorInfo.stack,
  };

  logger.error(JSON.stringify(error_response, null, 2));
  res.status(errorInfo.status).json(error_response);
};

const invalidRouteHandler = (req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
};

const applyGlobalMiddleware = (app, rootRouter) => {
  app.use(morgan("dev"));
  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/uploads", express.static(UPLOAD_DIR));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use(rootRouter);
  app.use(invalidRouteHandler);
  app.use(errorHandler);
};

export { applyGlobalMiddleware };
