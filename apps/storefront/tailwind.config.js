/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6D28D9",
          hover: "#7C3AED",
          muted: "rgba(109, 40, 217, 0.15)",
        },
        accent: {
          DEFAULT: "#F59E0B",
          hover: "#FBBF24",
        },
        bg: "#0F0F0F",
        surface: "#1A1A2E",
        "surface-elevated": "#252540",
        "surface-hover": "#2D2D4A",
        border: "rgba(255, 255, 255, 0.08)",
        "border-hover": "rgba(255, 255, 255, 0.15)",
        text: "#F1F1F1",
        "text-muted": "#A0A0B0",
        "text-inverse": "#0F0F0F",
        success: "#10B981",
        "success-bg": "rgba(16, 185, 129, 0.1)",
        danger: "#EF4444",
        "danger-bg": "rgba(239, 68, 68, 0.1)",
        overlay: "rgba(0, 0, 0, 0.6)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)"],
      },
      maxWidth: {
        container: "1280px",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 8px rgba(109, 40, 217, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(109, 40, 217, 0.6)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
        "slide-in-right": "slideInRight 0.3s ease-out forwards",
        "scale-in": "scaleIn 0.3s ease-out forwards",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};
