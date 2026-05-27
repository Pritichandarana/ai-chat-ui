import { useContext, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ChatContext } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import EmptyState from "./EmptyState";
import TypingIndicator from "./TypingIndicator";
import { CopyIcon, CheckIcon } from "../ui/Icons";

// ─── Inline SVGs for ratings and regeneration ───
function ThumbsUpIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
    </svg>
  );
}

function ThumbsDownIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3zm7-13h3a2 2 0 012 2v7a2 2 0 01-2 2h-3" />
    </svg>
  );
}

function ReloadIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18" />
    </svg>
  );
}

// ─── Code Block with Copy ───
function CodeBlock({ language, children }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="code-block shadow-md">
      <div className="code-block-header">
        <span className="font-mono text-xxs tracking-wider">{language || "code"}</span>
        <button className="copy-btn font-sans flex items-center gap-1" onClick={handleCopy}>
          {copied ? <CheckIcon size={11} /> : <CopyIcon size={11} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <SyntaxHighlighter
        language={language || "text"}
        style={oneDark}
        customStyle={{
          margin: 0,
          background: "transparent",
          fontSize: "12.5px",
          lineHeight: "1.7",
          padding: "14px 16px",
        }}
        showLineNumbers={false}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}

// ─── Markdown Renderer ───
function MarkdownContent({ content }) {
  return (
    <div className="prose-mm text-mm-text">
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const lang = match ? match[1] : "";
            if (!inline && (match || String(children).includes("\n"))) {
              return (
                <CodeBlock language={lang}>
                  {String(children).replace(/\n$/, "")}
                </CodeBlock>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          pre({ children }) {
            return <>{children}</>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

// ─── Media Renderer ───
function MediaMessage({ file }) {
  const [lightbox, setLightbox] = useState(false);

  if (!file?.url) return null;

  const mime = file.mime || "";

  if (mime.startsWith("image")) {
    return (
      <>
        <img
          src={file.url}
          alt={file.fileName || "image"}
          className="media-img mt-2.5 block"
          onClick={() => setLightbox(true)}
          title="Click to enlarge"
        />
        {lightbox && (
          <div className="lightbox z-[999]" onClick={() => setLightbox(false)}>
            <img src={file.url} alt={file.fileName || "image"} className="animate-fade-in" />
          </div>
        )}
      </>
    );
  }

  if (mime.startsWith("video")) {
    return (
      <video
        src={file.url}
        controls
        className="media-video mt-2.5 block shadow-lg"
      />
    );
  }

  if (mime.startsWith("audio")) {
    return (
      <div className="mt-2.5 max-w-sm shadow-md">
        <audio src={file.url} controls className="media-audio" />
      </div>
    );
  }

  return (
    <a
      href={file.url}
      target="_blank"
      rel="noreferrer"
      className="mt-2.5 flex items-center gap-2 px-3 py-2 rounded-xl text-xs w-fit shadow-md font-semibold transition-all hover:-translate-y-0.5"
      style={{
        background: "rgba(6,182,212,0.08)",
        border: "1px solid rgba(6,182,212,0.2)",
        color: "#22D3EE",
      }}
    >
      📎 {file.fileName || "Download Attachment"}
    </a>
  );
}

// ─── Single Message Component ───
function Message({ msg, index, userInitial, isLast }) {
  const isUser = msg.role === "user";
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState(null); // 'up', 'down', or null

  const cleanContent = msg.content
    ? msg.content.replace(/FILE_URL:.*\n?/g, "").trim()
    : "";

  // Strip Perplexity Focus Mode label from visual rendering
  const displayContent = cleanContent.startsWith("[Mode:")
    ? cleanContent.replace(/^\[Mode:\s*\w+\]\s*/, "")
    : cleanContent;

  const handleCopyText = () => {
    navigator.clipboard.writeText(cleanContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleRegenerate = () => {
    window.dispatchEvent(new CustomEvent("mm:regenerate-message"));
  };

  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (isUser) {
    return (
      <div
        className="flex items-end justify-end gap-3 px-4 py-2 msg-enter group"
        style={{ animationDelay: `${Math.min(index * 0.04, 0.3)}s` }}
      >
        <div className="flex flex-col items-end max-w-[75%] relative">
          <div
            className="user-bubble px-4 py-3 text-sm leading-relaxed shadow-lg relative text-mm-text"
            style={{ wordBreak: "break-word" }}
          >
            {displayContent && <p style={{ whiteSpace: "pre-wrap" }}>{displayContent}</p>}
            {msg.file && <MediaMessage file={msg.file} />}
          </div>
          <span className="text-[10px] text-gray-500 mt-1 select-none font-mono mr-1">
            {timeString}
          </span>
        </div>
        <div className="user-avatar shrink-0 mb-1 shadow-md select-none">{userInitial}</div>
      </div>
    );
  }

  // Assistant / AI Message
  return (
    <div
      className="flex items-start gap-3 px-4 py-2.5 msg-enter group relative"
      style={{ animationDelay: `${Math.min(index * 0.04, 0.3)}s` }}
    >
      <div className="ai-avatar shrink-0 mt-0.5 select-none font-black">M</div>
      <div className="flex flex-col max-w-[80%] relative">
        <div
          className="ai-bubble px-4.5 py-3.5 text-sm leading-relaxed shadow-md relative text-mm-text"
          style={{ wordBreak: "break-word" }}
        >
          {displayContent ? (
            <MarkdownContent content={displayContent} />
          ) : null}
          {msg.file && <MediaMessage file={msg.file} />}
        </div>
        
        {/* Timestamp and feedback status */}
        <div className="flex items-center gap-2 mt-1 px-1">
          <span className="text-[10px] text-gray-500 select-none font-mono">
            {timeString}
          </span>
        </div>

        {/* Hover Action Overlay panel (Linear Style) */}
        <div className="absolute -top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 glass p-1 rounded-xl shadow-lg border border-mm-border z-10">
          {/* Copy response */}
          <button
            onClick={handleCopyText}
            className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-mm-card-hover text-mm-muted hover:text-mm-text transition-colors"
            title="Copy answer"
          >
            {copied ? <CheckIcon size={11} /> : <CopyIcon size={11} />}
          </button>

          {/* Regenerate (Only shown on the very last AI response) */}
          {isLast && (
            <button
              onClick={handleRegenerate}
              className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-mm-card-hover text-mm-muted hover:text-mm-text transition-colors"
              title="Regenerate answer"
            >
              <ReloadIcon size={10} />
            </button>
          )}

          <div className="w-px h-3.5 bg-mm-border mx-0.5" />

          {/* Thumbs up */}
          <button
            onClick={() => setRating(rating === "up" ? null : "up")}
            className={`w-6 h-6 flex items-center justify-center rounded-lg hover:bg-mm-card-hover transition-colors ${
              rating === "up" ? "text-green-400" : "text-mm-muted hover:text-mm-text"
            }`}
            title="Good response"
          >
            <ThumbsUpIcon size={11} />
          </button>

          {/* Thumbs down */}
          <button
            onClick={() => setRating(rating === "down" ? null : "down")}
            className={`w-6 h-6 flex items-center justify-center rounded-lg hover:bg-mm-card-hover transition-colors ${
              rating === "down" ? "text-red-400" : "text-mm-muted hover:text-mm-text"
            }`}
            title="Bad response"
          >
            <ThumbsDownIcon size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ChatMessages Component ───
export default function ChatMessages() {
  const { activeChat, isAiTyping } = useContext(ChatContext);
  const { user } = useAuth();
  const bottomRef = useRef(null);
  const containerRef = useRef(null);

  const userInitial = user?.name?.charAt(0).toUpperCase() || "U";

  // Auto-scroll to bottom
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [activeChat?.messages, isAiTyping]);

  if (!activeChat || !activeChat.messages?.length) {
    return (
      <div className="chat-scroll" style={{ paddingBottom: "180px" }}>
        <EmptyState />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="chat-scroll"
      style={{ paddingTop: "12px", paddingBottom: "180px" }}
    >
      {/* Date divider */}
      <div className="flex items-center gap-3 px-6 mb-5">
        <div className="flex-1 h-px bg-mm-border" />
        <span className="text-[10px] uppercase font-bold tracking-widest text-mm-muted select-none">
          {new Date().toLocaleDateString([], {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </span>
        <div className="flex-1 h-px bg-mm-border" />
      </div>

      {/* Messages */}
      {activeChat.messages.map((msg, i) => (
        <Message
          key={i}
          msg={msg}
          index={i}
          userInitial={userInitial}
          isLast={i === activeChat.messages.length - 1}
        />
      ))}

      {/* Typing Indicator */}
      {isAiTyping && <TypingIndicator />}

      {/* Scroll anchor */}
      <div ref={bottomRef} style={{ height: "1px" }} />
    </div>
  );
}
