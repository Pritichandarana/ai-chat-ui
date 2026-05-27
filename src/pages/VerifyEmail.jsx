import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const API = import.meta.env.VITE_API_URL;

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("loading"); // 'loading', 'success', 'error'
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await fetch(`${API}/api/verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok) {
          setStatus("error");
          setMessage(data.error || "Email verification failed.");
          return;
        }

        setStatus("success");
        setMessage("Email verified successfully. You can now log in.");
        toast.success("Email verified successfully. You can now log in.");
      } catch (err) {
        console.error("VERIFY EMAIL ERROR:", err);
        setStatus("error");
        setMessage("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setStatus("error");
      setMessage("Verification token is missing.");
      setLoading(false);
    }
  }, [token]);

  return (
    <div className="relative min-h-screen w-screen flex items-center justify-center px-4 overflow-hidden" style={{ backgroundColor: "#0B1020" }}>
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7C3AED]/20 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#06B6D4]/15 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '10s' }} />

      <div 
        className="w-full max-w-md p-8 relative rounded-2xl glass-dark border border-white/5 z-10"
        style={{ 
          boxShadow: "0 24px 80px rgba(0,0,0,0.65), 0 0 40px rgba(124,58,237,0.12)",
        }}
      >
        <div className="flex flex-col items-center mb-6">
          <div 
            className="w-10 h-10 rounded-2xl gradient-bg flex items-center justify-center mb-3 animate-float shrink-0"
            style={{ boxShadow: "0 0 20px rgba(124,58,237,0.4)" }}
          >
            <span className="text-white font-black text-lg select-none">M</span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-white text-center">
            Email Verification
          </h2>
          <p className="text-xs text-mm-muted mt-1.5 text-center">
            MindMesh Security System
          </p>
        </div>

        {status === "loading" && (
          <div className="text-center py-6 space-y-4">
            <div className="flex justify-center gap-1.5 mb-2">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
            <p className="text-sm text-mm-muted">Verifying your token with the secure server...</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center space-y-5">
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              {message}
            </div>
            <p className="text-xs text-mm-muted">
              Your MindMesh ID has been activated. You can now log in and configure your AI workspaces.
            </p>
            <button
              onClick={() => navigate("/")}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 mt-6 flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
                boxShadow: "0 4px 20px rgba(124,58,237,0.35)"
              }}
            >
              Access Workspace
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="text-center space-y-5">
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {message}
            </div>
            <p className="text-xs text-mm-muted">
              If the token expired, you can log in on the main page to request a new link, or sign up again if the account wasn't created.
            </p>
            <button
              onClick={() => navigate("/")}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
