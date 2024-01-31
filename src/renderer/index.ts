import "./assets/styles/index.css";
import { createRoot } from "react-dom/client";
import App from "./app";
import React from "react";

const root = createRoot(document.getElementById("main"));

root.render(React.createElement(App));
