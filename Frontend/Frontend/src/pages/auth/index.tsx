import React, { useEffect, useState } from "react";
import { AuthPage as MUIAuthPage, type AuthProps } from "@refinedev/mui";
import { Box } from "@mui/material";
import SignUpForm from "./signup";
import SignInForm from "./signin";
import ForgotPasswordForm from "./forgotpassword";
import UpdatePasswordForm from "./updatepassword";
import VerifyOTPForm from "./verifyotp";
import { formStyles } from "./styles";

const renderSignUpForm = () => <SignUpForm />;
const renderSignInForm = () => <SignInForm />;
const renderForgotPasswordForm = () => <ForgotPasswordForm />;
const renderUpdatePasswordForm = () => <UpdatePasswordForm />;
const renderVerifyOTPForm = () => <VerifyOTPForm />;
const renderAuthContent = (content: React.ReactNode) => <div>{content}</div>;

export type AuthPageType = AuthProps["type"] | "verifyOtp";

const LIGHT_POINTS = [
  { id: "left-panel", x: 2.8, y: 42.1, width: 2.2, height: 6.7 },
  { id: "left-panel-glow", x: 2.2, y: 49.9, width: 1.9, height: 2.7 },
  { id: "tower-top", x: 31.7, y: 14.1, width: 1.2, height: 3.1 },
  { id: "tower-mid", x: 24.8, y: 51.8, width: 1.5, height: 4.3 },
  { id: "tower-base", x: 24.7, y: 58.3, width: 2.4, height: 2.8 },
  { id: "arch-left", x: 36.2, y: 62.5, width: 2.1, height: 3.0 },
  { id: "arch-right", x: 44.7, y: 60.2, width: 1.8, height: 2.7 },
  { id: "factory-top", x: 53.8, y: 37.2, width: 1.4, height: 2.9 },
  { id: "bridge-top", x: 67.2, y: 28.5, width: 1.3, height: 2.9 },
  { id: "bridge-bottom", x: 75.7, y: 59.4, width: 1.7, height: 3.0 },
  { id: "sensor-top", x: 74.1, y: 7.8, width: 1.3, height: 2.9 },
] as const;

export const AuthPage: React.FC<{ type: AuthPageType; formProps?: AuthProps["formProps"] }> = ({ type, formProps }) => {
  const [activeLightIndex, setActiveLightIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveLightIndex((prevIndex) => (prevIndex + 1) % LIGHT_POINTS.length);
    }, 850);

    return () => window.clearInterval(intervalId);
  }, []);

  const getRenderContent = () => {
    switch (type) {
      case "register":
        return renderSignUpForm;
      case "login":
        return renderSignInForm;
      case "forgotPassword":
        return renderForgotPasswordForm;
      case "updatePassword":
        return renderUpdatePasswordForm;
      case "verifyOtp":
        return renderVerifyOTPForm;
      default:
        return renderAuthContent;
    }
  };

  const animatedLights = (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {LIGHT_POINTS.map((light, index) => (
        <Box
          key={light.id}
          sx={{
            position: "absolute",
            left: `${light.x}%`,
            top: `${light.y}%`,
            width: `${light.width}%`,
            height: `${light.height}%`,
            transform: "translate(-50%, -50%)",
            borderRadius: "12px",
            backgroundColor: "rgba(3, 9, 12, 0.82)",
            boxShadow:
              "0 0 12px rgba(0, 0, 0, 0.62), 0 0 18px rgba(0, 0, 0, 0.5), inset 0 0 8px rgba(0, 0, 0, 0.65)",
            transition: "opacity 0.35s ease-in-out",
            opacity: activeLightIndex === index ? 0 : 1,
          }}
        />
      ))}
    </Box>
  );

  // verifyOtp ke liye MUIAuthPage use nahi karna kyunki wo sirf specific types accept karta hai
  if (type === "verifyOtp") {
    return (
      <Box
        sx={{
          ...formStyles.pageBackground,
        }}
      >
        {animatedLights}
        <Box sx={{ position: "relative", zIndex: 2 }}>
          <VerifyOTPForm />
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        ...formStyles.pageBackground,
      }}
    >
      {animatedLights}
      <Box sx={{ position: "relative", zIndex: 2 }}>
        <MUIAuthPage
          type={type}
          renderContent={getRenderContent()}
          formProps={formProps}
        />
      </Box>
    </Box>
  );
};

export default AuthPage;
