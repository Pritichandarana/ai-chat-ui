import { useEffect, useRef, useState } from "react";

export default function useSpeechRecognition(setInput) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => `${prev} ${transcript}`.trim());
    };

    recognitionRef.current = recognition;
  }, [setInput]);

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    isListening
      ? recognitionRef.current.stop()
      : recognitionRef.current.start();
  };

  return { isListening, toggleMic };
}
