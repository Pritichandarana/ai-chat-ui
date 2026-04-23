import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

const API = "http://localhost:5000"; // ✅ local backend

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
  // ✅ INITIAL LOAD
  //
  useEffect(() => {
    const init = async () => {
      await fetchUser();
      setLoading(false);
    };

    init();
  }, []);

  //
  // ✅ LOGIN (IMPORTANT FIX)
  //
  const login = async (userData) => {
    if (userData) {
      setUser(userData); // 🔥 instant login
    } else {
      await fetchUser();
    }
  };

  //
  // ✅ LOGOUT
  //
  const logout = async () => {
    try {
      await fetch(`${API}/api/logout`, {
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
