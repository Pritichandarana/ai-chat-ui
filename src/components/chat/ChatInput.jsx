import { useState, useContext, useRef } from "react";
import { ChatContext } from "../../context/ChatContext";
import authFetch from "../../utils/authFetch";

export default function ChatInput() {
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);

  const { activeChat, setChats, setActiveChat } = useContext(ChatContext);

  const fileRef = useRef(null);

  // 🎤 MIC
  const handleMic = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Mic not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";

    recognition.start();

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setInput(text);

      setTimeout(() => {
        sendMessage(text);
      }, 500);
    };
  };

  // 📎 FILE SELECT
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) setFile(selected);
  };

  // 💬 SEND MESSAGE
  const sendMessage = async (customText) => {
    const messageText = customText || input;

    if (!messageText.trim()) return;

    let currentChat = activeChat;

    try {
      // ✅ CREATE CHAT FROM BACKEND (FIXED)
      if (!currentChat) {
        const res = await authFetch("/api/chats", {
          method: "POST",
        });

        const newChat = await res.json();

        currentChat = newChat;

        setActiveChat(newChat);
        setChats((prev) => [newChat, ...prev]);
      }

      let content = messageText;

      // 📎 FILE UPLOAD
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        try {
          const uploadRes = await fetch("http://localhost:5000/api/upload", {
            method: "POST",
            body: formData,
          });

          const uploadData = await uploadRes.json();

          content += `

--- FILE CONTENT START ---
${uploadData.text}
--- FILE CONTENT END ---
`;
        } catch (err) {
          console.error("Upload failed", err);
        }
      }

      const userMsg = { role: "user", content };

      const updatedChat = {
        ...currentChat,
        messages: [...(currentChat.messages || []), userMsg],
      };

      setActiveChat(updatedChat);

      setChats((prev) =>
        prev.map((c) => (c._id === updatedChat._id ? updatedChat : c)),
      );

      setInput("");
      setFile(null);

      // ✅ SEND MESSAGE TO BACKEND
      const res = await authFetch("/api/chats/chat", {
        method: "POST",
        body: JSON.stringify({
          message: content,
          chatId: currentChat._id,
        }),
      });

      const data = await res.json();

      const aiMsg = {
        role: "assistant",
        content: data.reply,
      };

      const finalChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, aiMsg],
      };

      setActiveChat(finalChat);

      setChats((prev) =>
        prev.map((c) => (c._id === finalChat._id ? finalChat : c)),
      );
    } catch (err) {
      console.error("Chat error:", err);
    }
  };

  return (
    <div className="p-3 border-t border-gray-300 dark:border-gray-700 bg-white dark:bg-[#343541]">
      <div className="flex flex-col max-w-3xl gap-2 mx-auto">
        {/* 📎 FILE PREVIEW */}
        {file && (
          <div className="flex items-center justify-between p-2 text-sm bg-gray-200 rounded dark:bg-gray-700">
            <span>{file.name}</span>
            <button onClick={() => setFile(null)}>❌</button>
          </div>
        )}

        <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#40414f] rounded-lg p-2">
          {/* FILE BUTTON */}
          <button onClick={() => fileRef.current.click()}>+</button>

          <input type="file" ref={fileRef} hidden onChange={handleFileChange} />

          {/* MIC */}
          <button onClick={handleMic}>🎤</button>

          {/* INPUT */}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Send a message..."
            className="flex-1 text-sm bg-transparent outline-none"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          {/* SEND */}
          <button
            onClick={() => sendMessage()}
            className="px-3 py-1 text-white bg-green-500 rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
