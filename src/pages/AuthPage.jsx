import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { SparklesIcon, EyeOffIcon } from "../components/ui/Icons";

const API = import.meta.env.VITE_API_URL;

export default function AuthPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Email validation regex
  const validateEmail = (emailStr) => {
    return /\S+@\S+\.\S+/.test(emailStr);
  };

  // ✅ SUBMIT ACTION
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSignup && !name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!email.trim() || !validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const endpoint = isSignup ? "/api/signup" : "/api/login";

    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isSignup ? { name, email, password } : { email, password }
        ),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || `${isSignup ? "Signup" : "Login"} failed`);
        setLoading(false);
        return;
      }

      if (isSignup) {
        toast.success("Account created successfully! Please log in.");
        setIsSignup(false);
        setPassword("");
      } else {
        if (data.user) {
          toast.success(`Welcome back, ${data.user.name.split(" ")[0]}!`);
          login(data.user);
          navigate("/chat");
        } else {
          toast.error("User data missing from response");
        }
      }
    } catch (err) {
      console.error("AUTH ERROR:", err);
      toast.error("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-screen flex items-center justify-center px-4 overflow-hidden" style={{ backgroundColor: "#0B1020" }}>
      {/* ─── Cyberpunk Background Blobs ─── */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7C3AED]/20 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#06B6D4]/15 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '10s' }} />

      {/* Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* ─── Auth Card ─── */}
      <div 
        className="w-full max-w-md p-8 relative rounded-2xl glass-dark border border-white/5 transition-all duration-300 z-10"
        style={{ 
          boxShadow: "0 24px 80px rgba(0,0,0,0.65), 0 0 40px rgba(124,58,237,0.12)",
        }}
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div 
            className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center mb-3 animate-float shrink-0"
            style={{ boxShadow: "0 0 20px rgba(124,58,237,0.5)" }}
          >
            <span className="text-white font-black text-xl select-none">M</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white text-center">
            {isSignup ? "Create MindMesh ID" : "Connect to MindMesh"}
          </h2>
          <p className="text-xs text-mm-muted mt-1.5 text-center">
            {isSignup ? "Start your advanced AI workspace" : "Your next-generation AI workspace"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-mm-muted pl-1">Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 text-sm text-white rounded-xl bg-white/5 border border-white/10 outline-none transition-all duration-200 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] focus:bg-white/[0.07]"
                placeholder="Sarah Connor"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-mm-muted pl-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 text-sm text-white rounded-xl bg-white/5 border border-white/10 outline-none transition-all duration-200 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] focus:bg-white/[0.07]"
              placeholder="sarah@mindmesh.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-mm-muted">Password</label>
              {!isSignup && (
                <span
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs text-mm-cyan cursor-pointer hover:text-mm-cyan-light hover:underline transition-colors"
                >
                  Forgot Password?
                </span>
              )}
            </div>
            
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full px-4 py-3 text-sm text-white rounded-xl bg-white/5 border border-white/10 outline-none transition-all duration-200 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] focus:bg-white/[0.07] pr-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                <EyeOffIcon size={14} />
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 mt-6 flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
              boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
              cursor: loading ? "not-allowed" : "pointer"
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.boxShadow = "0 6px 26px rgba(124,58,237,0.5)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(124,58,237,0.35)";
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <>
                <SparklesIcon size={14} />
                {isSignup ? "Register Account" : "Access Workspace"}
              </>
            )}
          </button>
        </form>

        {/* Footer Toggle */}
        <p className="mt-6 text-xs text-center text-mm-muted">
          {isSignup ? "Already have an account?" : "New to MindMesh?"}
          <span
            onClick={() => {
              setIsSignup(!isSignup);
              setPassword("");
            }}
            className="ml-1.5 text-mm-purple font-semibold cursor-pointer hover:underline hover:text-mm-purple-light transition-colors"
          >
            {isSignup ? "Sign In" : "Create Account"}
          </span>
        </p>
      </div>
    </div>
  );
}
