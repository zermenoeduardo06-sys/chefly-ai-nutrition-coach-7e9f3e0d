import { createRoot } from "react-dom/client";
import { Capacitor } from "@capacitor/core";
import { setWebviewBounce } from "capacitor-plugin-ios-webview-configurator";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import "./index.css";

// Disable iOS bounce/rubber-banding effect IMMEDIATELY on native platform
if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
  try {
    setWebviewBounce(false);
  } catch {
    // Plugin not available
  }
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
