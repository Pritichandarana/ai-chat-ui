import { useState, useContext, useRef, useEffect } from "react";
import { ChatContext } from "../../context/ChatContext";
import authFetch from "../../utils/authFetch";
import {
  PaperclipIcon,
  MicIcon,
  VideoIcon,
  SparklesIcon,
  SendIcon,
  XIcon,
  StopIcon,
} from "../ui/Icons";

function getFileIcon(file) {
  if (!file) return "📎";
  const t = file.type || "";
  if (t.startsWith("image")) return "🖼️";
  if (t.startsWith("video")) return "🎬";
  if (t.startsWith("audio")) return "🎵";
  if (t.includes("pdf")) return "📄";
  return "📎";
}

// ─── Image Generation Modal ───
function ImageGenModal({ onClose, onGenerate, loading }) {
  const [prompt, setPrompt] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) onGenerate(prompt.trim());
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass rounded-2xl p-6 w-full max-w-md mx-4"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shrink-0"
              style={{ boxShadow: "0 0 16px rgba(124,58,237,0.45)" }}
            >
              <SparklesIcon size={16} />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Generate Image</h3>
              <p className="text-[10px]" style={{ color: "#6B7280" }}>
                Diffusion AI engine
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            ref={inputRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate…"
            rows={3}
            className="w-full rounded-xl p-3 text-sm resize-none outline-none"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(124,58,237,0.25)",
              color: "#F9FAFB",
              lineHeight: "1.6",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />

          <div className="flex flex-wrap gap-1.5 mt-2 mb-4">
            {["Futuristic city", "Abstract art", "Portrait photo", "Neon landscape"].map(
              (s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPrompt(s)}
                  className="px-2.5 py-1 rounded-lg text-[10px] transition-all"
                  style={{
                    background: "rgba(124,58,237,0.1)",
                    border: "1px solid rgba(124,58,237,0.2)",
                    color: "#a78bfa",
                  }}
                >
                  {s}
                </button>
              )
            )}
          </div>

          <button
            type="submit"
            disabled={!prompt.trim() || loading}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2"
            style={{
              background:
                prompt.trim() && !loading
                  ? "linear-gradient(135deg,#7C3AED,#06B6D4)"
                  : "rgba(255,255,255,0.06)",
              color: prompt.trim() && !loading ? "white" : "#6B7280",
              cursor: prompt.trim() && !loading ? "pointer" : "not-allowed",
            }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Synthesizing…
              </>
            ) : (
              <>
                <SparklesIcon size={14} />
                Generate Image
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

const FOCUS_MODES = [
  { name: "Writing", icon: "✍️", desc: "Focus on drafting, edits & emails" },
  { name: "Code", icon: "💻", desc: "Optimal syntax formatting & explanations" },
  { name: "Academic", icon: "📚", desc: "Search detailed journals & citations" },
  { name: "All", icon: "🔮", desc: "General multi-modal intelligence" }
];

export default function ChatInput() {
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recordingKind, setRecordingKind] = useState(null);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [showImageGen, setShowImageGen] = useState(false);
  const [imageGenLoading, setImageGenLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Perplexity-style options
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [focusMode, setFocusMode] = useState("All");
  const [focusDropdownOpen, setFocusDropdownOpen] = useState(false);
  const [simulatedSearchStatus, setSimulatedSearchStatus] = useState("");

  const { activeChat, setChats, setActiveChat, setIsAiTyping, selectedModel } =
    useContext(ChatContext);

  const fileRef = useRef(null);
  const textareaRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const chunksRef = useRef([]);
  const recordTimerRef = useRef(null);
  const focusRef = useRef(null);

  // Close focus dropdown
  useEffect(() => {
    function clickOutside(e) {
      if (focusRef.current && !focusRef.current.contains(e.target)) {
        setFocusDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  // Listen for EmptyState suggestion events
  useEffect(() => {
    const handler = (e) => {
      const text = e.detail?.text;
      if (text) {
        setInput(text);
        textareaRef.current?.focus();
      }
    };
    window.addEventListener("mm:set-input", handler);
    return () => window.removeEventListener("mm:set-input", handler);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 140) + "px";
  }, [input]);

  // File Preview Url
  useEffect(() => {
    if (!file) {
      setFilePreviewUrl(null);
      return;
    }
    if (file.type?.startsWith("image")) {
      const url = URL.createObjectURL(file);
      setFilePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setFilePreviewUrl(null);
  }, [file]);

  // Recording timer
  useEffect(() => {
    if (recording) {
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(
        () => setRecordSeconds((s) => s + 1),
        1000
      );
    } else {
      clearInterval(recordTimerRef.current);
      setRecordSeconds(0);
    }
    return () => clearInterval(recordTimerRef.current);
  }, [recording]);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const handleMic = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }
    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.start();
    recognition.onresult = (ev) => {
      const text = ev.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " + text : text));
      textareaRef.current?.focus();
    };
  };

  const startRecording = async (kind) => {
    try {
      const constraints =
        kind === "video" ? { audio: true, video: true } : { audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;
      const mimeType = kind === "video" ? "video/webm" : "audio/webm";
      const opts = MediaRecorder.isTypeSupported(mimeType) ? { mimeType } : undefined;
      const recorder = new MediaRecorder(stream, opts);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data?.size) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const f = new File([blob], `${kind}-recording-${Date.now()}.webm`, {
          type: blob.type,
        });
        setFile(f);
        mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
        mediaRecorderRef.current = null;
        setRecording(false);
        setRecordingKind(null);
      };

      recorder.start();
      setRecording(true);
      setRecordingKind(kind);
    } catch (err) {
      console.error(err);
      alert("Microphone/Camera permissions required.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const formatRecordTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleGenerateImage = async (prompt) => {
    setImageGenLoading(true);
    try {
      const res = await authFetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });

      setShowImageGen(false);

      let currentChat = activeChat;
      if (!currentChat) {
        const newChat = await authFetch("/api/chats", { method: "POST" });
        currentChat = newChat;
        setActiveChat(newChat);
        setChats((prev) => [newChat, ...prev]);
      }

      const userMsg = {
        role: "user",
        content: `🖼️ Generated image: "${prompt}"`,
        file: { url: res.url, mime: res.mime || "image/png", fileName: res.fileName },
      };

      const updatedChat = {
        ...currentChat,
        messages: [...(currentChat.messages || []), userMsg],
      };
      setActiveChat(updatedChat);
      setChats((prev) => prev.map((c) => (c._id === updatedChat._id ? updatedChat : c)));

      try {
        setIsAiTyping(true);
        const data = await authFetch("/api/chats/chat", {
          method: "POST",
          body: JSON.stringify({
            message: `I just generated an image with prompt: "${prompt}". Provide a brief, futuristic, creative critique of this idea in 2 sentences.`,
            chatId: currentChat._id,
            model: selectedModel,
          }),
        });
        const aiMsg = { role: "assistant", content: data.reply };
        const finalChat = {
          ...updatedChat,
          messages: [...updatedChat.messages, aiMsg],
        };
        setActiveChat(finalChat);
        setChats((prev) => prev.map((c) => (c._id === finalChat._id ? finalChat : c)));
      } catch (_) {}
    } catch (err) {
      console.error(err);
      alert("Image generation failed");
    } finally {
      setImageGenLoading(false);
      setIsAiTyping(false);
    }
  };

  const sendMessage = async (customText) => {
    const messageText = customText !== undefined ? customText : input;
    if (!messageText.trim() && !file) return;
    if (sending) return;

    setSending(true);
    let currentChat = activeChat;

    try {
      if (!currentChat) {
        const newChat = await authFetch("/api/chats", { method: "POST" });
        currentChat = newChat;
        setActiveChat(newChat);
        setChats((prev) => [newChat, ...prev]);
      }

      let content = messageText;
      let fileMeta = null;

      // Add Focus Mode context to user query if selected
      if (focusMode !== "All") {
        content = `[Mode: ${focusMode}] ${content}`;
      }

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        try {
          const uploadData = await authFetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          content += uploadData.url ? `\n\nFILE_URL: ${uploadData.url}\n` : "";
          fileMeta = {
            url: uploadData.url,
            mime: uploadData.mime,
            fileName: uploadData.fileName,
          };
        } catch (err) {
          console.error("Upload failed:", err);
        }
      }

      const userMsg = { role: "user", content, file: fileMeta };
      const optimisticChat = {
        ...currentChat,
        messages: [...(currentChat.messages || []), userMsg],
      };
      setActiveChat(optimisticChat);
      setChats((prev) => prev.map((c) => (c._id === optimisticChat._id ? optimisticChat : c)));

      setInput("");
      setFile(null);

      // Web search status simulation
      if (webSearchEnabled) {
        setSimulatedSearchStatus("Searching indexed sources...");
        setIsAiTyping(true);
        await new Promise((r) => setTimeout(r, 1200));
        setSimulatedSearchStatus("Synthesizing context from 4 matches...");
        await new Promise((r) => setTimeout(r, 900));
        setSimulatedSearchStatus("");
      } else {
        setIsAiTyping(true);
      }

      const data = await authFetch("/api/chats/chat", {
        method: "POST",
        body: JSON.stringify({
          message: content,
          chatId: currentChat._id,
          file: fileMeta,
          model: selectedModel,
        }),
      });

      const aiMsg = { role: "assistant", content: data.reply };
      const finalChat = {
        ...optimisticChat,
        messages: [...optimisticChat.messages, aiMsg],
      };
      setActiveChat(finalChat);
      setChats((prev) => prev.map((c) => (c._id === finalChat._id ? finalChat : c)));
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
      setIsAiTyping(false);
      setSimulatedSearchStatus("");
    }
  };

  // Listen for message regeneration requests
  useEffect(() => {
    const handleRegen = async () => {
      if (!activeChat || !activeChat.messages?.length) return;
      const messages = activeChat.messages;
      let lastUserMessage = null;
      // Search backwards for the last user message
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === "user") {
          lastUserMessage = messages[i];
          break;
        }
      }
      if (!lastUserMessage) return;

      const userMsgContent = lastUserMessage.content;

      // Filter out the last assistant response to prepare for regeneration
      const filteredMessages = messages.filter((_, idx) => idx !== messages.length - 1);
      setActiveChat((prev) => ({ ...prev, messages: filteredMessages }));

      // Re-send the prompt
      sendMessage(userMsgContent);
    };
    window.addEventListener("mm:regenerate-message", handleRegen);
    return () => window.removeEventListener("mm:regenerate-message", handleRegen);
  }, [activeChat, sendMessage, setActiveChat]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const canSend = (input.trim() || file) && !sending;
  const activeFocusObj = FOCUS_MODES.find((f) => f.name === focusMode) || FOCUS_MODES[3];

  return (
    <>
      {showImageGen && (
        <ImageGenModal
          onClose={() => setShowImageGen(false)}
          onGenerate={handleGenerateImage}
          loading={imageGenLoading}
        />
      )}

      {/* Floating Wrapper */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-6 pt-10 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, transparent 0%, rgba(11, 16, 32, 0.9) 70%, #0B1020 100%)",
        }}
      >
        <div className="max-w-3xl mx-auto pointer-events-auto">
          {/* Web Search Simulated Indicator */}
          {simulatedSearchStatus && (
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-[#06B6D4]/30 bg-[#06B6D4]/8 text-xs text-[#06B6D4] font-medium w-fit mb-3 shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-pulse">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-[#06B6D4]/30 border-t-[#06B6D4] animate-spin" />
              <span>{simulatedSearchStatus}</span>
            </div>
          )}

          {/* Recording Indicator */}
          {recording && (
            <div className="record-indicator mb-3 w-fit shadow-lg">
              <div className="record-dot" />
              <span>Recording {recordingKind} — {formatRecordTime(recordSeconds)}</span>
              <button
                onClick={stopRecording}
                className="ml-2 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-red-500/20 border border-red-500/30 text-[#EF4444]"
              >
                <StopIcon size={10} /> Stop
              </button>
            </div>
          )}

          {/* File Preview */}
          {file && (
            <div className="flex items-center gap-2 mb-3">
              {filePreviewUrl ? (
                <div className="relative group">
                  <img src={filePreviewUrl} alt="preview" className="file-preview-img shadow-lg" />
                  <button
                    onClick={() => setFile(null)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 shadow-md text-white transition-colors"
                  >
                    <XIcon size={10} />
                  </button>
                </div>
              ) : (
                <div className="file-preview-chip shadow-md">
                  <span>{getFileIcon(file)}</span>
                  <span className="truncate max-w-[120px] font-semibold text-gray-200">
                    {file.name}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {(file.size / 1024).toFixed(0)}KB
                  </span>
                  <button onClick={() => setFile(null)} className="ml-1 text-red-400 hover:text-red-500">
                    <XIcon size={11} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Floating Input Panel */}
          <div
            className={`glass input-ring rounded-2xl relative shadow-[0_12px_40px_rgba(0,0,0,0.15)] border border-mm-border bg-mm-card/65 backdrop-blur-2xl ${
              dragActive ? "drag-active" : ""
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {dragActive && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-[#06B6D4]/5 border-2 border-dashed border-[#06B6D4]/40 z-10 pointer-events-none">
                <p className="text-sm font-semibold text-[#06B6D4] animate-pulse">
                  Drop files to upload
                </p>
              </div>
            )}

            {/* Top Toolbar: Action icons, Focus dropdown, and Web search toggle */}
            <div
              className="flex items-center gap-1.5 px-3 py-2 border-b border-white/5 select-none"
            >
              {/* Attach File */}
              <input
                type="file"
                ref={fileRef}
                hidden
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
              />
              <button
                className="btn-icon w-8 h-8 rounded-lg"
                title="Upload attachments"
                onClick={() => fileRef.current?.click()}
              >
                <PaperclipIcon size={14} />
              </button>

              {/* Dictation */}
              <button
                className="btn-icon w-8 h-8 rounded-lg"
                title="Voice dictation"
                onClick={handleMic}
              >
                <MicIcon size={14} />
              </button>

              {/* Audio recording */}
              <button
                className={`btn-icon w-8 h-8 rounded-lg ${recording && recordingKind === "audio" ? "recording" : ""}`}
                title="Record audio memo"
                onClick={() => (recording ? stopRecording() : startRecording("audio"))}
              >
                {recording && recordingKind === "audio" ? <StopIcon size={12} /> : <MicIcon size={14} />}
              </button>

              {/* Video recording */}
              <button
                className={`btn-icon w-8 h-8 rounded-lg ${recording && recordingKind === "video" ? "recording" : ""}`}
                title="Record video memo"
                onClick={() => (recording ? stopRecording() : startRecording("video"))}
              >
                {recording && recordingKind === "video" ? <StopIcon size={12} /> : <VideoIcon size={14} />}
              </button>

              {/* Generate Image Button */}
              <button
                className="btn-icon w-8 h-8 rounded-lg"
                title="Generate illustration"
                onClick={() => setShowImageGen(true)}
                style={{
                  background: "rgba(124,58,237,0.1)",
                  borderColor: "rgba(124,58,237,0.2)",
                  color: "#a78bfa",
                }}
              >
                <SparklesIcon size={13} />
              </button>

              <div className="h-4 w-px bg-white/5 mx-1" />

              {/* Focus selector (Perplexity Inspired) */}
              <div className="relative" ref={focusRef}>
                <button
                  type="button"
                  onClick={() => setFocusDropdownOpen(!focusDropdownOpen)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-mm-card/25 border border-mm-border hover:bg-mm-card-hover text-mm-text transition-colors"
                >
                  <span className="text-xs">{activeFocusObj.icon}</span>
                  <span>{activeFocusObj.name}</span>
                </button>

                {focusDropdownOpen && (
                  <div
                    className="absolute left-0 bottom-full mb-2 w-56 rounded-xl glass p-1 shadow-2xl border border-mm-border bg-mm-card"
                    style={{ animation: "fadeInUp 0.15s cubic-bezier(0.16, 1, 0.3, 1) both" }}
                  >
                    {FOCUS_MODES.map((f) => {
                      const isSel = f.name === focusMode;
                      return (
                        <button
                          key={f.name}
                          type="button"
                          onClick={() => {
                            setFocusMode(f.name);
                            setFocusDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors ${
                            isSel ? "bg-mm-purple/10 text-mm-purple" : "hover:bg-mm-card-hover text-mm-muted"
                          }`}
                        >
                          <span className="text-sm select-none">{f.icon}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-mm-text">{f.name}</p>
                            <p className="text-[9px] text-mm-muted truncate mt-0.5">{f.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex-1" />

              {/* Web Search Toggle (Glowing active) */}
              <button
                type="button"
                onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase transition-all duration-200 border ${
                  webSearchEnabled
                    ? "bg-[#06B6D4]/12 border-[#06B6D4]/45 text-[#06B6D4] shadow-[0_0_12px_rgba(6,182,212,0.22)]"
                    : "bg-white/5 border-white/5 text-gray-500 hover:text-gray-300"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full shrink-0 transition-transform ${
                    webSearchEnabled ? "bg-[#06B6D4] animate-pulse" : "bg-gray-500"
                  }`}
                />
                <span>Web Search</span>
              </button>
            </div>

            {/* Input Form Text Area & Send Button */}
            <div className="flex items-end gap-3 p-3">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  dragActive
                    ? "Release files here…"
                    : `Query MindMesh using ${focusMode} mode… (Shift+Enter for newline)`
                }
                rows={1}
                className="flex-1 bg-transparent text-sm resize-none outline-none leading-relaxed text-mm-text max-h-[140px] min-h-[22px] placeholder-gray-500"
              />

              <button
                onClick={() => sendMessage()}
                disabled={!canSend}
                className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
                style={{
                  background: canSend
                    ? "linear-gradient(135deg,#7C3AED,#6D28D9)"
                    : "rgba(255,255,255,0.04)",
                  border: canSend ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(255,255,255,0.05)",
                  color: canSend ? "white" : "#4B5563",
                  boxShadow: canSend ? "0 0 12px rgba(124,58,237,0.3)" : "none",
                  cursor: canSend ? "pointer" : "not-allowed",
                }}
              >
                {sending ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <SendIcon size={13} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
