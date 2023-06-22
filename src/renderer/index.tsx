import "../assets/styles/index.css";
import { createRoot } from "react-dom/client";
import App from "./app";

const root = createRoot(document.getElementById("main"));

root.render(<App />);
