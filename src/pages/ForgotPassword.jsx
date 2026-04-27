import { useState } from "react";

const API = import.meta.env.VITE_API_URL;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    if (!email.trim()) {
      alert("Please enter your email");
      return;
    }

    setLoading(true);
    setSuccess("");

    try {
      const res = await fetch(`${API}/api/forgot-password`, {
        method: "POST",
        credentials: "include", // 🔥 IMPORTANT (cookies support)
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send reset link");
      }

      setSuccess("Reset link sent successfully ✅");
      setEmail("");
    } catch (err) {
      console.error("FORGOT ERROR:", err);
      alert(err.message || "Something went wrong ❌");
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
          <p className="mb-4 text-sm text-center text-green-400">{success}</p>
        )}

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full px-4 py-2 mb-4 text-white placeholder-gray-400 rounded-lg outline-none bg-white/10 focus:ring-2 focus:ring-indigo-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-2 font-medium text-white transition bg-indigo-500 rounded-lg hover:bg-indigo-600 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </div>
    </div>
  );
}
