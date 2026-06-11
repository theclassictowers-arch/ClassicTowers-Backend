import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { logger, env, transporter } from "#config/index.js";

const { NODE_ENV, USER_EMAIL } = env;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const readEmailTemplate = (folder, filename) => {
  const filePath = path.join(__dirname, `../views/${folder}`, filename);
  return fs.readFileSync(filePath, "utf-8");
};

const sendVerificationEmail = async (toEmail, verificationToken) => {
  const backendUrl =
    NODE_ENV === "production"
      ? "https://api.theclassictowers.com"
      : "http://localhost:5000";

  let emailHtml = readEmailTemplate("verification-email", "index.html")
    .replace("${backendUrl}", backendUrl)
    .replace("${verificationToken}", verificationToken);

  const mailOptions = {
    from: USER_EMAIL,
    to: toEmail,
    subject: "Welcome to Classic Towers 🗼",
    html: emailHtml,
  };

  await transporter.sendMail(mailOptions);
  logger.info(`Verification email sent to ${toEmail}`);
  return true;
};

const sendResetPasswordEmail = async (toEmail, otp) => {
  let emailHtml = readEmailTemplate("reset-password-email", "index.html")
    .replace("${otp}", otp);

  const mailOptions = {
    from: USER_EMAIL,
    to: toEmail,
    subject: "Password Reset OTP - The Classic Towers",
    html: emailHtml,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Reset password OTP sent to ${toEmail}`);
    logger.info(`Message ID: ${info.messageId}`);
    logger.info(`Response: ${info.response}`);
    return true;
  } catch (error) {
    logger.error(`Failed to send reset email: ${error.message}`);
    throw error;
  }
};

const sendVerificationNotification = () => {
  return readEmailTemplate("verification-notification", "index.html");
};

const sendAccountApprovalEmail = async (toEmail, userName, userEmail, userRole, creatorName, approvalToken) => {
  const backendUrl =
    NODE_ENV === "production"
      ? "https://api.theclassictowers.com"
      : "http://localhost:5000";

  const approveUrl = `${backendUrl}/api/v1/approve-account?token=${approvalToken}&action=approve`;
  const rejectUrl = `${backendUrl}/api/v1/approve-account?token=${approvalToken}&action=reject`;

  let emailHtml = readEmailTemplate("account-approval", "index.html")
    .replace("${userName}", userName)
    .replace("${userEmail}", userEmail)
    .replace("${userRole}", userRole)
    .replace("${creatorName}", creatorName)
    .replace("${approveUrl}", approveUrl)
    .replace("${rejectUrl}", rejectUrl);

  const mailOptions = {
    from: USER_EMAIL,
    to: toEmail,
    subject: "Account Creation Request - ClassicTowerLab",
    html: emailHtml,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Account approval email sent to ${toEmail}`);
    logger.info(`Message ID: ${info.messageId}`);
    logger.info(`Response: ${info.response}`);
    return true;
  } catch (error) {
    logger.error(`Failed to send account approval email: ${error.message}`);
    throw error;
  }
};

export { sendVerificationEmail, sendResetPasswordEmail, sendVerificationNotification, sendAccountApprovalEmail };

