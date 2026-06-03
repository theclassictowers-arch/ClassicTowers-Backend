import nodemailer from "nodemailer";

import { logger, env } from "./index.js";

const { EMAIL_HOST, EMAIL_PORT, USER_EMAIL, USER_PASSWORD } = env;

const createTransporter = () => {
  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465, // true for 465 (SSL), false for 587 (TLS)
    auth: { user: USER_EMAIL, pass: USER_PASSWORD },
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    sendTimeout: 30000,
    debug: true, // Enable debug output
    logger: true, // Log SMTP traffic
  });

  transporter.verify((error) => {
    if (error) {
      logger.error(`Email server connection error: ${error.message}`.red);
    } else {
      logger.info("Email server is ready to send messages.".brightMagenta);
    }
  });

  return transporter;
};

export const transporter = createTransporter();
