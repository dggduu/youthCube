/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/App.jsx",
    "./src/**/*.{js,jsx,ts,tsx}",
    "*.js"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}
