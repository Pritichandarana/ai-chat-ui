import { useContext } from "react";
import { ChatContext } from "../../context/ChatContext";

export default function ChatMessages() {
  const { activeChat } = useContext(ChatContext);

  return (
    <div className="flex-1 overflow-y-auto">
      {!activeChat ? (
        <div className="flex items-center justify-center h-full text-gray-400">
          Start a new conversation
        </div>
      ) : (
        activeChat.messages.map((msg, i) => (
          <div
            key={i}
            className={`py-5 ${
              msg.role === "user"
                ? "bg-white dark:bg-[#343541]"
                : "bg-gray-100 dark:bg-[#444654]"
            }`}
          >
            <div className="max-w-3xl px-4 mx-auto">
              <p className="text-xs text-gray-500">
                {msg.role === "user" ? "You" : "AI"}
              </p>

              <p className="mt-1 text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
