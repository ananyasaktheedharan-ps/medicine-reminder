import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#effaf6",
          100: "#d7f3e8",
          200: "#b0e6d2",
          300: "#7dd2b6",
          400: "#4ab897",
          500: "#2a9d7c",
          600: "#1e7e63",
          700: "#1a6552",
          800: "#185143",
          900: "#154338",
        },
      },
    },
  },
  plugins: [],
};

export default config;
