import { createContext, useState, useContext, useEffect } from "react";

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  
  // Theme state: default to localStorage or system preference
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  // Apply theme class on load / change
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
      root.style.backgroundColor = "#0B1020";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
      root.style.backgroundColor = "#f9fafb";
    }
  }, [theme]);

  // Toggle theme handler with transition effect
  const toggleTheme = () => {
    const root = document.documentElement;
    
    // Apply temporary transition rules
    root.classList.add("theme-transition");
    
    setTheme((prev) => {
      const nextTheme = prev === "dark" ? "light" : "dark";
      localStorage.setItem("theme", nextTheme);
      return nextTheme;
    });

    setTimeout(() => {
      root.classList.remove("theme-transition");
    }, 300);
  };

  // Show Toast handler
  const showToast = (message, type = "error") => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  return (
    <UIContext.Provider
      value={{
        loading,
        setLoading,
        toast,
        showToast,
        theme,
        toggleTheme,
        settingsModalOpen,
        setSettingsModalOpen,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => useContext(UIContext);
