import { useContext, useState, useEffect, useRef } from "react";
import { ChatContext } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
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
  const { chats, setActiveChat, createNewChat, setChats, activeChat } =
    useContext(ChatContext);
  const { logout, user } = useAuth();

  const [hiddenChats, setHiddenChats] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [search, setSearch] = useState("");
  const [hoveredChat, setHoveredChat] = useState(null);
  
  // Renaming state
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  // Detect screen size
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

  const filteredChats = chats
    .filter((chat) => !hiddenChats.includes(chat._id))
    .filter((chat) => {
      if (!search.trim()) return true;
      const title = chat.title || chat.messages?.[0]?.content || "New Chat";
      return title.toLowerCase().includes(search.toLowerCase());
    });

  const getChatLabel = (chat) => {
    if (chat.title && chat.title !== "New Chat") return chat.title;
    return chat.messages?.[0]?.content?.slice(0, 30) || "New Chat";
  };

  const sidebarStyle = {
    backgroundColor: "#111827",
    borderRight: "1px solid rgba(255,255,255,0.06)",
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
      {/* Mobile Backdrop */}
      {isMobile && open && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside style={sidebarStyle} className="select-none">
        <div
          style={{ width: "260px", display: "flex", flexDirection: "column", height: "100%" }}
        >
          {/* ─── Logo ─── */}
          <div
            className="flex items-center gap-3 px-4 py-4 shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center gradient-bg shrink-0"
              style={{ boxShadow: "0 0 18px rgba(124,58,237,0.4)" }}
            >
              <span className="text-white font-black text-base select-none">M</span>
            </div>
            <div>
              <p className="font-bold text-white text-base leading-none tracking-tight">
                MindMesh
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#4B5563" }}>
                AI Workspace
              </p>
            </div>
          </div>

          {/* ─── New Chat ─── */}
          <div className="px-3 pt-3 pb-2 shrink-0">
            <button
              onClick={() => {
                createNewChat();
                if (isMobile) setOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
                boxShadow: "0 4px 16px rgba(124,58,237,0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 6px 24px rgba(124,58,237,0.5)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(124,58,237,0.3)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <PlusIcon size={15} />
              New Chat
            </button>
          </div>

          {/* ─── Search ─── */}
          <div className="px-3 pb-3 shrink-0">
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "#6B7280" }}
              >
                <SearchIcon size={13} />
              </span>
              <input
                type="text"
                placeholder="Search chats..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input pl-8"
              />
            </div>
          </div>

          {/* ─── Section Label ─── */}
          <div className="px-4 pb-1.5 shrink-0 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#374151" }}>
              Recent Chats
            </p>
          </div>

          {/* ─── Chat List ─── */}
          <div className="flex-1 overflow-y-auto px-2 pb-2 min-h-0">
            {filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <span className="opacity-20 text-white">
                  <ChatBubbleIcon size={24} />
                </span>
                <p className="text-xs text-center" style={{ color: "#4B5563" }}>
                  {search ? "No matches found" : "Workspace is empty"}
                </p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {filteredChats.map((chat, i) => {
                  const isActive = activeChat?._id === chat._id;
                  const isHovered = hoveredChat === chat._id;
                  const isEditing = editingChatId === chat._id;

                  return (
                    <div
                      key={chat._id}
                      className={`sidebar-item ${isActive ? "active" : ""}`}
                      style={{ animationDelay: `${i * 0.03}s` }}
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
                        style={{ color: isActive ? "#06B6D4" : "#4B5563" }}
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
                          className="bg-white/10 text-white text-xs px-2 py-0.5 rounded outline-none border border-[#7C3AED]/40 w-full"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span
                          className="text-xs flex-1 truncate pr-1"
                          style={{
                            color: isActive ? "#F9FAFB" : "rgba(249,250,251,0.65)",
                            fontWeight: isActive ? 600 : 400,
                          }}
                        >
                          {getChatLabel(chat)}
                        </span>
                      )}

                      {/* Action Buttons on Hover */}
                      {(isHovered || isActive) && !isEditing && (
                        <div className="flex gap-1 shrink-0 bg-transparent">
                          <button
                            onClick={(e) => startRename(e, chat)}
                            className="w-5 h-5 flex items-center justify-center rounded opacity-60 hover:opacity-100 hover:bg-white/5 transition-all"
                            style={{ color: "#9CA3AF" }}
                            title="Rename chat"
                          >
                            <EditIcon size={11} />
                          </button>
                          <button
                            onClick={(e) => toggleHide(e, chat._id)}
                            className="w-5 h-5 flex items-center justify-center rounded opacity-60 hover:opacity-100 hover:bg-white/5 transition-all"
                            style={{ color: "#F59E0B" }}
                            title="Hide chat"
                          >
                            <EyeOffIcon size={11} />
                          </button>
                          <button
                            onClick={(e) => deleteChat(e, chat._id)}
                            className="w-5 h-5 flex items-center justify-center rounded opacity-60 hover:opacity-100 hover:bg-white/5 transition-all"
                            style={{ color: "#EF4444" }}
                            title="Delete chat"
                          >
                            <TrashIcon size={11} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Hidden chats section */}
            {hiddenChats.length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/5 px-2">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5 px-1 text-gray-500">
                  Hidden Items
                </p>
                {chats
                  .filter((c) => hiddenChats.includes(c._id))
                  .map((chat) => (
                    <div
                      key={chat._id}
                      className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-white/[0.02]"
                    >
                      <span className="text-xs truncate flex-1" style={{ color: "#4B5563" }}>
                        {getChatLabel(chat)}
                      </span>
                      <button
                        onClick={(e) => toggleHide(e, chat._id)}
                        className="text-[10px] font-semibold ml-2 shrink-0 hover:text-mm-cyan-light transition-colors"
                        style={{ color: "#06B6D4" }}
                      >
                        Restore
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* ─── Footer ─── */}
          <div
            className="shrink-0 p-3 space-y-1"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            {/* Settings */}
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200"
              style={{ color: "rgba(249,250,251,0.5)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.color = "rgba(249,250,251,0.9)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "rgba(249,250,251,0.5)";
              }}
            >
              <SettingsIcon size={15} />
              Workspace Settings
            </button>

            {/* User Profile */}
            <div
              className="flex items-center gap-2 px-2.5 py-2 rounded-xl"
              style={{ border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)" }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs gradient-bg shrink-0 select-none"
                style={{ boxShadow: "0 0 10px rgba(124,58,237,0.3)" }}
              >
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-[10px] truncate" style={{ color: "#4B5563" }}>
                  {user?.email || ""}
                </p>
              </div>
              <button
                onClick={logout}
                className="btn-icon shrink-0 hover:bg-red-500/10 border border-red-500/20"
                title="Logout"
                style={{ color: "#EF4444" }}
              >
                <LogoutIcon size={13} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
