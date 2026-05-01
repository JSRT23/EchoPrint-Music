/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
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
    },
  },
  plugins: [],
};
