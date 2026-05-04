// tailwind.config.ts

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        sans:  ["DM Sans", "system-ui", "sans-serif"],
      },
      colors: {
        // Core brand palette
        void:    "#0F0D0A",
        bark:    "#1C1510",
        ember:   "#2A1F16",
        ash:     "#3D2E22",
        gold:    "#C9A87A",
        "gold-lt": "#DEC49A",
        "gold-dk": "#A8895F",
        cream:   "#F5EDDF",
        fog:     "#A89880",
        dusk:    "#6B5A48",
      },
      backgroundImage: {
        // Subtle radial glow — use as bg on hero sections
        "glow-gold": "radial-gradient(ellipse at 50% 50%, rgba(201,168,122,0.12) 0%, transparent 65%)",
        "glow-top":  "radial-gradient(ellipse at 50% 0%, rgba(201,168,122,0.1) 0%, transparent 60%)",
      },
      borderColor: {
        DEFAULT: "#3D2E22",
        gold:    "rgba(201, 168, 122, 0.3)",
        "gold-strong": "rgba(201, 168, 122, 0.6)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        "glow-sm": "0 0 20px rgba(201,168,122,0.08)",
        "glow-md": "0 0 40px rgba(201,168,122,0.12)",
        "glow-lg": "0 0 80px rgba(201,168,122,0.15)",
        "card":    "0 2px 16px rgba(0,0,0,0.4)",
      },
      animation: {
        flicker: "flicker 2.5s ease-in-out infinite",
        "fade-up": "fadeUp 0.5s ease forwards",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "1", transform: "scaleX(1) scaleY(1)" },
          "50%":      { opacity: "0.88", transform: "scaleX(0.93) scaleY(1.06)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
