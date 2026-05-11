import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172026",
        mist: "#f4f7f8",
        pine: "#126c59",
        coral: "#e36b5d",
        amber: "#d89a28"
      },
      boxShadow: {
        soft: "0 16px 50px rgba(23, 32, 38, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
