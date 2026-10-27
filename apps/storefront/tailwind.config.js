/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brutalist palette
        primary: {
          DEFAULT: "#77269A",
          hover: "#5F1E7C",
          muted: "rgba(119, 38, 154, 0.15)",
        },
        accent: {
          DEFAULT: "#51D6FF",
          hover: "#7EE0FF",
        },
        hotpink: {
          DEFAULT: "#EC69D4",
          hover: "#F18BDF",
        },
        muted: {
          DEFAULT: "#5F5980",
          hover: "#75709A",
        },
        cream: "#fff1e8",
        bg: "#fff1e8",
        "bg-alt": "#f5e5d8",
        surface: "#fff1e8",
        "surface-elevated": "#fff1e8",
        "surface-hover": "#f5e5d8",
        border: "#000000",
        "border-hover": "#000000",
        text: "#000000",
        "text-muted": "#5F5980",
        "text-inverse": "#FFFFFF",
        success: "#51D6FF",
        "success-bg": "rgba(81, 214, 255, 0.15)",
        danger: "#EC69D4",
        "danger-bg": "rgba(236, 105, 212, 0.15)",
        overlay: "rgba(0, 0, 0, 0.8)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)"],
      },
      maxWidth: {
        container: "1440px",
      },
      borderWidth: {
        3: "3px",
        5: "5px",
        6: "6px",
      },
      boxShadow: {
        brutal: "6px 6px 0 0 #000000",
        "brutal-sm": "4px 4px 0 0 #000000",
        "brutal-lg": "10px 10px 0 0 #000000",
        "brutal-cyan": "6px 6px 0 0 #51D6FF",
        "brutal-pink": "6px 6px 0 0 #EC69D4",
        "brutal-purple": "6px 6px 0 0 #77269A",
        "brutal-white": "6px 6px 0 0 #FFFFFF",
        "brutal-inset": "inset 4px 4px 0 0 #000000",
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
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
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
        marquee: "marquee 30s linear infinite",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};
