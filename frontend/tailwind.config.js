/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neu-bg': '#e0e0e0',
      },
      boxShadow: {
        'neu': '8px 8px 16px #bebebe, -8px -8px 16px #ffffff',
        'neu-inset': 'inset 6px 6px 12px #bebebe, inset -6px -6px 12px #ffffff',
      },
    },
  },
  plugins: [],
}
