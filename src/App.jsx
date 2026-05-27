import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import ChatPage from "./pages/ChatPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/layout/ProtectedRoute";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{ backgroundColor: "#0B1020" }}
        className="flex flex-col items-center justify-center w-screen h-screen gap-4"
      >
        {/* Logo */}
        <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center shadow-glow-purple-lg animate-float">
          <span className="text-white font-black text-2xl">M</span>
        </div>
        {/* Spinner */}
        <div className="flex gap-1.5">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
        <p className="text-mm-muted text-sm font-medium tracking-wide">
          Loading MindMesh...
        </p>
      </div>
    );
  }

  return (
    <div
      style={{ backgroundColor: "#0B1020" }}
      className="h-screen w-screen text-mm-text overflow-hidden"
    >
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1A2238",
            color: "#F9FAFB",
            border: "1px solid rgba(124,58,237,0.25)",
            borderRadius: "12px",
            fontSize: "13px",
          },
          success: {
            iconTheme: { primary: "#06B6D4", secondary: "#0B1020" },
          },
          error: {
            iconTheme: { primary: "#EF4444", secondary: "#0B1020" },
          },
        }}
      />

      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/chat" replace /> : <AuthPage />}
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
