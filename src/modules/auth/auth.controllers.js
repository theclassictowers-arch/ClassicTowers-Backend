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
    res.status(200).json({ message: result });
  }),
};

export default authController;
