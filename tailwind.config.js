export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        mm: {
          bg: "#0B1020",
          sidebar: "#111827",
          card: "#1A2238",
          "card-hover": "#1E2A45",
          purple: "#7C3AED",
          "purple-light": "#9D5CF5",
          cyan: "#06B6D4",
          "cyan-light": "#22D3EE",
          text: "#F9FAFB",
          muted: "#9CA3AF",
          border: "rgba(255,255,255,0.06)",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      backgroundImage: {
        "gradient-mm": "linear-gradient(135deg, #7C3AED, #06B6D4)",
        "gradient-mm-reverse": "linear-gradient(135deg, #06B6D4, #7C3AED)",
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: 0, transform: "translateY(14px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%,100%": { boxShadow: "0 0 10px rgba(124,58,237,0.3)" },
          "50%": { boxShadow: "0 0 28px rgba(124,58,237,0.7)" },
        },
        gradientShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        floatY: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        typingDot: {
          "0%,60%,100%": { transform: "translateY(0)", opacity: 0.4 },
          "30%": { transform: "translateY(-5px)", opacity: 1 },
        },
        slideInLeft: {
          from: { opacity: 0, transform: "translateX(-12px)" },
          to: { opacity: 1, transform: "translateX(0)" },
        },
        recordPulse: {
          "0%,100%": { opacity: 1 },
          "50%": { opacity: 0.4 },
        },
      },
      animation: {
        "fade-in-up": "fadeInUp 0.35s cubic-bezier(0.16,1,0.3,1) both",
        "pulse-glow": "pulseGlow 2.5s ease-in-out infinite",
        gradient: "gradientShift 4s ease infinite",
        float: "floatY 4s ease-in-out infinite",
        "typing-dot": "typingDot 1.4s ease-in-out infinite",
        "slide-in-left": "slideInLeft 0.3s ease both",
        "record-pulse": "recordPulse 1s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
      },
      boxShadow: {
        "glow-purple": "0 0 20px rgba(124,58,237,0.35)",
        "glow-cyan": "0 0 20px rgba(6,182,212,0.35)",
        "glow-purple-lg": "0 0 40px rgba(124,58,237,0.4)",
        glass: "0 8px 32px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};
