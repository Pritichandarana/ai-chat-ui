import { useContext, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import ChatMessages from "../components/chat/ChatMessages";
import ChatInput from "../components/chat/ChatInput";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";

export default function ChatPage() {
  const { chats } = useContext(ChatContext);

  // Sidebar toggle state (open by default on desktop)
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-mm-bg text-mm-text">
      {/* ─── SIDEBAR (Left side, full height) ─── */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* ─── MAIN WORKSPACE AREA (Right side, spans remaining width) ─── */}
      <div className="flex flex-col flex-1 h-full overflow-hidden relative">
        {/* Header/Navbar */}
        <Header setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />

        {/* Chat Message Viewport & Input */}
        <div className="flex-1 relative overflow-hidden flex flex-col">
          <ChatMessages />
          <ChatInput />
        </div>
      </div>
    </div>
  );
}
