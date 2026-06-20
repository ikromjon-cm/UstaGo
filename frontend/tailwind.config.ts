import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
        dark: {
          DEFAULT: "#0F172A",
          50: "#1E293B",
          100: "#1A2332",
          200: "#151C28",
          300: "#101520",
          400: "#0B0F18",
          500: "#070A10",
        },
        success: { DEFAULT: "#22C55E", light: "#DCFCE7" },
        warning: { DEFAULT: "#F59E0B", light: "#FEF3C7" },
        danger: { DEFAULT: "#EF4444", light: "#FEE2E2" },
        surface: { DEFAULT: "#F8FAFC", dark: "#0F172A" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "16px",
        sm: "8px",
        lg: "20px",
        xl: "24px",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { transform: "translateY(10px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
        slideDown: { "0%": { transform: "translateY(-10px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
        slideIn: { "0%": { transform: "translateX(100%)" }, "100%": { transform: "translateX(0)" } },
        scaleIn: { "0%": { transform: "scale(0.95)", opacity: "0" }, "100%": { transform: "scale(1)", opacity: "1" } },
      },
    },
  },
  plugins: [],
};

export default config;
