import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_URL;

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      toast.success("Password reset successful! Please log in.");
      navigate("/");
    } catch (err) {
      console.error("RESET ERROR:", err);
      if (err.message.includes("expired")) {
        toast.error("Link expired. Request a new one.");
      } else {
        toast.error(err.message || "Failed to reset password");
      }
    } finally {
      setLoading(false);
    }
  };

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
            Reset Password
          </h2>
          <p className="text-xs text-mm-muted mt-1.5 text-center">
            Enter your new password to regain access
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-mm-muted pl-1">New Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 text-sm text-white rounded-xl bg-white/5 border border-white/10 outline-none transition-all duration-200 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 mt-6 flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
              boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              "Update Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
