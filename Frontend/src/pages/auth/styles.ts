export const formStyles = {
  pageBackground: {
    position: "fixed",
    inset: 0,
    minHeight: "100dvh",
    width: "100vw",
    m: 0,
    p: 0,
    overflow: "hidden",
    backgroundImage: "url('/images/login-bg.png')",
    backgroundSize: "100% 100%",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center center",
    backgroundAttachment: "fixed",
    display: "flex",
    justifyContent: "right",
    alignItems: "center",
  },
  container: {
    maxWidth: { xs: 320, sm: 400 },
    mx: "auto",
    mt: 8,
    px: 3,
    py: 4,
    background: "rgba(164, 198, 236, 0.25)",
    borderRadius: "16px",
    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
    backdropFilter: "blur(13.5px)",
    WebkitBackdropFilter: "blur(13.5px)",
    border: "1px solid rgba(164, 198, 236, 0.42)",
    transition: "all 0.3s ease",
    "&:hover": { boxShadow: 5 },
    "& .MuiTextField-root, & .MuiFormControl-root": {
      marginTop: "6px !important",
      marginBottom: "6px !important",
    },
    "& .MuiInputBase-input": {
      paddingTop: "9px",
      paddingBottom: "9px",
    },
    "& .MuiInputBase-inputSizeSmall": {
      paddingTop: "7px",
      paddingBottom: "7px",
    },
    "& .MuiSelect-select": {
      paddingTop: "9px",
      paddingBottom: "9px",
    },
    "& .MuiFormHelperText-root": {
      marginTop: "2px",
      lineHeight: 1.15,
    },
  },
  title: {
    textAlign: "center",
    fontWeight: "bold",
    color: "text.primary",
  },
  submitButton: {
    mt: 2,
    py: 1.5,
    fontSize: "1rem",
    borderRadius: 2,
    textTransform: "none",
    fontWeight: "bold",
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(180deg, rgba(86, 157, 255, 1) 0%, rgba(36, 101, 222, 1) 58%, rgba(18, 65, 168, 1) 100%)",
    border: "1px solid rgba(255, 255, 255, 0.44)",
    boxShadow:
      "0 8px 0 rgba(14, 57, 145, 0.9), 0 16px 28px rgba(15, 23, 42, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.52)",
    transform: "translateY(0) perspective(700px) rotateX(0deg)",
    transition:
      "transform 180ms ease, box-shadow 180ms ease, filter 180ms ease, background 220ms ease",
    "&::before": {
      content: "\"\"",
      position: "absolute",
      inset: 0,
      background:
        "linear-gradient(110deg, transparent 0%, rgba(255, 255, 255, 0.34) 42%, transparent 68%)",
      opacity: 0,
      transform: "translateX(-115%) skewX(-16deg)",
      transition: "opacity 180ms ease, transform 520ms ease",
    },
    "&:hover": {
      background:
        "linear-gradient(180deg, rgba(100, 171, 255, 1) 0%, rgba(45, 113, 238, 1) 58%, rgba(18, 72, 185, 1) 100%)",
      filter: "brightness(1.04)",
      transform: "translateY(-4px) perspective(700px) rotateX(5deg)",
      boxShadow:
        "0 12px 0 rgba(14, 57, 145, 0.92), 0 22px 34px rgba(15, 23, 42, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
      "&::before": {
        opacity: 1,
        transform: "translateX(115%) skewX(-16deg)",
      },
    },
    "&:active": {
      transform: "translateY(5px) perspective(700px) rotateX(0deg)",
      boxShadow:
        "0 3px 0 rgba(14, 57, 145, 0.95), 0 9px 16px rgba(15, 23, 42, 0.24), inset 0 2px 4px rgba(12, 45, 130, 0.24)",
    },
    "&.Mui-disabled": {
      background:
        "linear-gradient(180deg, rgba(126, 144, 168, 0.9) 0%, rgba(88, 104, 130, 0.9) 100%)",
      boxShadow:
        "0 6px 0 rgba(71, 85, 105, 0.45), 0 12px 20px rgba(15, 23, 42, 0.16)",
      transform: "none",
    },
  },
  linkText: {
    fontSize: "0.9rem",
    color: "text.secondary",
    textAlign: "center",
    mt: 1,
  },
  link: {
    fontWeight: "bold",
    textDecoration: "none",
    "&:hover": { textDecoration: "underline" },
  },
};
