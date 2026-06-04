import createError from "http-errors";

import {
  decodeToken,
  generateToken,
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendAccountApprovalEmail,
} from "#utils/index.js";
import { logger } from "#config/index.js";
import { dataAccess } from "#dataAccess/index.js";
import { ROLES } from "#constants/index.js";
import { ResetToken, User } from "#models/index.js";
import crypto from "crypto";

const { save, read, remove, find } = dataAccess;
const DEFAULT_ORGANIZATION_MAP_ZOOM = 4.8;
const DEFAULT_DASHBOARD_THEME = {
  primaryColor: "#0b70c2",
  backgroundColor: "#f5f7fb",
  textColor: "#0f172a",
};
const DEFAULT_DASHBOARD_BRANDING = {
  logoText: "The Classic Towers",
  logoIcon: null,
};

const toValidMapOpeningLocation = (mapOpeningLocation) => {
  if (!mapOpeningLocation || typeof mapOpeningLocation !== "object") {
    return null;
  }

  const lat = Number(mapOpeningLocation.lat);
  const lng = Number(mapOpeningLocation.lng);
  const zoom =
    mapOpeningLocation.zoom === undefined || mapOpeningLocation.zoom === null
      ? DEFAULT_ORGANIZATION_MAP_ZOOM
      : Number(mapOpeningLocation.zoom);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    !Number.isFinite(zoom) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180 ||
    zoom < 1 ||
    zoom > 20
  ) {
    return null;
  }

  return { lat, lng, zoom };
};

const toValidDashboardTheme = (dashboardTheme) => {
  if (dashboardTheme === undefined || dashboardTheme === null) {
    return { ...DEFAULT_DASHBOARD_THEME };
  }

  if (typeof dashboardTheme !== "object") {
    return null;
  }

  const toHexOrNull = (value) => {
    const normalized = String(value || "")
      .trim()
      .toLowerCase();

    if (!/^#([a-f0-9]{6})$/.test(normalized)) {
      return null;
    }

    return normalized;
  };

  const primaryColor = toHexOrNull(
    dashboardTheme.primaryColor ?? DEFAULT_DASHBOARD_THEME.primaryColor
  );
  const backgroundColor = toHexOrNull(
    dashboardTheme.backgroundColor ?? DEFAULT_DASHBOARD_THEME.backgroundColor
  );
  const textColor = toHexOrNull(
    dashboardTheme.textColor ?? DEFAULT_DASHBOARD_THEME.textColor
  );

  if (!primaryColor || !backgroundColor || !textColor) {
    return null;
  }

  return { primaryColor, backgroundColor, textColor };
};

const toThemeWithFallback = (dashboardTheme) => {
  const parsed = toValidDashboardTheme(dashboardTheme);
  if (!parsed) {
    return { ...DEFAULT_DASHBOARD_THEME };
  }
  return parsed;
};

const toOptionalHexTheme = (dashboardTheme) => {
  if (dashboardTheme === undefined) {
    return undefined;
  }

  const parsed = toValidDashboardTheme(dashboardTheme);
  if (!parsed) {
    return null;
  }

  return parsed;
};

const resolveMapOpeningLocation = async (user) => {
  if (!user || user.role === ROLES.ADMIN) {
    return null;
  }

  if (user.role === ROLES.ORGANIZATION) {
    return toValidMapOpeningLocation(user.mapOpeningLocation);
  }

  if (user.organization) {
    const organization = await read.userById(user.organization);
    if (organization?.role === ROLES.ORGANIZATION) {
      return toValidMapOpeningLocation(organization.mapOpeningLocation);
    }
  }

  return null;
};

const resolveDashboardTheme = async (user) => {
  if (!user) {
    return { ...DEFAULT_DASHBOARD_THEME };
  }

  if (user.role === ROLES.ADMIN || user.role === ROLES.ORGANIZATION) {
    return toThemeWithFallback(user.dashboardTheme);
  }

  if (user.organization) {
    const organization = await read.userById(user.organization);
    if (organization?.role === ROLES.ORGANIZATION) {
      return toThemeWithFallback(organization.dashboardTheme);
    }
  }

  return { ...DEFAULT_DASHBOARD_THEME };
};

const resolveDashboardBranding = async (user) => {
  const normalize = (branding) => ({
    logoText: String(
      branding?.logoText || DEFAULT_DASHBOARD_BRANDING.logoText
    ).trim(),
    logoIcon: branding?.logoIcon || null,
  });
  if (!user) return { ...DEFAULT_DASHBOARD_BRANDING };
  if (user.role === ROLES.ADMIN || user.role === ROLES.ORGANIZATION) {
    return normalize(user.dashboardBranding);
  }
  if (user.organization) {
    const organization = await read.userById(user.organization);
    if (organization?.role === ROLES.ORGANIZATION) {
      return normalize(organization.dashboardBranding);
    }
  }
  return { ...DEFAULT_DASHBOARD_BRANDING };
};

const authService = {
  signUp: async function ({
    name,
    email,
    password,
    role,
    isEmailVerified,
    isApproved,
    teamLeadLimit,
    operatorLimit,
    towerLimit,
    assignedTowerLimit,
    organization,
    teamLead,
    mapOpeningLocation,
    dashboardTheme,
    operatorTowerDetails,
  }, currentUser) {
    const existingUser = await read.userByEmail(email);
    if (existingUser) {
      throw createError(400, "A user with this email already exists.");
    }

    // Get current user details
    const creator = await read.userById(currentUser.id);
    if (!creator) {
      throw createError(401, "Creator user not found.");
    }

    // Role-based validations and auto-assignments
    switch (creator.role) {
      case ROLES.ORGANIZATION:
        // Organization sirf Team Lead ya Operator add kar sakta hai
        if (role !== ROLES.TEAM_LEAD && role !== ROLES.OPERATOR) {
          throw createError(403, "Organization can only add Team Lead or Operator.");
        }

        // Check limits
        if (role === ROLES.TEAM_LEAD) {
          const existingTeamLeads = await find.many({
            organization: creator._id,
            role: ROLES.TEAM_LEAD
          });
          if (existingTeamLeads.length >= creator.teamLeadLimit) {
            throw createError(400, `Team Lead limit reached. Maximum allowed: ${creator.teamLeadLimit}`);
          }
          // Auto-assign organization
          organization = creator._id;
        }

        if (role === ROLES.OPERATOR) {
          const existingOperators = await find.many({
            organization: creator._id,
            role: ROLES.OPERATOR
          });
          if (existingOperators.length >= creator.operatorLimit) {
            throw createError(400, `Operator limit reached. Maximum allowed: ${creator.operatorLimit}`);
          }
          // Auto-assign organization
          organization = creator._id;

          // Validate team lead if provided
          if (teamLead) {
            const teamLeadUser = await read.userById(teamLead);
            if (!teamLeadUser || teamLeadUser.role !== ROLES.TEAM_LEAD) {
              throw createError(400, "Team lead does not exist.");
            }
            // Check if team lead belongs to same organization
            if (String(teamLeadUser.organization) !== String(creator._id)) {
              throw createError(400, "Team lead does not belong to your organization.");
            }
          }
        }
        break;

      case ROLES.TEAM_LEAD:
        // Team Lead sirf Operator add kar sakta hai
        if (role !== ROLES.OPERATOR) {
          throw createError(403, "Team Lead can only add Operator.");
        }

        // Check organization limit for operators
        if (creator.organization) {
          const orgUser = await read.userById(creator.organization);
          if (orgUser) {
            const existingOperators = await find.many({
              organization: creator.organization,
              role: ROLES.OPERATOR
            });
            if (existingOperators.length >= orgUser.operatorLimit) {
              throw createError(400, `Operator limit reached for organization. Maximum allowed: ${orgUser.operatorLimit}`);
            }
          }
        }

        // Auto-assign organization (Team Lead ki organization) and teamLead (khud)
        organization = creator.organization || null;
        teamLead = creator._id;
        break;

      case ROLES.ADMIN:
        // Admin sab kuch kar sakta hai - no limit checks
        // Validate organization if provided
        if (organization) {
          const orgUser = await read.userById(organization);
          if (!orgUser || orgUser.role !== ROLES.ORGANIZATION) {
            throw createError(400, "Organization does not exist.");
          }
        }
        // Validate team lead if provided
        if (teamLead) {
          const teamLeadUser = await read.userById(teamLead);
          if (!teamLeadUser || teamLeadUser.role !== ROLES.TEAM_LEAD) {
            throw createError(400, "Team lead does not exist.");
          }
        }
        break;

      default:
        throw createError(403, "You are not authorized to create users.");
    }

    // Build user data object
    const userData = {
      name,
      email,
      password,
      role,
      isEmailVerified,
      isApproved,
    };

    if (role === ROLES.TEAM_LEAD && organization && assignedTowerLimit) {
      const organizationUser = await read.userById(organization);
      const organizationTowerLimit = Number(organizationUser?.towerLimit || 0);
      if (Number(assignedTowerLimit) > organizationTowerLimit) {
        throw createError(
          400,
          `Team Lead tower limit cannot exceed organization tower limit (${organizationTowerLimit}).`
        );
      }
    }

    // Add organization-specific fields
    if (role === ROLES.ORGANIZATION || role === ROLES.ADMIN) {
      if (dashboardTheme !== undefined) {
        const parsedDashboardTheme = toOptionalHexTheme(dashboardTheme);
        if (!parsedDashboardTheme) {
          throw createError(400, "Invalid dashboard theme.");
        }
        userData.dashboardTheme = parsedDashboardTheme;
      }
    }

    if (role === ROLES.ORGANIZATION) {
      userData.teamLeadLimit = teamLeadLimit || 0;
      userData.operatorLimit = operatorLimit || 0;
      userData.towerLimit = towerLimit || 0;
      if (mapOpeningLocation !== undefined) {
        const parsedMapOpeningLocation =
          toValidMapOpeningLocation(mapOpeningLocation);
        if (!parsedMapOpeningLocation) {
          throw createError(400, "Invalid map opening location.");
        }
        userData.mapOpeningLocation = parsedMapOpeningLocation;
      }
    }

    // Add team_lead/operator references
    if (role === ROLES.TEAM_LEAD || role === ROLES.OPERATOR) {
      userData.organization = organization || null;
    }

    if (role === ROLES.TEAM_LEAD) {
      userData.assignedTowerLimit = assignedTowerLimit || 0;
    }

    if (role === ROLES.OPERATOR) {
      userData.teamLead = teamLead || null;
      if (operatorTowerDetails && typeof operatorTowerDetails === "object") {
        userData.operatorTowerDetails = {
          location: operatorTowerDetails.location || "",
          type: operatorTowerDetails.type || "",
          picture: operatorTowerDetails.picture || "",
          details: operatorTowerDetails.details || "",
        };
      }
    }

    // If the role is admin or organization, create account directly without approval
    if (role === ROLES.ADMIN || role === ROLES.ORGANIZATION) {
      const newUser = await save.user(userData);
      if (!newUser) {
        throw createError(500, "Failed to create a new user.");
      }
      return role === ROLES.ADMIN ? "Admin registered successfully" : "Organization registered successfully";
    }

    // For Team Lead and Operator, create pending user and send approval email
    // Generate unique approval token
    const approvalToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create pending user data
    const pendingUserData = {
      ...userData,
      approvalToken,
      expiresAt,
      createdBy: creator._id,
    };

    const pendingUser = await save.pendingUser(pendingUserData);
    if (!pendingUser) {
      throw createError(500, "Failed to create pending user.");
    }

    // Send approval email to the new user
    try {
      const isEmailSent = await sendAccountApprovalEmail(
        email,
        name,
        email,
        role,
        creator.name,
        approvalToken
      );

      if (!isEmailSent) {
        await remove.pendingUserById(pendingUser._id);
        throw createError(500, "Failed to send the account approval email.");
      }
    } catch (emailError) {
      logger.error(
        `Email sending error: ${
          emailError instanceof Error ? emailError.message : String(emailError)
        }`,
      );
      await remove.pendingUserById(pendingUser._id);
      throw createError(500, `Failed to send the account approval email: ${emailError.message}`);
    }

    return "Account creation request sent. User will receive an email for approval.";
  },

  signIn: async function ({ email, password }) {
    const existingUser = await read.userByEmail(email);
    if (!existingUser) {
      throw createError(401, "Invalid email or password.");
    }

    const isApproved = existingUser.isApproved;
    if (!isApproved) {
      throw createError(401, "User is not approved");
    }

    const isValid = await existingUser.comparePassword(password);
    if (!isValid) {
      throw createError(401, "Invalid email or password.");
    }

    const token = generateToken(existingUser._id, existingUser.role);
    if (!token) {
      throw createError(500, "Token generation failed");
    }

    const mapOpeningLocation = await resolveMapOpeningLocation(existingUser);
    const dashboardTheme = await resolveDashboardTheme(existingUser);
    const dashboardBranding = await resolveDashboardBranding(existingUser);

    const result = {
      userId: existingUser._id,
      role: existingUser.role,
      token,
      mapOpeningLocation,
      dashboardTheme,
      dashboardBranding,
    };

    return result;
  },

  signOut: async function (token) {
    const decoded = await decodeToken(token);
    if (!decoded) {
      throw createError(401, "The provided token is invalid or expired.");
    }

    const userId = decoded.userId;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    const blacklistedToken = await save.blacklistedToken(
      token,
      expiresAt,
      userId
    );

    if (!blacklistedToken) {
      throw createError(500, "An error occurred while blacklisting the token.");
    }

    return "Sign-out successful. The token has been invalidated.";
  },

  forgotPassword: async function (email) {
    const existingUser = await read.userByEmail(email);
    if (!existingUser) {
      throw createError(400, "A user with this email does not exist.");
    }

    // Generate 6-digit OTP
    const otp = ResetToken.generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save OTP to database
    const savedToken = await save.resetToken(existingUser._id, email, otp, expiresAt);
    if (!savedToken) {
      throw createError(500, "An error occurred while generating the OTP.");
    }

    // Send OTP email
    const isEmailSent = await sendResetPasswordEmail(email, otp);
    if (!isEmailSent) {
      await remove.resetTokenByUserId(existingUser._id);
      throw createError(500, "Failed to send the OTP email.");
    }

    return "OTP sent successfully. Please check your inbox.";
  },

  verifyOtp: async function (email, otp) {
    // Find OTP in database
    const resetTokenDoc = await read.resetTokenByOtpAndEmail(otp, email);
    if (!resetTokenDoc) {
      throw createError(400, "Invalid OTP.");
    }

    // Check if OTP is expired
    if (new Date() > resetTokenDoc.expiresAt) {
      await remove.resetTokenByOtpAndEmail(otp, email);
      throw createError(400, "OTP has expired. Please request a new one.");
    }

    return "OTP verified successfully.";
  },

  resetPassword: async function (email, otp, newPassword) {
    // Find OTP in database
    const resetTokenDoc = await read.resetTokenByOtpAndEmail(otp, email);
    if (!resetTokenDoc) {
      throw createError(400, "Invalid OTP.");
    }

    // Check if OTP is expired
    if (new Date() > resetTokenDoc.expiresAt) {
      await remove.resetTokenByOtpAndEmail(otp, email);
      throw createError(400, "OTP has expired. Please request a new one.");
    }

    // Find user and update password
    const user = await User.findById(resetTokenDoc.userId);
    if (!user) {
      throw createError(404, "User not found.");
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    // Delete used OTP
    await remove.resetTokenByOtpAndEmail(otp, email);

    return "Password reset successfully. You can now login with your new password.";
  },

  approveAccount: async function (approvalToken, action) {
    // Find pending user by token
    const pendingUserDoc = await read.pendingUserByToken(approvalToken);
    if (!pendingUserDoc) {
      throw createError(400, "Invalid or expired approval token.");
    }

    // Check if token is expired
    if (new Date() > pendingUserDoc.expiresAt) {
      await remove.pendingUserByToken(approvalToken);
      throw createError(400, "Approval request has expired.");
    }

    // If action is reject, delete pending user and return
    if (action === "reject") {
      await remove.pendingUserByToken(approvalToken);
      return "Account creation request has been rejected.";
    }

    // If action is approve, create the actual user account
    if (action === "approve") {
      // Check if user already exists
      const existingUser = await read.userByEmail(pendingUserDoc.email);
      if (existingUser) {
        await remove.pendingUserByToken(approvalToken);
        throw createError(400, "A user with this email already exists.");
      }

      // Create user data from pending user
      const userData = {
        name: pendingUserDoc.name,
        email: pendingUserDoc.email,
        password: pendingUserDoc.password,
        role: pendingUserDoc.role,
        isEmailVerified: pendingUserDoc.isEmailVerified,
        isApproved: pendingUserDoc.isApproved,
        organization: pendingUserDoc.organization,
        teamLead: pendingUserDoc.teamLead,
        assignedTowerLimit: pendingUserDoc.assignedTowerLimit || 0,
        operatorTowerDetails: pendingUserDoc.operatorTowerDetails,
      };

      // Add organization-specific fields if role is ORGANIZATION
      if (pendingUserDoc.role === ROLES.ORGANIZATION) {
        userData.teamLeadLimit = pendingUserDoc.teamLeadLimit || 0;
        userData.operatorLimit = pendingUserDoc.operatorLimit || 0;
        userData.towerLimit = pendingUserDoc.towerLimit || 0;
      }

      // Create the user
      const newUser = await save.user(userData);
      if (!newUser) {
        throw createError(500, "Failed to create user account.");
      }

      // Delete pending user after successful account creation
      await remove.pendingUserByToken(approvalToken);

      // Send welcome/verification email
      const verificationToken = generateToken(newUser._id);
      if (verificationToken) {
        await sendVerificationEmail(pendingUserDoc.email, verificationToken);
      }

      return "Account approved and created successfully. You can now login.";
    }

    throw createError(400, "Invalid action. Use 'approve' or 'reject'.");
  },
};

export default authService;
