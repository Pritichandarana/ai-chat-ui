import { useState, useEffect } from "react";
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
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resending, setResending] = useState(false);

  // OTP Verification flow states
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Strict email validation regex
  const validateEmail = (emailStr) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(emailStr);
  };

  // ✅ SEND OTP
  const handleSendOTP = async () => {
    const cleanedEmail = email.trim().toLowerCase();
    if (!cleanedEmail || !validateEmail(cleanedEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    const disposableDomains = [
      "mailinator.com",
      "tempmail.com",
      "10minutemail.com",
      "guerrillamail.com",
      "yopmail.com",
      "fakeinbox.com"
    ];
    const domain = cleanedEmail.split("@")[1];
    if (disposableDomains.includes(domain?.toLowerCase())) {
      toast.error("Temporary email addresses are not supported.");
      return;
    }

    setSendingOtp(true);
    try {
      const res = await fetch(`${API}/api/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanedEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to send verification code.");
        return;
      }

      toast.success("Verification code sent to your email");
      setOtpSent(true);
      setTimer(30);
      setOtpCode(""); // clear previous code
    } catch (err) {
      console.error("SEND OTP ERROR:", err);
      toast.error("Unable to connect to the server");
    } finally {
      setSendingOtp(false);
    }
  };

  // ✅ VERIFY OTP
  const handleVerifyOTP = async (code) => {
    const cleanedEmail = email.trim().toLowerCase();
    setVerifyingOtp(true);
    try {
      const res = await fetch(`${API}/api/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanedEmail, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Invalid verification code.");
        return;
      }

      toast.success("Email verified successfully.");
      setIsEmailVerified(true);
      setVerificationToken(data.token);
      setOtpSent(false);
    } catch (err) {
      console.error("VERIFY OTP ERROR:", err);
      toast.error("Unable to connect to the server");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleOtpChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtpCode(val);
    if (val.length === 6) {
      handleVerifyOTP(val);
    }
  };

  // ✅ SUBMIT ACTION
  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanedEmail = email.trim().toLowerCase();

    if (isSignup && !name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!cleanedEmail || !validateEmail(cleanedEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (isSignup && !isEmailVerified) {
      toast.error("Please verify your email address first.");
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
          isSignup
            ? { name, email: cleanedEmail, password, verificationToken }
            : { email: cleanedEmail, password }
        ),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403 && data.needsVerification) {
          toast.error(data.error || "Please verify your email before logging in.");
          setUnverifiedEmail(cleanedEmail);
          setLoading(false);
          return;
        }
        toast.error(data.error || `${isSignup ? "Signup" : "Login"} failed`);
        setLoading(false);
        return;
      }

      if (isSignup) {
        toast.success("Account created successfully. Verification link sent to your email.");
        setSignupSuccess(true);
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

  // ✅ RESEND VERIFICATION ACTION
  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    setResending(true);
    try {
      const res = await fetch(`${API}/api/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: unverifiedEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to resend verification link.");
        return;
      }

      toast.success("Verification link resent! Check your inbox.");
    } catch (err) {
      console.error("RESEND ERROR:", err);
      toast.error("Unable to connect to the server");
    } finally {
      setResending(false);
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
        {signupSuccess ? (
          <div className="space-y-6 text-center">
            <div className="flex flex-col items-center">
              <div 
                className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center mb-3 animate-float shrink-0"
                style={{ boxShadow: "0 0 20px rgba(124,58,237,0.5)" }}
              >
                <span className="text-white font-black text-xl select-none">M</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">
                Verify Your Email
              </h2>
              <p className="text-xs text-mm-muted mt-1.5">
                Activation link sent
              </p>
            </div>

            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm leading-relaxed text-left">
              Account created successfully. Verification link sent to your email (<strong className="text-white break-all">{email}</strong>).
            </div>

            <p className="text-xs text-mm-muted leading-relaxed">
              Didn't receive the email? Check your spam folder or wait a few minutes before trying to request a new link.
            </p>

            <button
              onClick={() => {
                setSignupSuccess(false);
                setIsSignup(false);
                setName("");
                setEmail("");
                setPassword("");
              }}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 mt-4 flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
                boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
              }}
            >
              Back to Sign In
            </button>
          </div>
        ) : unverifiedEmail ? (
          <div className="space-y-6 text-center">
            <div className="flex flex-col items-center">
              <div 
                className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center mb-3 animate-float shrink-0"
                style={{ boxShadow: "0 0 20px rgba(239,68,68,0.4)" }}
              >
                <span className="text-white font-black text-xl select-none">!</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">
                Activation Pending
              </h2>
              <p className="text-xs text-mm-muted mt-1.5">
                Activate your account to log in
              </p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm leading-relaxed text-left">
              The account for <strong className="text-white break-all">{unverifiedEmail}</strong> exists but email verification is pending. Please verify your email before logging in.
            </div>

            <div className="space-y-3 mt-4">
              <button
                onClick={handleResendVerification}
                disabled={resending}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
                  boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
                  cursor: resending ? "not-allowed" : "pointer"
                }}
              >
                {resending ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  "Resend Verification Link"
                )}
              </button>

              <button
                onClick={() => {
                  setUnverifiedEmail("");
                  setPassword("");
                }}
                disabled={resending}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        ) : (
          <>
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
                <div className="relative">
                  <input
                    type="email"
                    required
                    disabled={isSignup && isEmailVerified}
                    className="w-full px-4 py-3 text-sm text-white rounded-xl bg-white/5 border border-white/10 outline-none transition-all duration-200 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] focus:bg-white/[0.07] pr-28"
                    placeholder="sarah@mindmesh.ai"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {isSignup && (
                    <button
                      type="button"
                      disabled={isEmailVerified || sendingOtp}
                      onClick={handleSendOTP}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center"
                      style={
                        isEmailVerified
                          ? {
                              color: "#06B6D4",
                              background: "rgba(6,182,212,0.1)",
                              border: "1px solid rgba(6,182,212,0.25)"
                            }
                          : {
                              background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
                              color: "#FFFFFF",
                              boxShadow: "0 2px 10px rgba(124,58,237,0.25)",
                              cursor: sendingOtp ? "not-allowed" : "pointer"
                            }
                      }
                      onMouseEnter={(e) => {
                        if (!isEmailVerified && !sendingOtp) {
                          e.currentTarget.style.boxShadow = "0 4px 14px rgba(124,58,237,0.45)";
                          e.currentTarget.style.transform = "translateY(-1px) translateY(-50%)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isEmailVerified && !sendingOtp) {
                          e.currentTarget.style.boxShadow = "0 2px 10px rgba(124,58,237,0.25)";
                          e.currentTarget.style.transform = "translateY(0) translateY(-50%)";
                        }
                      }}
                    >
                      {sendingOtp ? (
                        <div className="w-3 h-3 rounded-full border border-white/30 border-t-white animate-spin" />
                      ) : isEmailVerified ? (
                        "Verified ✓"
                      ) : (
                        "Verify"
                      )}
                    </button>
                  )}
                </div>
                {isSignup && isEmailVerified && (
                  <p className="text-xs text-mm-cyan pl-1 mt-1 font-semibold flex items-center gap-1 animate-fade-in">
                    ✓ Email Verified
                  </p>
                )}
              </div>

              {/* OTP CODE INPUT (Slides down after verification code sent) */}
              {isSignup && otpSent && !isEmailVerified && (
                <div className="space-y-1.5 animate-slide-down">
                  <label className="text-xs font-semibold uppercase tracking-wider text-mm-muted pl-1">
                    Verification Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      className="w-full px-4 py-3 text-sm text-white text-center rounded-xl bg-white/5 border border-white/10 outline-none transition-all duration-200 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] tracking-[0.5em] font-mono"
                      placeholder="••••••"
                      value={otpCode}
                      onChange={handleOtpChange}
                      disabled={verifyingOtp}
                    />
                    {verifyingOtp && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 rounded-full border-2 border-[#06B6D4]/30 border-t-[#06B6D4] animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center px-1 pt-1 text-xs">
                    <span className="text-mm-muted">
                      {timer > 0 ? `Resend in ${timer} sec` : "Ready to resend"}
                    </span>
                    <button
                      type="button"
                      disabled={timer > 0 || sendingOtp}
                      onClick={handleSendOTP}
                      className={`font-semibold transition-colors ${
                        timer > 0
                          ? "text-gray-600 cursor-not-allowed"
                          : "text-mm-purple hover:text-mm-purple-light underline"
                      }`}
                    >
                      Resend Code
                    </button>
                  </div>
                </div>
              )}

              {/* PASSWORD FIELD (Fades in after email verification succeeds) */}
              {(!isSignup || isEmailVerified) && (
                <div className="space-y-1.5 animate-slide-down">
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
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || (isSignup && (!name.trim() || !isEmailVerified || password.length < 6))}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 mt-6 flex items-center justify-center gap-2"
                style={{
                  background: isSignup && (!name.trim() || !isEmailVerified || password.length < 6)
                    ? "rgba(255,255,255,0.04)"
                    : "linear-gradient(135deg, #7C3AED, #06B6D4)",
                  border: isSignup && (!name.trim() || !isEmailVerified || password.length < 6)
                    ? "1px solid rgba(255,255,255,0.05)"
                    : "none",
                  boxShadow: isSignup && (!name.trim() || !isEmailVerified || password.length < 6)
                    ? "none"
                    : "0 4px 20px rgba(124,58,237,0.35)",
                  cursor: loading || (isSignup && (!name.trim() || !isEmailVerified || password.length < 6))
                    ? "not-allowed"
                    : "pointer",
                  color: isSignup && (!name.trim() || !isEmailVerified || password.length < 6)
                    ? "#4B5563"
                    : "#FFFFFF"
                }}
                onMouseEnter={(e) => {
                  if (!loading && (!isSignup || (name.trim() && isEmailVerified && password.length >= 6))) {
                    e.currentTarget.style.boxShadow = "0 6px 26px rgba(124,58,237,0.5)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && (!isSignup || (name.trim() && isEmailVerified && password.length >= 6))) {
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
                    {isSignup ? "Create Account" : "Access Workspace"}
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
                  setIsEmailVerified(false);
                  setVerificationToken("");
                  setOtpCode("");
                  setOtpSent(false);
                  setTimer(0);
                }}
                className="ml-1.5 text-mm-purple font-semibold cursor-pointer hover:underline hover:text-mm-purple-light transition-colors"
              >
                {isSignup ? "Sign In" : "Create Account"}
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
