import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sammy palette — light, clinical, green→teal
        canvas: "#F6F9F8",
        surface: "#FFFFFF",
        ink: {
          900: "#0F1E1B",
          700: "#26403A",
          500: "#5A736C",
          400: "#8499927",
        },
        brand: {
          green: "#34D399",
          teal: "#14B8A6",
          deep: "#0E8A7E",
        },
        tier: {
          low: "#10B981",
          lowBg: "#ECFDF5",
          med: "#F59E0B",
          medBg: "#FFFBEB",
          high: "#F43F5E",
          highBg: "#FFF1F3",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(16,40,34,0.04), 0 8px 24px rgba(16,40,34,0.06)",
        lift: "0 2px 4px rgba(16,40,34,0.05), 0 18px 40px rgba(16,40,34,0.10)",
        glow: "0 0 0 1px rgba(20,184,166,0.18), 0 12px 32px rgba(20,184,166,0.18)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
