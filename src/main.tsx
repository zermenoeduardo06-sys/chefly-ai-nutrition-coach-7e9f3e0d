import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import "./index.css";

// NOTE: Scroll bounce is disabled via native Swift code in AppDelegate.swift
// and CSS (overscroll-behavior: none) - no plugin needed

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
