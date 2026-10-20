/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        "lime-vc": "#c8e66a",
        "ink-vc": "#1f2d0a",
      },
    },
  },
  plugins: [],
};
