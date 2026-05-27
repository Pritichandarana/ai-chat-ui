import { createContext, useState, useEffect } from "react";
import authFetch from "../utils/authFetch";
import { useAuth } from "./AuthContext";
import { useUI } from "./UIContext";

export const ChatContext = createContext();

const DEFAULT_WORKSPACES = [
  { id: "personal", name: "Personal Workspace", icon: "👤", desc: "Private files and conversations", systemPrompt: "", defaultModel: "DeepSeek V3" },
  { id: "engineering", name: "Engineering Hub", icon: "💻", desc: "Dev tools and system prompts", systemPrompt: "You are a senior Software Engineer. Provide clean, production-ready, fully commented code inside markdown code blocks.", defaultModel: "Groq LLaMA 3.3" },
  { id: "research", name: "Research Lab", icon: "🔬", desc: "Deep analytical intelligence", systemPrompt: "You are a research scientist. Provide detailed mathematical formulas, deep logical chains, and high-accuracy analysis.", defaultModel: "Mixtral 8x7B" },
  { id: "mindmesh", name: "MindMesh Inc.", icon: "🚀", desc: "Company shared workspace", systemPrompt: "", defaultModel: "DeepSeek V3" }
];

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [input, setInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState("DeepSeek V3");
  const [workspaces, setWorkspaces] = useState(() => {
    const saved = localStorage.getItem("mindmesh_workspaces");
    return saved ? JSON.parse(saved) : DEFAULT_WORKSPACES;
  });
  const [selectedWorkspace, setSelectedWorkspace] = useState(() => {
    return localStorage.getItem("mindmesh_active_workspace") || "personal";
  });

  const { token } = useAuth();
  const { setLoading, showToast } = useUI();

  // ================= FETCH CHATS =================
  const fetchChats = async () => {
    setLoading(true);
    try {
      const data = await authFetch("/api/chats");
      setChats(data);
      
      // Auto-set active chat matching the active workspace
      const map = JSON.parse(localStorage.getItem("chat_workspace_map") || "{}");
      const activeWs = localStorage.getItem("mindmesh_active_workspace") || "personal";
      const wsChats = data.filter((c) => (map[c._id] || "personal") === activeWs);
      
      if (wsChats.length > 0) {
        setActiveChat(wsChats[0]);
      } else {
        setActiveChat(null);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to load chats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchChats();
  }, [token]);

  // ================= THEME/MODEL ALIGNMENT ON SWITCH =================
  useEffect(() => {
    localStorage.setItem("mindmesh_active_workspace", selectedWorkspace);
    
    // Auto-set the model configured for this workspace
    const ws = workspaces.find((w) => w.id === selectedWorkspace);
    if (ws && ws.defaultModel) {
      setSelectedModel(ws.defaultModel);
    }
  }, [selectedWorkspace, workspaces]);

  // ================= VIEWPORT CHATS AUTO-SWITCH =================
  useEffect(() => {
    if (chats.length === 0) return;
    const map = JSON.parse(localStorage.getItem("chat_workspace_map") || "{}");
    const wsChats = chats.filter((c) => (map[c._id] || "personal") === selectedWorkspace);
    
    if (wsChats.length > 0) {
      const isAlreadyActive = wsChats.some((c) => c._id === activeChat?._id);
      if (!isAlreadyActive) {
        setActiveChat(wsChats[0]);
      }
    } else {
      setActiveChat(null);
    }
  }, [selectedWorkspace, chats]);

  // ================= CREATE NEW CHAT =================
  const createNewChat = async () => {
    setLoading(true);
    try {
      const newChat = await authFetch("/api/chats", { method: "POST" });
      
      // Map to selectedWorkspace in localStorage
      const map = JSON.parse(localStorage.getItem("chat_workspace_map") || "{}");
      map[newChat._id] = selectedWorkspace;
      localStorage.setItem("chat_workspace_map", JSON.stringify(map));
      
      setChats((prev) => [newChat, ...prev]);
      setActiveChat(newChat);
      showToast("New chat created", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to create chat");
    } finally {
      setLoading(false);
    }
  };

  // ================= SEND MESSAGE =================
  const sendMessage = async () => {
    if (!input.trim()) return;

    const ws = workspaces.find((w) => w.id === selectedWorkspace);
    const isFirstMessage = !activeChat || !activeChat.messages || activeChat.messages.length === 0;

    let processedContent = input;
    if (isFirstMessage && ws && ws.systemPrompt && ws.systemPrompt.trim()) {
      processedContent = `[System: ${ws.systemPrompt.trim()}]\n\n${input}`;
    }

    const userMsg = { role: "user", content: processedContent };
    setInput("");
    setIsAiTyping(true);

    try {
      const data = await authFetch("/api/chats/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [...(activeChat?.messages || []), userMsg],
          chatId: activeChat?._id,
          model: selectedModel,
        }),
      });

      const aiMsg = { role: "assistant", content: data.reply };

      setActiveChat((prev) => ({
        ...prev,
        messages: [...(prev?.messages || []), userMsg, aiMsg],
      }));

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === activeChat?._id
            ? { ...chat, messages: [...(chat.messages || []), userMsg, aiMsg] }
            : chat
        )
      );
    } catch (err) {
      console.error(err);
      showToast("Failed to send message");
    } finally {
      setIsAiTyping(false);
    }
  };

  // ================= WORKSPACE CONFIG MANAGEMENT =================
  const updateWorkspaceSettings = (workspaceId, newSettings) => {
    const updated = workspaces.map((w) => {
      if (w.id === workspaceId) {
        return { ...w, ...newSettings };
      }
      return w;
    });
    setWorkspaces(updated);
    localStorage.setItem("mindmesh_workspaces", JSON.stringify(updated));
    showToast("Workspace settings saved", "success");
  };

  const clearWorkspaceChats = async (workspaceId) => {
    setLoading(true);
    try {
      const map = JSON.parse(localStorage.getItem("chat_workspace_map") || "{}");
      const chatsToDelete = chats.filter((c) => (map[c._id] || "personal") === workspaceId);

      for (const chat of chatsToDelete) {
        await authFetch(`/api/chats/${chat._id}`, { method: "DELETE" });
        delete map[chat._id];
      }

      localStorage.setItem("chat_workspace_map", JSON.stringify(map));
      setChats((prev) => prev.filter((c) => !chatsToDelete.some((td) => td._id === c._id)));
      showToast("Workspace conversations cleared", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to clear workspace conversations");
    } finally {
      setLoading(false);
    }
  };

  const resetAllWorkspaceSettings = () => {
    setWorkspaces(DEFAULT_WORKSPACES);
    localStorage.removeItem("mindmesh_workspaces");
    localStorage.removeItem("mindmesh_active_workspace");
    localStorage.removeItem("chat_workspace_map");
    localStorage.removeItem("custom_api_url");
    setSelectedWorkspace("personal");
    fetchChats();
    showToast("Factory settings restored", "success");
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        setChats,
        activeChat,
        setActiveChat,
        createNewChat,
        input,
        setInput,
        sendMessage,
        isAiTyping,
        setIsAiTyping,
        selectedModel,
        setSelectedModel,
        selectedWorkspace,
        setSelectedWorkspace,
        workspaces,
        updateWorkspaceSettings,
        clearWorkspaceChats,
        resetAllWorkspaceSettings,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
