export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 px-4 py-4 msg-enter">
      {/* AI Avatar */}
      <div className="ai-avatar shrink-0">M</div>

      {/* Bubble */}
      <div
        className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-sm"
        style={{
          background: "rgba(26,34,56,0.55)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="typing-dot" style={{ animationDelay: "0s" }} />
        <div className="typing-dot" style={{ animationDelay: "0.2s" }} />
        <div className="typing-dot" style={{ animationDelay: "0.4s" }} />
      </div>

      <span className="text-xs mt-2.5 opacity-0 select-none">AI</span>
    </div>
  );
}
