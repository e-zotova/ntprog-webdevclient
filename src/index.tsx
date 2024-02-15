import React from "react";
import ReactDOM from "react-dom/client";
import { WSProvider } from "./websocket/WSProvider";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <WSProvider>
      <App />
    </WSProvider>
  </React.StrictMode>
);
