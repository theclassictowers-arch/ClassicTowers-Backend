import { asyncHandler } from "#utils/index.js";
import { env } from "#config/index.js";
import authService from "./auth.services.js";

const {
  NODE_ENV,
  COOKIE_NAME,
  COOKIE_HTTP_ONLY,
  COOKIE_SAME_SITE,
  COOKIE_EXPIRY,
  COOKIE_PATH,
} = env;

const sendAccountApprovalResult = (res, statusCode, title, message) => {
  res.status(statusCode).send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; font-family: Arial, sans-serif; background: #f5f7fb; color: #0f172a; }
      main { width: min(92vw, 520px); background: #ffffff; border-radius: 10px; box-shadow: 0 18px 45px rgba(15, 23, 42, 0.14); padding: 34px; text-align: center; }
      h1 { margin: 0 0 12px; font-size: 26px; color: #0b70c2; }
      p { margin: 0; font-size: 16px; line-height: 1.6; }
    </style>
  </head>
  <body>
    <main>
      <h1>${title}</h1>
      <p>${message}</p>
    </main>
  </body>
</html>`);
};

const cookieOptions = {
  httpOnly: COOKIE_HTTP_ONLY, // Important:  Prevent client-side JavaScript access
  secure: NODE_ENV === "production", // Send only over HTTPS in production
  sameSite: COOKIE_SAME_SITE, // Prevent CSRF attacks
  maxAge: COOKIE_EXPIRY,
  path: COOKIE_PATH, // Cookie is valid for the entire domain
};

const authController = {
  signUp: asyncHandler(async function (req, res) {
    const userData = req.body;
    const currentUser = req.user;
    const result = await authService.signUp(userData, currentUser);
    res.status(201).json(result);
  }),

  signIn: asyncHandler(async function (req, res) {
    const userData = req.body;
    const result = await authService.signIn(userData);
    const token = result.token;
    res
      .status(200)
      .set("Authorization", `Bearer ${token}`)
      .cookie(COOKIE_NAME, token, { ...cookieOptions })
      .json({ ...result, token });
  }),

  signOut: asyncHandler(async function (req, res) {
    const token = req.cookies[COOKIE_NAME];
    if (!token) {
      return res.status(400).json({ message: "No token found" });
    }
    const result = await authService.signOut(token);
    res
      .clearCookie(COOKIE_NAME, {
        ...cookieOptions,
        maxAge: undefined,
      })
      .status(200)
      .json(result);
  }),

  forgotPassword: asyncHandler(async function (req, res) {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res.status(200).json({ message: result });
  }),

  verifyOtp: asyncHandler(async function (req, res) {
    const { email, otp } = req.body;
    const result = await authService.verifyOtp(email, otp);
    res.status(200).json({ message: result });
  }),

  resetPassword: asyncHandler(async function (req, res) {
    const { email, otp, newPassword } = req.body;
    const result = await authService.resetPassword(email, otp, newPassword);
    res.status(200).json({ message: result });
  }),

  approveAccount: asyncHandler(async function (req, res) {
    const { token, action } = req.query;
    const result = await authService.approveAccount(token, action);
    const isRejected = action === "reject";

    sendAccountApprovalResult(
      res,
      200,
      isRejected ? "Request Rejected" : "Account Created Successfully",
      result,
    );
  }),
};

export default authController;

