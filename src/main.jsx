import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import { UIProvider } from "./context/UIContext";

import Toast from "./components/ui/Toast";
import Loader from "./components/ui/Loader";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <UIProvider>
        {" "}
        {/* ✅ MUST be outer */}
        <AuthProvider>
          <ChatProvider>
            <App />
            <Toast />
            <Loader />
          </ChatProvider>
        </AuthProvider>
      </UIProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
