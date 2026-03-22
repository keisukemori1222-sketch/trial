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
        navy: {
          DEFAULT: "#1B2A4A",
          50: "#E8EBF0",
          100: "#D1D7E1",
          200: "#A3AFC3",
          300: "#7587A5",
          400: "#485F87",
          500: "#1B2A4A",
          600: "#16223B",
          700: "#101A2D",
          800: "#0B111E",
          900: "#05090F",
        },
        gold: {
          DEFAULT: "#C5A55A",
          50: "#F9F5EB",
          100: "#F3EBD7",
          200: "#E7D7AF",
          300: "#DBC387",
          400: "#D0B46E",
          500: "#C5A55A",
          600: "#A88A3E",
          700: "#7E6830",
          800: "#544621",
          900: "#2A2311",
        },
        teal: {
          DEFAULT: "#2A7B88",
          50: "#E8F4F6",
          100: "#D1E9ED",
          200: "#A3D3DB",
          300: "#75BDC9",
          400: "#47A7B7",
          500: "#2A7B88",
          600: "#22636D",
          700: "#194A52",
          800: "#113237",
          900: "#08191B",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
