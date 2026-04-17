import { createContext, useState, useEffect } from "react";
import authFetch from "../utils/authFetch";
import { useAuth } from "./AuthContext";
import { useUI } from "./UIContext";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [input, setInput] = useState("");

  const { token } = useAuth();
  const { setLoading, showToast } = useUI(); // ✅ UI hooks

  // ================= FETCH CHATS =================
  const fetchChats = async () => {
    setLoading(true);

    try {
      const res = await authFetch("/api/chats");

      if (!res.ok) {
        showToast("Failed to load chats");
        return;
      }

      const data = await res.json();
      setChats(data);

      if (data.length > 0) {
        setActiveChat(data[0]);
      }
    } catch (err) {
      console.error(err);
      showToast("Something went wrong");
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
      const res = await authFetch("/api/chats", {
        method: "POST",
      });

      if (!res.ok) {
        showToast("Failed to create chat");
        return;
      }

      const newChat = await res.json();

      setChats((prev) => [newChat, ...prev]);
      setActiveChat(newChat);

      showToast("New chat created", "success");
    } catch (err) {
      console.error(err);
      showToast("Network error");
    } finally {
      setLoading(false);
    }
  };

  // ================= SEND MESSAGE =================
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = {
      role: "user",
      content: input,
    };

    setInput("");
    setLoading(true);

    try {
      const res = await authFetch("/api/chats/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...(activeChat?.messages || []), userMsg],
          chatId: activeChat?._id,
        }),
      });

      if (!res.ok) {
        showToast("Failed to send message");
        return;
      }

      const data = await res.json();

      const aiMsg = {
        role: "assistant",
        content: data.reply,
      };

      // ✅ UPDATE ACTIVE CHAT
      setActiveChat((prev) => ({
        ...prev,
        messages: [...(prev?.messages || []), userMsg, aiMsg],
      }));

      // ✅ UPDATE CHAT LIST
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === activeChat?._id
            ? {
                ...chat,
                messages: [...(chat.messages || []), userMsg, aiMsg],
              }
            : chat,
        ),
      );
    } catch (err) {
      console.error(err);
      showToast("Network error");
    } finally {
      setLoading(false);
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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
