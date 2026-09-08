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
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#f0f7f6",
          100: "#d9ebe8",
          200: "#b5d8d3",
          300: "#86bdb6",
          400: "#5ba097",
          500: "#3e847c",
          600: "#2f6b64",
          700: "#275551",
          800: "#224542",
          900: "#1b3534",
          950: "#0b1c1c",
        },
        gold: {
          400: "#f0c975",
          500: "#d4a343",
          600: "#b3802e",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
