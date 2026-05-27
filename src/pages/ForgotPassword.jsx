import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_URL;

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    setSuccess(false);

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 60000);

    try {
      const res = await fetch(`${API}/api/forgot-password`, {
        method: "POST",
        credentials: "include",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      clearTimeout(timeout);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send reset link");
      }

      setSuccess(true);
      setEmail("");
      toast.success("Reset link sent successfully");
    } catch (err) {
      clearTimeout(timeout);
      console.error("FORGOT ERROR:", err);
      if (err.name === "AbortError") {
        toast.error("Request timed out. Please try again.");
      } else {
        toast.error(err.message || "Something went wrong");
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
            Recover Account
          </h2>
          <p className="text-xs text-mm-muted mt-1.5 text-center">
            Enter your email to receive a password reset link
          </p>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              Reset link sent successfully! Check your inbox.
            </div>
            <button
              onClick={() => navigate("/")}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-mm-muted pl-1">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 text-sm text-white rounded-xl bg-white/5 border border-white/10 outline-none transition-all duration-200 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                placeholder="sarah@mindmesh.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                "Send Reset Link"
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              disabled={loading}
              className="w-full text-center text-xs text-mm-purple font-semibold hover:underline block pt-2"
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
