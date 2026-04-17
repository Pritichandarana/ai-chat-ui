import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    const res = await fetch(
      `http://localhost:5000/api/${isSignup ? "signup" : "login"}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isSignup ? { name, email, password } : { email, password },
        ),
      },
    );

    const data = await res.json();

    if (res.ok) {
      if (data.token) {
        login(data.token);
        navigate("/chat");
      } else {
        alert("Signup successful, please login");
        setIsSignup(false);
      }
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#020617] px-4">
      <div className="w-full max-w-md p-6 border shadow-xl bg-white/5 backdrop-blur-lg border-white/10 rounded-2xl">
        <h2 className="mb-6 text-2xl font-semibold text-center text-white">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h2>

        <div className="space-y-4">
          {isSignup && (
            <input
              className="w-full px-4 py-2 text-white placeholder-gray-400 rounded-lg outline-none bg-white/10 focus:ring-2 focus:ring-indigo-500"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          <input
            className="w-full px-4 py-2 text-white placeholder-gray-400 rounded-lg outline-none bg-white/10 focus:ring-2 focus:ring-indigo-500"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="w-full px-4 py-2 text-white placeholder-gray-400 rounded-lg outline-none bg-white/10 focus:ring-2 focus:ring-indigo-500"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Forgot Password (only on login) */}
          {!isSignup && (
            <div className="flex justify-end -mt-2">
              <span
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-indigo-400 cursor-pointer hover:underline"
              >
                Forgot Password?
              </span>
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="w-full py-2 font-medium text-white transition bg-indigo-500 rounded-lg hover:bg-indigo-600"
          >
            {isSignup ? "Signup" : "Login"}
          </button>
        </div>

        <p className="mt-4 text-sm text-center text-gray-400">
          {isSignup ? "Already have an account?" : "New here?"}
          <span
            onClick={() => setIsSignup(!isSignup)}
            className="ml-1 text-indigo-400 cursor-pointer hover:underline"
          >
            {isSignup ? "Login" : "Signup"}
          </span>
        </p>
      </div>
    </div>
  );
}
