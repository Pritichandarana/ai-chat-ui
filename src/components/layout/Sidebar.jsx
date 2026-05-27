import { useContext, useState, useEffect } from "react";
import { ChatContext } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";
import authFetch from "../../utils/authFetch";
import {
  PlusIcon,
  SearchIcon,
  TrashIcon,
  LogoutIcon,
  SettingsIcon,
  ChatBubbleIcon,
  EyeOffIcon,
  EditIcon,
} from "../ui/Icons";

export default function Sidebar({ open, setOpen }) {
  const { chats, setActiveChat, createNewChat, setChats, activeChat, selectedWorkspace, workspaces } =
    useContext(ChatContext);
  const { logout, user } = useAuth();
  const { setSettingsModalOpen } = useUI();

  const activeWorkspaceObj = workspaces.find((w) => w.id === selectedWorkspace) || workspaces[0];

  const [hiddenChats, setHiddenChats] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [search, setSearch] = useState("");
  const [hoveredChat, setHoveredChat] = useState(null);
  
  // Renaming state
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  // Detect screen size for responsive drawer
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setOpen(false);
      else setOpen(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setOpen]);

  // Rename action
  const startRename = (e, chat) => {
    e.stopPropagation();
    setEditingChatId(chat._id);
    setEditTitle(chat.title || getChatLabel(chat));
  };

  const handleRename = async (id) => {
    if (!editTitle.trim()) {
      setEditingChatId(null);
      return;
    }
    try {
      const updated = await authFetch(`/api/chats/${id}`, {
        method: "PUT",
        body: JSON.stringify({ title: editTitle.trim() }),
      });
      setChats((prev) =>
        prev.map((c) => (c._id === id ? { ...c, title: updated.title } : c))
      );
      if (activeChat?._id === id) {
        setActiveChat((prev) => ({ ...prev, title: updated.title }));
      }
    } catch (err) {
      console.error("Rename error:", err);
    } finally {
      setEditingChatId(null);
    }
  };

  // Delete chat
  const deleteChat = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Delete this chat?")) return;
    try {
      await authFetch(`/api/chats/${id}`, { method: "DELETE" });
      setChats((prev) => prev.filter((c) => c._id !== id));
      if (activeChat?._id === id) {
        setActiveChat(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Hide chat
  const toggleHide = (e, id) => {
    e.stopPropagation();
    setHiddenChats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  // Workspace and Search Filter
  const chatWorkspaceMap = JSON.parse(localStorage.getItem("chat_workspace_map") || "{}");

  const filteredChats = chats
    .filter((chat) => !hiddenChats.includes(chat._id))
    .filter((chat) => {
      const ws = chatWorkspaceMap[chat._id] || "personal";
      return ws === selectedWorkspace;
    })
    .filter((chat) => {
      if (!search.trim()) return true;
      const term = search.toLowerCase();
      const titleMatches = (chat.title || "").toLowerCase().includes(term);
      const messageMatches = (chat.messages || []).some((m) =>
        (m.content || "").toLowerCase().includes(term)
      );
      return titleMatches || messageMatches;
    });

  const getChatLabel = (chat) => {
    if (chat.title && chat.title !== "New Chat") return chat.title;
    return chat.messages?.[0]?.content?.slice(0, 30) || "New Chat";
  };

  const sidebarStyle = {
    width: open ? "260px" : "0px",
    minWidth: open ? "260px" : "0px",
    overflow: "hidden",
    transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    flexShrink: 0,
    position: isMobile ? "fixed" : "relative",
    top: isMobile ? 0 : "auto",
    left: isMobile ? 0 : "auto",
    bottom: isMobile ? 0 : "auto",
    zIndex: isMobile ? 100 : "auto",
    transform: isMobile && !open ? "translateX(-100%)" : "translateX(0)",
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobile && open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        style={sidebarStyle}
        className="select-none bg-mm-sidebar border-r border-mm-border text-mm-text"
      >
        <div style={{ width: "260px", display: "flex", flexDirection: "column", height: "100%" }}>
          {/* ─── Logo / Brand ─── */}
          <div
            className="flex items-center gap-3 px-4 py-4 shrink-0 border-b border-mm-border cursor-pointer hover:bg-mm-card-hover/20 transition-colors"
            onClick={() => setSettingsModalOpen(true)}
            title="Configure Workspace Settings"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-mm-purple/10 border border-mm-purple/20 shrink-0 select-none text-lg"
            >
              <span>{activeWorkspaceObj.icon}</span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <p className="font-bold text-mm-text text-sm leading-none tracking-tight truncate">
                {activeWorkspaceObj.name}
              </p>
              <p className="text-[9px] mt-1.5 text-mm-muted font-medium uppercase tracking-wider truncate">
                {activeWorkspaceObj.desc || "AI Workspace"}
              </p>
            </div>
          </div>

          {/* ─── New Chat button ─── */}
          <div className="px-3 pt-3 pb-2 shrink-0">
            <button
              onClick={() => {
                createNewChat();
                if (isMobile) setOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white transition-all duration-250 hover:scale-[1.01]"
              style={{
                background: "linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))",
                boxShadow: "var(--glow-purple)",
              }}
            >
              <PlusIcon size={14} />
              New Conversation
            </button>
          </div>

          {/* ─── Search Bar ─── */}
          <div className="px-3 pb-3 shrink-0">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-mm-muted">
                <SearchIcon size={13} />
              </span>
              <input
                type="text"
                placeholder="Search index..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input bg-mm-card border border-mm-border text-mm-text rounded-xl"
                style={{ paddingLeft: "32px" }}
              />
            </div>
          </div>

          {/* ─── Section Header ─── */}
          <div className="px-4 pb-1.5 shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-mm-muted">
              Recent Chats
            </p>
          </div>

          {/* ─── Chats List ─── */}
          <div className="flex-1 overflow-y-auto px-2 pb-2 min-h-0">
            {filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 opacity-60">
                <span className="text-mm-muted">
                  <ChatBubbleIcon size={20} />
                </span>
                <p className="text-[11px] text-center text-mm-muted">
                  {search ? "No matches found" : "Workspace is empty"}
                </p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {filteredChats.map((chat, i) => {
                  const isActive = activeChat?._id === chat._id;
                  const isHovered = hoveredChat === chat._id;
                  const isEditing = editingChatId === chat._id;
                  const chatLabel = getChatLabel(chat);

                  return (
                    <div
                      key={chat._id}
                      className={`sidebar-item ${isActive ? "active" : ""}`}
                      style={{ animationDelay: `${i * 0.02}s` }}
                      onClick={() => {
                        if (!isEditing) {
                          setActiveChat(chat);
                          if (isMobile) setOpen(false);
                        }
                      }}
                      onMouseEnter={() => setHoveredChat(chat._id)}
                      onMouseLeave={() => setHoveredChat(null)}
                    >
                      <span
                        className="shrink-0"
                        style={{ color: isActive ? "var(--accent-cyan)" : "var(--text-muted)" }}
                      >
                        <ChatBubbleIcon size={13} />
                      </span>

                      {isEditing ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => handleRename(chat._id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRename(chat._id);
                            if (e.key === "Escape") setEditingChatId(null);
                          }}
                          className="bg-mm-card border border-mm-purple/40 text-mm-text text-xs px-2 py-0.5 rounded outline-none w-full"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span
                          className="text-xs flex-1 truncate pr-1"
                          title={chatLabel} // Tooltip showing full text
                          style={{
                            color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                            fontWeight: isActive ? 600 : 400,
                          }}
                        >
                          {chatLabel}
                        </span>
                      )}

                      {/* Hover action icons */}
                      {(isHovered || isActive) && !isEditing && (
                        <div className="flex gap-1 shrink-0 bg-transparent">
                          <button
                            onClick={(e) => startRename(e, chat)}
                            className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 dark:hover:bg-white/5 transition-colors text-mm-muted"
                            title="Rename chat"
                          >
                            <EditIcon size={10} />
                          </button>
                          <button
                            onClick={(e) => toggleHide(e, chat._id)}
                            className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 dark:hover:bg-white/5 transition-colors text-yellow-500"
                            title="Hide chat"
                          >
                            <EyeOffIcon size={10} />
                          </button>
                          <button
                            onClick={(e) => deleteChat(e, chat._id)}
                            className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 dark:hover:bg-white/5 transition-colors text-red-500"
                            title="Delete chat"
                          >
                            <TrashIcon size={10} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Hidden items list */}
            {hiddenChats.length > 0 && (
              <div className="mt-4 pt-3 border-t border-mm-border px-2">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5 px-1 text-mm-muted">
                  Hidden Items
                </p>
                {chats
                  .filter((c) => hiddenChats.includes(c._id))
                  .map((chat) => (
                    <div
                      key={chat._id}
                      className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-white/[0.02]"
                    >
                      <span className="text-xs truncate flex-1 text-mm-muted">
                        {getChatLabel(chat)}
                      </span>
                      <button
                        onClick={(e) => toggleHide(e, chat._id)}
                        className="text-[10px] font-semibold ml-2 shrink-0 text-mm-cyan hover:text-mm-cyan-light transition-colors"
                      >
                        Restore
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* ─── Footer Controls ─── */}
          <div
            className="shrink-0 p-3 space-y-1.5 border-t border-mm-border"
          >
            {/* Settings button */}
            <button
              onClick={() => setSettingsModalOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-mm-muted hover:bg-mm-card-hover hover:text-mm-text transition-all duration-200"
            >
              <SettingsIcon size={14} />
              Workspace Settings
            </button>

            {/* User Profile bar */}
            <div
              className="flex items-center gap-2 px-2.5 py-2 rounded-xl border border-mm-border bg-mm-card/30"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs gradient-bg shrink-0 shadow-sm"
                style={{ boxShadow: "0 0 10px var(--glass-border)" }}
              >
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-mm-text truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-[10px] text-mm-muted truncate">
                  {user?.email || ""}
                </p>
              </div>
              <button
                onClick={logout}
                className="btn-icon shrink-0 w-7 h-7 hover:bg-red-500/10 border border-red-500/20 text-red-500"
                title="Logout"
              >
                <LogoutIcon size={12} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
