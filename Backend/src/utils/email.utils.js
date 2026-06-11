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
    subject: "Account Creation Request - TheClassicTowers",
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

const sendAccountApprovedUserEmail = async (toEmail, userName, userRole) => {
  const emailHtml = `
    <!doctype html>
    <html lang="en">
      <body style="font-family: Arial, sans-serif; background: #f5f7fb; color: #0f172a; padding: 32px;">
        <main style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 10px; padding: 28px; box-shadow: 0 14px 36px rgba(15, 23, 42, 0.12);">
          <h2 style="color: #0b70c2; margin-top: 0;">Welcome to TheClassicTowers</h2>
          <p>Hi <strong>${userName}</strong>,</p>
          <p>Your account has been approved and created successfully.</p>
          <p><strong>Role:</strong> ${userRole}</p>
          <p>You can now log in to TheClassicTowers with your email and password.</p>
          <p style="margin-bottom: 0;">Best Regards,<br />TheClassicTowers</p>
        </main>
      </body>
    </html>
  `;

  const mailOptions = {
    from: USER_EMAIL,
    to: toEmail,
    subject: "Your TheClassicTowers account is ready",
    html: emailHtml,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Account approval success email sent to ${toEmail}`);
    logger.info(`Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error(`Failed to send account success email: ${error.message}`);
    throw error;
  }
};

const sendAccountApprovedCreatorEmail = async (
  toEmail,
  creatorName,
  userName,
  userEmail,
  userRole,
) => {
  const emailHtml = `
    <!doctype html>
    <html lang="en">
      <body style="font-family: Arial, sans-serif; background: #f5f7fb; color: #0f172a; padding: 32px;">
        <main style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 10px; padding: 28px; box-shadow: 0 14px 36px rgba(15, 23, 42, 0.12);">
          <h2 style="color: #0b70c2; margin-top: 0;">User Joined TheClassicTowers</h2>
          <p>Hi <strong>${creatorName}</strong>,</p>
          <p><strong>${userName}</strong> has approved the account creation request and the account is now active.</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Role:</strong> ${userRole}</p>
          <p style="margin-bottom: 0;">Best Regards,<br />TheClassicTowers</p>
        </main>
      </body>
    </html>
  `;

  const mailOptions = {
    from: USER_EMAIL,
    to: toEmail,
    subject: `${userName} joined TheClassicTowers`,
    html: emailHtml,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Account approval creator email sent to ${toEmail}`);
    logger.info(`Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error(`Failed to send creator approval email: ${error.message}`);
    throw error;
  }
};

export {
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendVerificationNotification,
  sendAccountApprovalEmail,
  sendAccountApprovedUserEmail,
  sendAccountApprovedCreatorEmail,
};

