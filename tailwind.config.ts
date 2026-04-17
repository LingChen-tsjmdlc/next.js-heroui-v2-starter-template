import { heroui } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      maxWidth: {
        "8xl": "90rem",
        "9xl": "96rem",
        "10xl": "112rem",
        "11xl": "128rem",
        "12xl": "144rem",
        "13xl": "160rem",
        "14xl": "176rem",
        "15xl": "192rem",
        "16xl": "208rem",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      animation: {
        shine: "shine var(--duration, 2s) infinite linear",
      },
      keyframes: {
        shine: {
          "0%": { backgroundPosition: "0% 0%" },
          "50%": { backgroundPosition: "100% 100%" },
          "100%": { backgroundPosition: "0% 0%" },
        },
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};

export default config;
