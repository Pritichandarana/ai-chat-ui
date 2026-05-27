import { useContext } from "react";
import { ChatContext } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { SparklesIcon, MicIcon, VideoIcon, ImageIcon } from "../ui/Icons";

const SUGGESTIONS = [
  {
    icon: "✨",
    label: "Generate ideas",
    prompt: "Give me 5 creative ideas for a SaaS product targeting remote teams",
    color: "#7C3AED",
  },
  {
    icon: "💻",
    label: "Write code",
    prompt: "Write a React hook for debouncing user input with TypeScript",
    color: "#06B6D4",
  },
  {
    icon: "📝",
    label: "Summarize text",
    prompt: "Summarize the key trends in AI for 2025 in bullet points",
    color: "#F59E0B",
  },
  {
    icon: "🔍",
    label: "Explain concept",
    prompt: "Explain how transformer attention mechanisms work in simple terms",
    color: "#10B981",
  },
];

export default function EmptyState() {
  const { createNewChat, setActiveChat, setChats, chats } =
    useContext(ChatContext);
  const { user } = useAuth();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const handleSuggestion = async (prompt) => {
    // We'll set the input via a custom event
    window.dispatchEvent(
      new CustomEvent("mm:set-input", { detail: { text: prompt } })
    );
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8 select-none">
      {/* Logo */}
      <div
        className="w-20 h-20 rounded-3xl gradient-bg flex items-center justify-center mb-6 animate-float"
        style={{
          boxShadow: "0 0 50px rgba(124,58,237,0.5), 0 0 100px rgba(124,58,237,0.2)",
        }}
      >
        <span className="text-white font-black text-4xl">M</span>
      </div>

      {/* Greeting */}
      <h1
        className="text-3xl font-bold mb-2 text-center"
        style={{ color: "#F9FAFB" }}
      >
        {greeting},{" "}
        <span className="gradient-text">
          {user?.name?.split(" ")[0] || "there"}
        </span>
      </h1>
      <p className="text-base mb-8 text-center max-w-sm" style={{ color: "#6B7280" }}>
        Your AI workspace is ready. Ask anything, generate images, or upload
        files to get started.
      </p>

      {/* Capability Pills */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {[
          { icon: <SparklesIcon size={13} />, label: "Generate Images", color: "#7C3AED" },
          { icon: <MicIcon size={13} />, label: "Voice Input", color: "#06B6D4" },
          { icon: <VideoIcon size={13} />, label: "Video Support", color: "#F59E0B" },
          { icon: <ImageIcon size={13} />, label: "File Upload", color: "#10B981" },
        ].map((cap) => (
          <div
            key={cap.label}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: `${cap.color}18`,
              border: `1px solid ${cap.color}35`,
              color: cap.color,
            }}
          >
            {cap.icon}
            {cap.label}
          </div>
        ))}
      </div>

      {/* Suggestion Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            className="suggestion-card text-left"
            style={{ animationDelay: `${i * 0.08}s` }}
            onClick={() => handleSuggestion(s.prompt)}
          >
            <div className="flex items-start gap-3">
              <span
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                style={{ background: `${s.color}15`, border: `1px solid ${s.color}25` }}
              >
                {s.icon}
              </span>
              <div>
                <p
                  className="text-sm font-semibold mb-0.5"
                  style={{ color: "#F9FAFB" }}
                >
                  {s.label}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "#6B7280" }}>
                  {s.prompt.slice(0, 55)}…
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
