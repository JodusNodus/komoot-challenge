import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { RouteDataProvider } from "./Map/RouteDataContext";

ReactDOM.render(
  <React.StrictMode>
    <RouteDataProvider>
      <App />
    </RouteDataProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
