import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css"; // <-- Tailwind is applied through PostCSS here

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

