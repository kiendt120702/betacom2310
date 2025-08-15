import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import DebugErrorBoundary from "./components/DebugErrorBoundary.tsx";
import "./index.css";

// Add global error handler for debugging
window.addEventListener('error', (event) => {
  console.error('🚨 Global Error:', event.error);
  console.error('🚨 Error Message:', event.message);
  console.error('🚨 Error Source:', event.filename, 'Line:', event.lineno);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled Promise Rejection:', event.reason);
});

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root container missing in index.html");
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <DebugErrorBoundary>
      <App />
    </DebugErrorBoundary>
  </React.StrictMode>,
);
