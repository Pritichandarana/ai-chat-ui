import { createContext, useState, useEffect } from "react";
import authFetch from "../utils/authFetch";
import { useAuth } from "./AuthContext";
import { useUI } from "./UIContext";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [input, setInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState("Groq LLaMA 3.3");
  const [selectedWorkspace, setSelectedWorkspace] = useState("Personal Workspace");

  const { token } = useAuth();
  const { setLoading, showToast } = useUI();

  // ================= FETCH CHATS =================
  const fetchChats = async () => {
    setLoading(true);
    try {
      const data = await authFetch("/api/chats");
      setChats(data);
      if (data.length > 0) {
        setActiveChat(data[0]);
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

  // ================= CREATE NEW CHAT =================
  const createNewChat = async () => {
    setLoading(true);
    try {
      const newChat = await authFetch("/api/chats", { method: "POST" });
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

    const userMsg = { role: "user", content: input };
    setInput("");
    setIsAiTyping(true);

    try {
      const data = await authFetch("/api/chats/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [...(activeChat?.messages || []), userMsg],
          chatId: activeChat?._id,
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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
