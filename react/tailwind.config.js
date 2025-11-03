/* TailwindCSS configuration for CRA */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,html}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0f172a", // slate-900
          accent: "#0ea5e9" // sky-500
        }
      }
    }
  },
  plugins: []
};
