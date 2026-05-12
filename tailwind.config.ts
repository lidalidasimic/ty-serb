import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        paper: "#ffffff",
        coral: "#C6363C",
        mint: "#F4F4F4",
        sky: "#0C4076",
        plum: "#0C4076",
        sunflower: "#F4F4F4",
        "serbian-red": "#C6363C",
        "serbian-blue": "#0C4076",
      },
      boxShadow: {
        comic: "4px 4px 0 #111111",
        soft: "0 18px 50px rgba(17, 17, 17, 0.10)",
      },
      fontFamily: {
        sans: ["Arial", "Helvetica", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
