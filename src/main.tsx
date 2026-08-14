import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

import "./styles/tokens.css";
import "./styles/globals.css";
import "./styles/layout.css";

// always start a fresh load at the top (Home) rather than restoring a prior
// scroll position — the hero should lead, and the nav should read "Home".
if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
