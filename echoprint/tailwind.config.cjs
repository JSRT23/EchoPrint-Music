/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // 🔥 incluye todo para evitar purge agresivo
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        bg: "#08080f",
        surface: "#111120",
        surface2: "#1a1a2e",
        cyan: "#00e5ff",
        violet: "#7b61ff",
        muted: "#6b6b8a",
        border: "rgba(255,255,255,0.07)",
      },
      animation: {
        "drift-1": "drift1 12s ease-in-out infinite alternate",
        "drift-2": "drift2 14s ease-in-out infinite alternate",
        "drift-3": "drift3 10s ease-in-out infinite alternate",
        "ring-pulse": "ringPulse 3s ease-out infinite",
        "scan-pulse": "scanPulse 1s ease-in-out infinite alternate",
        "fade-in": "fadeIn 0.2s ease",
        "slide-up": "slideUp 0.3s cubic-bezier(0.16,1,0.3,1)",
        "spin-slow": "spin 1.2s linear infinite",
        wave: "wave 0.7s ease-in-out infinite alternate",
      },
      keyframes: {
        drift1: {
          "0%": { transform: "translate(0,0) scale(1)" },
          "100%": { transform: "translate(30px,40px) scale(1.08)" },
        },
        drift2: {
          "0%": { transform: "translate(0,0) scale(1)" },
          "100%": { transform: "translate(-20px,30px) scale(1.05)" },
        },
        drift3: {
          "0%": { transform: "translate(0,0) scale(1)" },
          "100%": { transform: "translate(25px,-20px) scale(1.1)" },
        },
        ringPulse: {
          "0%": { opacity: 0, transform: "scale(0.8)" },
          "50%": { opacity: 1 },
          "100%": { opacity: 0, transform: "scale(1.2)" },
        },
        scanPulse: {
          from: { boxShadow: "0 0 40px rgba(0,229,255,0.4)" },
          to: { boxShadow: "0 0 80px rgba(0,229,255,0.8)" },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        slideUp: {
          from: { transform: "translateY(20px) scale(0.97)", opacity: 0 },
          to: { transform: "translateY(0) scale(1)", opacity: 1 },
        },
        wave: {
          from: { height: "4px" },
          to: { height: "22px" },
        },
      },
      backdropBlur: {
        xs: "4px",
      },
    },
  },

  // 🔥 evita que Tailwind borre clases dinámicas si las usas
  safelist: ["bg-cyan", "bg-violet", "text-cyan", "text-violet"],

  plugins: [],
};
