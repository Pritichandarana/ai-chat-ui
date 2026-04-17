import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const Header = ({ setSidebarOpen }) => {
  const { user } = useAuth();

  const [dark, setDark] = useState(localStorage.getItem("theme") === "dark");

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-[#202123]">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        {/* ☰ MENU BUTTON (ONLY MOBILE) */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-xl md:hidden"
        >
          ☰
        </button>

        <h2 className="text-lg font-semibold text-black dark:text-white">
          AI Chat
        </h2>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {user?.name || "User"}
        </span>

        <div className="flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-blue-500 rounded-full">
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>

        <button
          onClick={() => setDark(!dark)}
          className="px-3 py-1 text-sm bg-gray-200 rounded dark:bg-gray-700 dark:text-white"
        >
          {dark ? "☀️" : "🌙"}
        </button>
      </div>
    </div>
  );
};

export default Header;
