import { useContext, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import ChatMessages from "../components/chat/ChatMessages";
import ChatInput from "../components/chat/ChatInput";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";

export default function ChatPage() {
  const { chats } = useContext(ChatContext);

  // ✅ Sidebar state (important)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* HEADER */}
      <Header setSidebarOpen={setSidebarOpen} />

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        {/* CHAT AREA */}
        <div
          className={`flex flex-col flex-1 h-full transition-all duration-300 ${
            sidebarOpen ? "ml-64" : "ml-0"
          } md:ml-0`}
        >
          <ChatMessages />
          <ChatInput />
        </div>
      </div>
    </div>
  );
}
