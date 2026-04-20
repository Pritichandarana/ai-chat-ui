import { useState } from "react";

const API = "https://ai-chat-backend-sim2.onrender.com";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${API}/api/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const contentType = res.headers.get("content-type");

      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || "Invalid response from server");
      }

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      alert("Reset link sent to your email");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#020617] px-4">
      <div className="w-full max-w-md p-6 border shadow-xl bg-white/5 backdrop-blur-lg border-white/10 rounded-2xl">
        <h2 className="mb-6 text-2xl font-semibold text-center text-white">
          Forgot Password
        </h2>

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full px-4 py-2 mb-4 text-white placeholder-gray-400 rounded-lg outline-none bg-white/10 focus:ring-2 focus:ring-indigo-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          className="w-full py-2 font-medium text-white transition bg-indigo-500 rounded-lg hover:bg-indigo-600"
        >
          Send Reset Link
        </button>
      </div>
    </div>
  );
}
