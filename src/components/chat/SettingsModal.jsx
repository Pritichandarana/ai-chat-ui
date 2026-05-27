import { useContext, useState, useEffect } from "react";
import { useUI } from "../../context/UIContext";
import { ChatContext } from "../../context/ChatContext";

const EMOJIS = ["👤", "💻", "🔬", "🚀", "📚", "🎨", "🛠️", "🏠", "🧠", "💬", "🔥", "⚡", "🌍", "🔐", "📊"];

export default function SettingsModal() {
  const { settingsModalOpen, setSettingsModalOpen, showToast } = useUI();
  const { 
    selectedWorkspace, 
    workspaces, 
    updateWorkspaceSettings, 
    clearWorkspaceChats, 
    resetAllWorkspaceSettings 
  } = useContext(ChatContext);

  const activeWorkspaceObj = workspaces.find((w) => w.id === selectedWorkspace) || workspaces[0];

  const [activeTab, setActiveTab] = useState("general"); // "general", "ai", "developer", "danger"
  
  // Local form states
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [desc, setDesc] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [defaultModel, setDefaultModel] = useState("");
  const [apiUrl, setApiUrl] = useState("");

  // Sync form states with active workspace settings on open or switch
  useEffect(() => {
    if (activeWorkspaceObj) {
      setName(activeWorkspaceObj.name || "");
      setIcon(activeWorkspaceObj.icon || "👤");
      setDesc(activeWorkspaceObj.desc || "");
      setSystemPrompt(activeWorkspaceObj.systemPrompt || "");
      setDefaultModel(activeWorkspaceObj.defaultModel || "DeepSeek V3");
      setApiUrl(localStorage.getItem("custom_api_url") || "https://ai-chat-backend-sim2.onrender.com");
    }
  }, [activeWorkspaceObj, settingsModalOpen]);

  if (!settingsModalOpen) return null;

  const handleSave = () => {
    // 1. Save workspace configuration
    updateWorkspaceSettings(selectedWorkspace, {
      name,
      icon,
      desc,
      systemPrompt,
      defaultModel,
    });

    // 2. Save custom API base URL
    if (apiUrl.trim()) {
      let formattedUrl = apiUrl.trim();
      // Remove trailing slash if present
      if (formattedUrl.endsWith("/")) {
        formattedUrl = formattedUrl.slice(0, -1);
      }
      localStorage.setItem("custom_api_url", formattedUrl);
    } else {
      localStorage.removeItem("custom_api_url");
    }

    setSettingsModalOpen(false);
  };

  const handleClearHistory = async () => {
    if (window.confirm(`Are you sure you want to delete all conversations in the "${activeWorkspaceObj.name}" workspace? This cannot be undone.`)) {
      await clearWorkspaceChats(selectedWorkspace);
    }
  };

  const handleFactoryReset = () => {
    if (window.confirm("Are you sure you want to RESTORE FACTORY SETTINGS? This will delete all customized workspaces, custom prompts, and conversations across all workspaces. This cannot be undone.")) {
      resetAllWorkspaceSettings();
      setSettingsModalOpen(false);
    }
  };

  return (
    <div 
      className="modal-overlay z-[999] px-4" 
      onClick={() => setSettingsModalOpen(false)}
    >
      <div 
        className="w-full max-w-[700px] h-[520px] rounded-3xl glass shadow-2xl border border-mm-border bg-mm-card flex flex-col md:flex-row overflow-hidden animate-fade-in-up theme-transition"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Settings Sidebar Tabs */}
        <div className="w-full md:w-52 border-b md:border-b-0 md:border-r border-mm-border bg-mm-sidebar/40 p-4 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible shrink-0 scrollbar-none select-none">
          <div className="hidden md:block px-2 pb-3 pt-1 text-[9px] uppercase tracking-widest font-black text-mm-muted">
            Settings Panel
          </div>
          {[
            { id: "general", label: "General", icon: "⚙️" },
            { id: "ai", label: "AI & Models", icon: "🧠" },
            { id: "developer", label: "Developer API", icon: "🛠️" },
            { id: "danger", label: "Danger Zone", icon: "⚠️" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap md:w-full transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-mm-purple/10 border border-mm-purple/20 text-mm-text font-bold"
                  : "hover:bg-mm-card-hover border border-transparent text-mm-muted hover:text-mm-text"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Right Settings Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 p-6 overflow-y-auto min-h-0 space-y-5">
            {/* Header */}
            <div>
              <h2 className="text-base font-bold text-mm-text leading-tight flex items-center gap-2">
                <span>{activeWorkspaceObj.icon}</span>
                <span>Configure {activeWorkspaceObj.name}</span>
              </h2>
              <p className="text-[11px] text-mm-muted mt-1 leading-relaxed">
                Adjust preferences specifically for this workspace dashboard.
              </p>
            </div>

            {/* Content Switcher */}
            {activeTab === "general" && (
              <div className="space-y-4 animate-fade-in">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-mm-muted">Workspace Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full search-input rounded-xl focus:border-mm-purple/40"
                    placeholder="Enter workspace name..."
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-mm-muted">Description / Subtitle</label>
                  <input
                    type="text"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="w-full search-input rounded-xl focus:border-mm-purple/40"
                    placeholder="Brief description of this workspace..."
                  />
                </div>

                {/* Emoji Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-mm-muted">Workspace Icon</label>
                  <div className="grid grid-cols-8 gap-1.5 p-2 bg-mm-sidebar/20 border border-mm-border rounded-2xl max-w-sm">
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setIcon(emoji)}
                        className={`w-8 h-8 flex items-center justify-center rounded-xl text-base transition-all ${
                          icon === emoji
                            ? "bg-mm-purple/20 border border-mm-purple/40 scale-105"
                            : "hover:bg-mm-card-hover border border-transparent"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "ai" && (
              <div className="space-y-4 animate-fade-in">
                {/* Default Model */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-mm-muted">Default AI Model</label>
                  <select
                    value={defaultModel}
                    onChange={(e) => setDefaultModel(e.target.value)}
                    className="w-full search-input rounded-xl bg-mm-card border border-mm-border text-xs px-3 focus:border-mm-purple/40"
                    style={{ appearance: "auto" }}
                  >
                    <option value="DeepSeek V3">DeepSeek V3 (Deep Reasoning)</option>
                    <option value="Groq LLaMA 3.3">LLaMA 3.3 70B (Fastest Response)</option>
                    <option value="Mixtral 8x7B">Mixtral 8x7B (High Context)</option>
                    <option value="Gemma 2 9B">Gemma 2 9B (Efficient Analytics)</option>
                  </select>
                </div>

                {/* Custom System Instruction */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-mm-muted">Custom Instructions (System Prompt)</label>
                    <span className="text-[9px] text-mm-purple font-semibold">Workspace Context</span>
                  </div>
                  <textarea
                    rows={6}
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="E.g., 'You are a senior React developer. Answer all queries in detailed technical descriptions and optimized TypeScript code blocks. Keep replies concise and professional.'"
                    className="w-full search-input rounded-xl focus:border-mm-purple/40 text-xs py-2 px-3 leading-relaxed resize-none"
                  />
                  <p className="text-[9px] text-mm-muted leading-relaxed">
                    Custom instructions will automatically guide the AI's behavior and tone for all new chats started in this workspace.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "developer" && (
              <div className="space-y-4 animate-fade-in">
                {/* Connection Base API URL */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-mm-muted">Backend Connection API Base URL</label>
                  <input
                    type="text"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    className="w-full search-input rounded-xl focus:border-mm-purple/40 text-xs font-mono"
                    placeholder="E.g., https://api.my-chat-backend.com"
                  />
                  <p className="text-[9px] text-mm-muted leading-relaxed">
                    Default base endpoint: <span className="font-mono text-mm-cyan">https://ai-chat-backend-sim2.onrender.com</span>. Change this only if you are deploying your own custom-hosted backend service.
                  </p>
                </div>

                <div className="p-3.5 bg-mm-purple/5 border border-mm-purple/12 rounded-2xl">
                  <h4 className="text-xs font-bold text-mm-purple">API Endpoint Info</h4>
                  <p className="text-[10px] text-mm-muted mt-1 leading-relaxed">
                    Make sure your custom endpoint supports CORS, token cookies, and standard route paths like <span className="font-mono text-mm-text">/api/chats</span>.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "danger" && (
              <div className="space-y-4 animate-fade-in">
                {/* Workspace Conversations Clear */}
                <div className="p-4 border border-yellow-500/20 bg-yellow-500/5 rounded-2xl flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-yellow-500">Clear Workspace History</h4>
                    <p className="text-[10px] text-mm-muted mt-0.5 leading-relaxed">
                      Delete all conversation threads mapped to this active workspace.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="px-3.5 py-1.5 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-500 text-xs font-bold transition-all"
                  >
                    Clear Chats
                  </button>
                </div>

                {/* Factory Reset */}
                <div className="p-4 border border-red-500/20 bg-red-500/5 rounded-2xl flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-red-500">Restore Factory Defaults</h4>
                    <p className="text-[10px] text-mm-muted mt-0.5 leading-relaxed">
                      Wipe all custom workspaces, connection configurations, and clear database records completely.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleFactoryReset}
                    className="px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-500 text-xs font-bold transition-all"
                  >
                    Factory Reset
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Save / Close Buttons */}
          <div className="p-4 border-t border-mm-border bg-mm-sidebar/20 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setSettingsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-mm-muted hover:text-mm-text hover:bg-mm-card-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn-primary"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
