import { useContext, useState, useRef, useEffect } from "react";
import { ChatContext } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";
import { MenuIcon, BellIcon, ChevronDownIcon, CheckIcon, SettingsIcon, LogoutIcon } from "../ui/Icons";

const MODELS = [
  { name: "Groq LLaMA 3.3", id: "llama-3.3-70b-versatile", provider: "Groq", speed: "Fastest Response", tagColor: "#06B6D4" },
  { name: "Mixtral 8x7B", id: "mixtral-8x7b-32768", provider: "Groq", speed: "High Token Context", tagColor: "#7C3AED" },
  { name: "Gemma 2 9B", id: "gemma2-9b-it", provider: "Groq", speed: "Efficient Analytics", tagColor: "#F59E0B" },
  { name: "DeepSeek V3", id: "deepseek-v3", provider: "Simulated", speed: "Deep Reasoning", tagColor: "#10B981" }
];



function SunIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="animate-spin-slow">
      <circle cx="12" cy="12" r="5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function MoonIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );
}

export default function Header({ setSidebarOpen, sidebarOpen }) {
  const { activeChat, selectedModel, setSelectedModel, selectedWorkspace, setSelectedWorkspace, workspaces } = useContext(ChatContext);
  const { user, logout } = useAuth();
  const { theme, toggleTheme, setSettingsModalOpen } = useUI();

  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const modelRef = useRef(null);
  const workspaceRef = useRef(null);
  const profileRef = useRef(null);

  const chatTitle = activeChat?.messages?.[0]?.content?.slice(0, 24) || null;

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (modelRef.current && !modelRef.current.contains(event.target)) {
        setModelDropdownOpen(false);
      }
      if (workspaceRef.current && !workspaceRef.current.contains(event.target)) {
        setWorkspaceDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeModelObj = MODELS.find((m) => m.name === selectedModel) || MODELS[0];
  const activeWorkspaceObj = workspaces.find((w) => w.id === selectedWorkspace) || workspaces[0];

  return (
    <header
      className="flex items-center justify-between px-4 py-2.5 shrink-0 z-30 relative bg-mm-sidebar/75 border-b border-mm-border backdrop-blur-2xl"
    >
      {/* ─── LEFT: Sidebar Toggle & Workspace Switcher ─── */}
      <div className="flex items-center gap-3">
        {/* Sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="btn-icon flex bg-transparent border border-mm-border hover:bg-mm-card-hover"
          aria-label="Toggle sidebar"
        >
          <MenuIcon />
        </button>

        {/* Workspace Selector */}
        <div className="relative" ref={workspaceRef}>
          <button
            onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
            title={activeWorkspaceObj.name} // Native tooltip on hover
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-mm-border bg-mm-card/20 hover:bg-mm-card-hover hover:border-mm-purple/35 transition-all duration-200"
          >
            <span className="text-sm select-none">{activeWorkspaceObj.icon}</span>
            <span className="text-xs font-bold text-mm-text max-w-[130px] truncate">
              {activeWorkspaceObj.name}
            </span>
            <span className="text-mm-muted">
              <ChevronDownIcon size={11} />
            </span>
          </button>

          {/* Workspace Dropdown */}
          {workspaceDropdownOpen && (
            <div
              className="absolute left-0 mt-2 w-64 rounded-2xl glass p-1.5 shadow-2xl z-50 border border-mm-border bg-mm-card"
              style={{ animation: "fadeInUp 0.18s cubic-bezier(0.16, 1, 0.3, 1) both" }}
            >
              <div className="px-3 py-1.5 text-[9px] uppercase tracking-widest font-black text-mm-muted border-b border-mm-border mb-1.5">
                Switch Workspace
              </div>
              <div className="space-y-0.5">
                {workspaces.map((w) => {
                  const isSel = w.id === selectedWorkspace;
                  return (
                    <button
                      key={w.id}
                      onClick={() => {
                        setSelectedWorkspace(w.id);
                        setWorkspaceDropdownOpen(false);
                      }}
                      className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-all duration-150 ${
                        isSel ? "bg-mm-purple/10 border border-mm-purple/25 text-mm-text" : "hover:bg-mm-card-hover border border-transparent text-mm-muted"
                      }`}
                    >
                      <span className="text-sm select-none mt-0.5">{w.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold ${isSel ? "text-mm-text" : "text-mm-text/80"}`}>{w.name}</p>
                        <p className="text-[9px] text-mm-muted truncate mt-0.5">{w.desc}</p>
                      </div>
                      {isSel && (
                        <span className="text-mm-cyan shrink-0 mt-1">
                          <CheckIcon size={10} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Breadcrumb path */}
        {chatTitle && (
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-mm-muted text-sm select-none">/</span>
            <span className="text-xs font-bold text-mm-muted truncate max-w-[120px]">
              {chatTitle}
              {activeChat?.messages?.[0]?.content?.length > 24 ? "…" : ""}
            </span>
          </div>
        )}
      </div>

      {/* ─── CENTER: Model Switcher dropdown ─── */}
      <div className="relative" ref={modelRef}>
        <button
          onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-mm-border bg-mm-card/20 hover:bg-mm-card-hover transition-all duration-200 group select-none shadow-sm"
        >
          <div
            className="w-1.5 h-1.5 rounded-full shrink-0 group-hover:scale-125 transition-transform"
            style={{
              backgroundColor: activeModelObj.tagColor,
              boxShadow: `0 0 8px ${activeModelObj.tagColor}`,
              animation: "recordPulse 2s ease-in-out infinite",
            }}
          />
          <span className="text-xs font-medium text-mm-muted group-hover:text-mm-text transition-colors">
            {activeModelObj.provider}
          </span>
          <span className="text-mm-border text-xs select-none">·</span>
          <span className="text-xs font-bold gradient-text">
            {activeModelObj.name}
          </span>
          <span className="text-mm-muted">
            <ChevronDownIcon size={11} />
          </span>
        </button>

        {/* Model Dropdown Menu */}
        {modelDropdownOpen && (
          <div
            className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 rounded-2xl glass p-2 shadow-2xl z-50 border border-mm-border bg-mm-card"
            style={{ animation: "fadeInUp 0.18s cubic-bezier(0.16, 1, 0.3, 1) both" }}
          >
            <div className="px-3 py-1.5 text-[9px] uppercase tracking-widest font-black text-mm-muted border-b border-mm-border mb-1.5">
              Select Intelligence Model
            </div>
            <div className="space-y-0.5">
              {MODELS.map((m) => {
                const isSel = m.name === selectedModel;
                return (
                  <button
                    key={m.name}
                    onClick={() => {
                      setSelectedModel(m.name);
                      setModelDropdownOpen(false);
                    }}
                    className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-all duration-150 border ${
                      isSel ? "bg-mm-purple/10 border-mm-purple/20 text-mm-text" : "hover:bg-mm-card-hover border-transparent text-mm-muted"
                    }`}
                  >
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                      style={{
                        backgroundColor: m.tagColor,
                        boxShadow: `0 0 6px ${m.tagColor}`
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-mm-text">{m.name}</span>
                        <span className="text-[8px] px-1 rounded bg-mm-sidebar border border-mm-border text-mm-muted font-mono font-bold">
                          {m.provider}
                        </span>
                      </div>
                      <p className="text-[10px] text-mm-muted mt-0.5">{m.speed}</p>
                    </div>
                    {isSel && (
                      <span className="text-mm-cyan shrink-0 mt-1">
                        <CheckIcon size={12} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ─── RIGHT: Theme switcher, Notification & Profile ─── */}
      <div className="flex items-center gap-2">
        {/* Sun/Moon Theme Toggle Switch */}
        <button
          onClick={toggleTheme}
          className="btn-icon hover:bg-mm-card-hover border border-mm-border text-mm-text p-2 rounded-xl flex items-center justify-center transition-all duration-300"
          aria-label="Toggle theme mode"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
        >
          {theme === "dark" ? <SunIcon size={14} /> : <MoonIcon size={14} />}
        </button>

        {/* Notifications */}
        <button className="btn-icon relative hidden sm:flex border border-mm-border hover:bg-mm-card-hover text-mm-text" aria-label="Notifications">
          <BellIcon />
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-mm-purple animate-pulse"
            style={{ boxShadow: "0 0 6px var(--accent-purple)" }}
          />
        </button>

        {/* Profile menu dropdown trigger */}
        <div className="relative" ref={profileRef}>
          <div
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 px-2 py-1 rounded-xl cursor-pointer hover:bg-mm-card-hover border border-mm-border bg-mm-card/10 select-none"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs select-none gradient-bg shrink-0 shadow-sm"
            >
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className="hidden sm:block text-xs font-semibold text-mm-text">
              {user?.name?.split(" ")[0] || "User"}
            </span>
          </div>

          {/* Profile Dropdown panel */}
          {profileDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-2xl glass p-1.5 shadow-2xl z-50 border border-mm-border bg-mm-card"
              style={{ animation: "fadeInUp 0.18s cubic-bezier(0.16, 1, 0.3, 1) both" }}
            >
              <div className="px-3 py-2 border-b border-mm-border mb-1.5">
                <p className="text-xs font-bold text-mm-text truncate">{user?.name}</p>
                <p className="text-[9px] text-mm-muted truncate mt-0.5">{user?.email}</p>
              </div>
              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    setSettingsModalOpen(true);
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-xl text-left text-xs font-semibold text-mm-muted hover:bg-mm-card-hover hover:text-mm-text transition-colors"
                >
                  <SettingsIcon size={13} />
                  Settings & Profiles
                </button>
                <button
                  className="w-full flex items-center gap-2 p-2 rounded-xl text-left text-xs font-semibold text-mm-muted hover:bg-mm-card-hover hover:text-mm-text transition-colors"
                >
                  💳 Manage Billing
                </button>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 p-2 rounded-xl text-left text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <LogoutIcon size={12} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
