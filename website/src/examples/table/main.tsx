import React from "react";
import { createRoot } from "react-dom/client";
import TableExample from "./app";
import "./app.css";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<TableExample />);
}
