/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff8ed",
          100: "#ffefd4",
          200: "#ffdba8",
          300: "#ffc170",
          400: "#ff9d37",
          500: "#ff8210",
          600: "#f06606",
          700: "#c74c07",
          800: "#9e3c0e",
          900: "#7f340f",
          950: "#451a05",
        },
        leaf: {
          50: "#f0faf3",
          100: "#dcf3e3",
          200: "#bbe6ca",
          300: "#8dd2a8",
          400: "#58b67f",
          500: "#339a5f",
          600: "#247b4a",
          700: "#1f633d",
          800: "#1d4f33",
          900: "#1a412c",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Noto Sans",
          "Noto Sans Devanagari",
          "sans-serif",
        ],
      },
      boxShadow: { soft: "0 2px 14px -2px rgb(60 40 20 / 0.12)" },
    },
  },
  plugins: [],
};
