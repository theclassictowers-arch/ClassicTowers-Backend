import { ROLES } from "#constants/index.js";
import Joi from "joi";

const nameValidation = Joi.string().trim().min(2).required().messages({
  "string.base": "Name should be a type of text",
  "string.empty": "Name should not be empty",
  "string.min": "Name must be at least 2 characters long",
  "any.required": "Name is required",
});

const emailValidation = Joi.string()
  .email()
  .trim()
  .lowercase()
  .required()
  .messages({
    "string.base": "Email should be a type of text",
    "string.email": "Please provide a valid email address",
    "string.empty": "Email should not be empty",
    "any.required": "Email is required",
  });

const passwordValidation = Joi.string()
  .trim()
  .min(8)
  .max(18)
  .pattern(/^[A-Za-z0-9@#?!&$%^*()\-_+=<>[\]{}|:;"',.~`]+$/)
  .custom((value, helpers) => {
    const letters = value.match(/[A-Za-z]/g) || [];
    const numbers = value.match(/[0-9]/g) || [];
    const specials = value.match(/[^A-Za-z0-9]/g) || [];

    if (letters.length < 2) {
      return helpers.error("password.minLetters");
    }
    if (numbers.length < 2) {
      return helpers.error("password.minNumbers");
    }
    if (specials.length < 2) {
      return helpers.error("password.minSpecials");
    }

    return value;
  })
  .required()
  .messages({
    "string.base": "Password should be a type of text",
    "string.empty": "Password should not be empty",
    "string.min": "Password must be at least 8 characters long",
    "string.max": "Password must not exceed 18 characters",
    "string.pattern.base": "Password contains invalid characters or spaces",
    "any.required": "Password is required",
    "password.minLetters": "Password must include at least two letters",
    "password.minNumbers": "Password must include at least two numbers",
    "password.minSpecials":
      "Password must include at least two special characters",
  });

const roleValidation = Joi.string()
  .valid(...Object.values(ROLES))
  .messages({
    "string.base": "Role should be a type of text",
    "any.only": "Role must be either admin or operator",
  });

const isApprovedValidation = Joi.boolean().messages({
  "boolean.base": "Is approved should be a type of boolean",
  "any.required": "Is approved is required",
});

const isEmailVerifiedValidation = Joi.boolean().messages({
  "boolean.base": "Is email verified should be a type of boolean",
  "any.required": "Is email verified is required",
});

const signUpDto = Joi.object({
  name: nameValidation,
  email: emailValidation,
  password: passwordValidation,
  role: roleValidation,
  isEmailVerified: isEmailVerifiedValidation,
  isApproved: isApprovedValidation,
  // Organization ke liye limits
  teamLeadLimit: Joi.number().min(0).optional().messages({
    "number.base": "Team lead limit should be a number",
    "number.min": "Team lead limit cannot be negative",
  }),
  operatorLimit: Joi.number().min(0).optional().messages({
    "number.base": "Operator limit should be a number",
    "number.min": "Operator limit cannot be negative",
  }),
  towerLimit: Joi.number().min(0).optional().messages({
    "number.base": "Tower limit should be a number",
    "number.min": "Tower limit cannot be negative",
  }),
  assignedTowerLimit: Joi.number().min(0).optional().messages({
    "number.base": "Assigned tower limit should be a number",
    "number.min": "Assigned tower limit cannot be negative",
  }),
  // Team Lead/Operator ke liye organization reference
  organization: Joi.string().optional().messages({
    "string.base": "Organization ID should be a type of text",
  }),
  // Operator ke liye team lead reference
  teamLead: Joi.string().optional().messages({
    "string.base": "Team lead ID should be a type of text",
  }),
  mapOpeningLocation: Joi.object({
    lat: Joi.number().min(-90).max(90).required().messages({
      "number.base": "Latitude should be a number",
      "number.min": "Latitude must be greater than or equal to -90",
      "number.max": "Latitude must be less than or equal to 90",
      "any.required": "Latitude is required",
    }),
    lng: Joi.number().min(-180).max(180).required().messages({
      "number.base": "Longitude should be a number",
      "number.min": "Longitude must be greater than or equal to -180",
      "number.max": "Longitude must be less than or equal to 180",
      "any.required": "Longitude is required",
    }),
    zoom: Joi.number().min(1).max(20).optional().messages({
      "number.base": "Zoom should be a number",
      "number.min": "Zoom must be greater than or equal to 1",
      "number.max": "Zoom must be less than or equal to 20",
    }),
  }).optional(),
  dashboardTheme: Joi.object({
    primaryColor: Joi.string()
      .pattern(/^#([A-Fa-f0-9]{6})$/)
      .required()
      .messages({
        "string.base": "Primary color should be a text value",
        "string.pattern.base":
          "Primary color must be a valid hex value like #0b70c2",
        "any.required": "Primary color is required",
      }),
    backgroundColor: Joi.string()
      .pattern(/^#([A-Fa-f0-9]{6})$/)
      .required()
      .messages({
        "string.base": "Background color should be a text value",
        "string.pattern.base":
          "Background color must be a valid hex value like #f5f7fb",
        "any.required": "Background color is required",
      }),
    textColor: Joi.string()
      .pattern(/^#([A-Fa-f0-9]{6})$/)
      .required()
      .messages({
        "string.base": "Text color should be a text value",
        "string.pattern.base":
          "Text color must be a valid hex value like #0f172a",
        "any.required": "Text color is required",
      }),
  }).optional(),
  operatorTowerDetails: Joi.object({
    location: Joi.string().allow("").optional(),
    type: Joi.string().allow("").optional(),
    picture: Joi.string().allow("").uri().optional().messages({
      "string.uri": "Tower picture must be a valid URL",
    }),
    details: Joi.string().allow("").optional(),
  }).optional(),
  loginUrl: Joi.string().uri({ scheme: ["http", "https"] }).optional().messages({
    "string.uri": "Login URL must be a valid URL",
  }),
});

const signInDto = Joi.object({
  email: emailValidation,
  password: passwordValidation,
});

const forgotPasswordDto = Joi.object({
  email: emailValidation,
});

const otpValidation = Joi.string()
  .length(6)
  .pattern(/^[0-9]+$/)
  .required()
  .messages({
    "string.base": "OTP should be a type of text",
    "string.empty": "OTP should not be empty",
    "string.length": "OTP must be exactly 6 digits",
    "string.pattern.base": "OTP must contain only numbers",
    "any.required": "OTP is required",
  });

const verifyOtpDto = Joi.object({
  email: emailValidation,
  otp: otpValidation,
});

const resetPasswordDto = Joi.object({
  email: emailValidation,
  otp: otpValidation,
  newPassword: passwordValidation,
});

export { signUpDto, signInDto, forgotPasswordDto, verifyOtpDto, resetPasswordDto };
