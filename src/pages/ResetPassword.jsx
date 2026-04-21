import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API = "https://ai-chat-backend-sim2.onrender.com";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!password.trim()) {
      alert("Please enter a new password");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/api/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      alert("Password reset successful ✅");

      // redirect after success
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#020617] px-4">
      <div className="w-full max-w-md p-6 border shadow-xl bg-white/5 backdrop-blur-lg border-white/10 rounded-2xl">
        <h2 className="mb-6 text-2xl font-semibold text-center text-white">
          Reset Password
        </h2>

        <input
          type="password"
          placeholder="Enter new password"
          className="w-full px-4 py-2 mb-4 text-white placeholder-gray-400 rounded-lg outline-none bg-white/10 focus:ring-2 focus:ring-indigo-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full py-2 font-medium text-white transition bg-indigo-500 rounded-lg hover:bg-indigo-600 disabled:opacity-50"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </div>
    </div>
  );
}
