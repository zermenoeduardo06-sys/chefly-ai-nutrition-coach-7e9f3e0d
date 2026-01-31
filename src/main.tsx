import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import "./index.css";

// Note: iOS bounce/rubber-banding is disabled via native Swift code in AppDelegate.swift
// The capacitor-plugin-ios-webview-configurator was removed due to Capacitor 8 incompatibility

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
