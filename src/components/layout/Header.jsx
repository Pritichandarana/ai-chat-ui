import { useContext, useState, useRef, useEffect } from "react";
import { ChatContext } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { MenuIcon, BellIcon, ChevronDownIcon, CheckIcon, SparklesIcon } from "../ui/Icons";

const MODELS = [
  { name: "Groq LLaMA 3.3", id: "llama-3.3-70b-versatile", provider: "Groq", speed: "Fastest", tagColor: "#06B6D4" },
  { name: "Mixtral 8x7B", id: "mixtral-8x7b-32768", provider: "Groq", speed: "High Context", tagColor: "#7C3AED" },
  { name: "Gemma 2 9B", id: "gemma2-9b-it", provider: "Groq", speed: "Efficient", tagColor: "#F59E0B" },
  { name: "DeepSeek V3", id: "deepseek-v3", provider: "Simulated", speed: "Advanced Reasoning", tagColor: "#10B981" }
];

const WORKSPACES = [
  { name: "Personal Workspace", icon: "👤", desc: "Private files and conversations" },
  { name: "Engineering Hub", icon: "💻", desc: "Dev tools and system prompts" },
  { name: "Research Lab", icon: "🔬", desc: "Deep analytical intelligence" },
  { name: "MindMesh Inc.", icon: "🚀", desc: "Company shared workspace" }
];

export default function Header({ setSidebarOpen, sidebarOpen }) {
  const { activeChat, selectedModel, setSelectedModel, selectedWorkspace, setSelectedWorkspace } = useContext(ChatContext);
  const { user } = useAuth();

  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);

  const modelRef = useRef(null);
  const workspaceRef = useRef(null);

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
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeModelObj = MODELS.find((m) => m.name === selectedModel) || MODELS[0];
  const activeWorkspaceObj = WORKSPACES.find((w) => w.name === selectedWorkspace) || WORKSPACES[0];

  return (
    <header
      className="flex items-center justify-between px-4 py-2.5 shrink-0 z-50 relative"
      style={{
        backgroundColor: "rgba(11,16,32,0.75)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* ─── LEFT: Sidebar Toggle & Workspace Switcher ─── */}
      <div className="flex items-center gap-3">
        {/* Sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="btn-icon flex"
          aria-label="Toggle sidebar"
        >
          <MenuIcon />
        </button>

        {/* Mobile logo */}
        <div className="md:hidden flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center gradient-bg"
            style={{ boxShadow: "0 0 12px rgba(124,58,237,0.5)" }}
          >
            <span className="text-white font-black text-xs">M</span>
          </div>
        </div>

        {/* Workspace Selector (Notion AI / Linear Style) */}
        <div className="relative" ref={workspaceRef}>
          <button
            onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/10 transition-all duration-200"
          >
            <span className="text-sm select-none">{activeWorkspaceObj.icon}</span>
            <span className="text-sm font-semibold text-white max-w-[130px] truncate">
              {activeWorkspaceObj.name}
            </span>
            <ChevronDownIcon size={12} />
          </button>

          {/* Workspace Dropdown */}
          {workspaceDropdownOpen && (
            <div
              className="absolute left-0 mt-2 w-64 rounded-2xl glass p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 border border-white/10"
              style={{ animation: "fadeInUp 0.18s cubic-bezier(0.16, 1, 0.3, 1) both" }}
            >
              <div className="px-3 py-2 text-xxs uppercase tracking-widest font-bold text-gray-500">
                Switch Workspace
              </div>
              <div className="space-y-1">
                {WORKSPACES.map((w) => {
                  const isSel = w.name === selectedWorkspace;
                  return (
                    <button
                      key={w.name}
                      onClick={() => {
                        setSelectedWorkspace(w.name);
                        setWorkspaceDropdownOpen(false);
                      }}
                      className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all duration-150 ${
                        isSel ? "bg-[#7C3AED]/12 border border-[#7C3AED]/20 text-white" : "hover:bg-white/[0.04] border border-transparent text-mm-muted"
                      }`}
                    >
                      <span className="text-base select-none mt-0.5">{w.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold ${isSel ? "text-white" : "text-gray-200"}`}>{w.name}</p>
                        <p className="text-[10px] text-gray-500 truncate mt-0.5">{w.desc}</p>
                      </div>
                      {isSel && (
                        <span className="text-[#06B6D4] shrink-0 mt-1">
                          <CheckIcon size={11} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Desktop breadcrumb */}
        {chatTitle && (
          <div className="hidden lg:flex items-center gap-2">
            <span style={{ color: "#252e42" }} className="text-sm select-none">/</span>
            <span
              className="text-xs font-medium text-gray-500 truncate max-w-[120px]"
            >
              {chatTitle}
              {activeChat?.messages?.[0]?.content?.length > 24 ? "…" : ""}
            </span>
          </div>
        )}
      </div>

      {/* ─── CENTER: Clickable Model Switcher Dropdown (Inspired by ChatGPT & Perplexity) ─── */}
      <div className="relative" ref={modelRef}>
        <button
          onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#7C3AED]/20 bg-white/[0.02] hover:bg-white/[0.06] transition-all duration-200 group select-none shadow-[0_0_15px_rgba(124,58,237,0.06)]"
        >
          <div
            className="w-1.5 h-1.5 rounded-full shrink-0 group-hover:scale-125 transition-transform"
            style={{
              backgroundColor: activeModelObj.tagColor,
              boxShadow: `0 0 8px ${activeModelObj.tagColor}`,
              animation: "recordPulse 2s ease-in-out infinite",
            }}
          />
          <span className="text-xs font-medium text-gray-400 group-hover:text-gray-200 transition-colors">
            {activeModelObj.provider}
          </span>
          <span style={{ color: "#374151" }} className="text-xs">·</span>
          <span className="text-xs font-bold gradient-text">
            {activeModelObj.name}
          </span>
          <ChevronDownIcon size={11} />
        </button>

        {/* Model Selector Dropdown Menu */}
        {modelDropdownOpen && (
          <div
            className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 rounded-2xl glass p-2 shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-50 border border-white/10"
            style={{ animation: "fadeInUp 0.18s cubic-bezier(0.16, 1, 0.3, 1) both" }}
          >
            <div className="px-3 py-1.5 text-xxs uppercase tracking-widest font-bold text-gray-500 border-b border-white/5 mb-1.5">
              Select Intelligence Model
            </div>
            <div className="space-y-1">
              {MODELS.map((m) => {
                const isSel = m.name === selectedModel;
                return (
                  <button
                    key={m.name}
                    onClick={() => {
                      setSelectedModel(m.name);
                      setModelDropdownOpen(false);
                    }}
                    className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all duration-150 ${
                      isSel ? "bg-[#7C3AED]/12 border border-[#7C3AED]/20 text-white" : "hover:bg-white/[0.04] border border-transparent text-mm-muted"
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
                        <span className="text-xs font-bold text-white">{m.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5 font-mono">
                          {m.provider}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">{m.speed}</p>
                    </div>
                    {isSel && (
                      <span className="text-[#06B6D4] shrink-0 mt-1">
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

      {/* ─── RIGHT: Notifications & User Profile ─── */}
      <div className="flex items-center gap-2">
        <button className="btn-icon relative hidden sm:flex hover:bg-white/5 border border-white/5 hover:border-white/10" aria-label="Notifications">
          <BellIcon />
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: "#7C3AED", boxShadow: "0 0 5px #7C3AED" }}
          />
        </button>

        <div
          className="flex items-center gap-2 px-2.5 py-1 rounded-xl cursor-pointer transition-all duration-200 border border-white/5 bg-white/[0.01]"
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs select-none gradient-bg shrink-0"
            style={{ boxShadow: "0 0 10px rgba(124,58,237,0.3)" }}
          >
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <span
            className="hidden sm:block text-xs font-semibold text-gray-300"
          >
            {user?.name?.split(" ")[0] || "User"}
          </span>
        </div>
      </div>
    </header>
  );
}
