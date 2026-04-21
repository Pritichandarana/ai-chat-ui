import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();
const API = "/api"; // 🔥 FIXED

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  //
  // ✅ FETCH USER
  //
  const fetchUser = async () => {
    try {
      const res = await fetch(`${API}/api/check-auth`, {
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();
      setUser(data.user);
    } catch {
      setUser(null);
    }
  };

  //
  // ✅ REFRESH TOKEN
  //
  const refreshAccessToken = async () => {
    try {
      const data = await authFetch("/api/refresh", {
        method: "POST",
      });

      return true;
    } catch (err) {
      setUser(null);
      return false;
    }
  };

  //
  // ✅ INITIAL LOAD
  //
  useEffect(() => {
    const initAuth = async () => {
      const refreshed = await refreshAccessToken();

      if (refreshed) {
        await fetchUser();
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  //
  // ✅ LOGIN
  //
  const login = async () => {
    await fetchUser(); // 🔥 FIXED (no checkAuth)
  };

  //
  // ✅ LOGOUT
  //
  const logout = async () => {
    try {
      await fetch(`${API}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {}

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
