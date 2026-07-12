import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      /* ─── Brand Colors ────────────────────────────────────── */
      colors: {
        primary: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        secondary: {
          50:  "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065",
        },
        accent: {
          50:  "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
          950: "#083344",
        },
      },

      /* ─── Typography ──────────────────────────────────────── */
      fontFamily: {
        sans:    ["Inter", "system-ui", "sans-serif"],
        display: ["Outfit", "Inter", "sans-serif"],
        mono:    ["JetBrains Mono", "Fira Code", "monospace"],
      },

      /* ─── Spacing & Sizing ────────────────────────────────── */
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },

      /* ─── Border Radius ───────────────────────────────────── */
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
        lg:    "0.75rem",
        md:    "0.625rem",
        sm:    "0.375rem",
      },

      /* ─── Box Shadows ─────────────────────────────────────── */
      boxShadow: {
        "glow-primary": "0 0 24px 0 rgb(99 102 241 / 0.25)",
        "glow-accent":  "0 0 24px 0 rgb(6 182 212 / 0.25)",
        "glow-sm":      "0 0 12px 0 rgb(99 102 241 / 0.15)",
        "card":         "0 1px 3px 0 rgb(0 0 0 / 0.05), 0 4px 16px -2px rgb(0 0 0 / 0.06)",
        "card-hover":   "0 4px 24px -4px rgb(0 0 0 / 0.12), 0 8px 40px -8px rgb(0 0 0 / 0.08)",
      },

      /* ─── Animations ──────────────────────────────────────── */
      keyframes: {
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-10px)" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundSize: "200% 200%", backgroundPosition: "left center" },
          "50%":      { backgroundSize: "200% 200%", backgroundPosition: "right center" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgb(99 102 241 / 0.4)" },
          "50%":      { boxShadow: "0 0 0 12px rgb(99 102 241 / 0)" },
        },
      },
      animation: {
        shimmer:       "shimmer 2.5s linear infinite",
        float:         "float 4s ease-in-out infinite",
        "gradient-x":  "gradient-x 8s ease infinite",
        "fade-in-up":  "fade-in-up 0.5s ease-out both",
        "pulse-glow":  "pulse-glow 2s ease-in-out infinite",
      },

      /* ─── Background Image ────────────────────────────────── */
      backgroundImage: {
        "gradient-radial":   "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "mesh-primary":
          "radial-gradient(at 40% 20%, rgb(99 102 241 / 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgb(139 92 246 / 0.12) 0px, transparent 50%), radial-gradient(at 0% 50%, rgb(6 182 212 / 0.10) 0px, transparent 50%)",
      },
    },
  },
  plugins: [],
};

export default config;
