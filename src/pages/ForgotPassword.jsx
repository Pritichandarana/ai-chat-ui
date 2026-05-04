import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_URL;

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    setSuccess(false);

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 30000);

    try {
      console.log("Forgot password API:", `${API}/api/forgot-password`);

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
        toast.error("Request timed out. Backend may be sleeping. Try again.");
      } else {
        toast.error(err.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#020617] px-4">
      <div className="w-full max-w-md p-6 border shadow-xl bg-white/5 backdrop-blur-lg border-white/10 rounded-2xl">
        <h2 className="mb-4 text-2xl font-semibold text-center text-white">
          Forgot Password
        </h2>

        {success && (
          <p className="mb-4 text-sm text-center text-green-400">
            Reset link sent successfully ✅
          </p>
        )}

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full px-4 py-2 mb-4 text-white placeholder-gray-400 rounded-lg outline-none bg-white/10 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center justify-center w-full gap-2 py-2 font-medium text-white transition bg-indigo-500 rounded-lg hover:bg-indigo-600 disabled:opacity-50"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent" />
              Sending...
            </>
          ) : (
            "Send Reset Link"
          )}
        </button>

        <button
          onClick={() => navigate("/")}
          disabled={loading}
          className="w-full mt-4 text-sm text-indigo-400 hover:underline disabled:opacity-50"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
