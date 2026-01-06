import { createRoot } from "react-dom/client";
import { Capacitor } from "@capacitor/core";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import "./index.css";

// Disable iOS bounce/rubber-banding effect on native platform
if (Capacitor.getPlatform() === 'ios') {
  import('capacitor-plugin-ios-webview-configurator').then(({ setWebviewBounce }) => {
    setWebviewBounce(false);
  }).catch(() => {
    // Plugin not available in web environment
  });
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
