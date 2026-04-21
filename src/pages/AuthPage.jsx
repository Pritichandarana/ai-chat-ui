import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL;

export default function AuthPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  //
  // ✅ LOGIN
  //
  const handleLogin = async () => {
    try {
      const res = await fetch(`${API}/api/login`, {
        // ✅ FIXED
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const contentType = res.headers.get("content-type");

      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text);
      }

      if (!res.ok) {
        alert(data.error || "Login failed");
        return;
      }

      // ✅ store token if backend sends
      if (data.accessToken) {
        localStorage.setItem("token", data.accessToken);
      }

      await login();
      navigate("/chat");
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      alert(err.message || "Something went wrong");
    }
  };

  //
  // ✅ SIGNUP
  //
  const handleSignup = async () => {
    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await fetch(`${API}/api/signup`, {
        // ✅ FIXED
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Signup successful, please login");
        setIsSignup(false);
        setName("");
        setEmail("");
        setPassword("");
      } else {
        alert(data.error || "Signup failed");
      }
    } catch (err) {
      console.error("SIGNUP ERROR:", err);
      alert("Something went wrong");
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
              className="w-full px-4 py-2 text-white rounded-lg bg-white/10"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          <input
            className="w-full px-4 py-2 text-white rounded-lg bg-white/10"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="w-full px-4 py-2 text-white rounded-lg bg-white/10"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {!isSignup && (
            <div className="flex justify-end -mt-2">
              <span
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-indigo-400 cursor-pointer"
              >
                Forgot Password?
              </span>
            </div>
          )}

          <button
            onClick={isSignup ? handleSignup : handleLogin}
            className="w-full py-2 text-white bg-indigo-500 rounded-lg"
          >
            {isSignup ? "Signup" : "Login"}
          </button>
        </div>

        <p className="mt-4 text-sm text-center text-gray-400">
          {isSignup ? "Already have an account?" : "New here?"}
          <span
            onClick={() => setIsSignup(!isSignup)}
            className="ml-1 text-indigo-400 cursor-pointer"
          >
            {isSignup ? "Login" : "Signup"}
          </span>
        </p>
      </div>
    </div>
  );
}
