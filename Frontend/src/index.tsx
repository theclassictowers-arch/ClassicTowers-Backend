import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import setupLocatorUI from "@locator/runtime";
import App from "./App";
import "./index.css";

import { ContextProvider } from "./contexts";

if (process.env.NODE_ENV === "development") {
  setupLocatorUI();
}

const container = document.getElementById("root");

const root = createRoot(container!);
root.render(
  <StrictMode>
    <ContextProvider>
      <Suspense>
        <App />
      </Suspense>
    </ContextProvider>
  </StrictMode>
);
