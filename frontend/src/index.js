import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      {/* Global toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1e2333",
            color: "#e2e8f0",
            border: "1px solid #2a3045",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px",
          },
          success: { iconTheme: { primary: "#6ee7b7", secondary: "#0a2e22" } },
          error:   { iconTheme: { primary: "#f87171", secondary: "#2a0a0a" } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
