/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'background': '#111827',
        'surface': 'rgba(23, 37, 51, 0.5)', // slate-800/50
        'copy': { 'primary': '#d1d5db', 'secondary': '#9ca3af' },
        'accent': { 'primary': '#00FFFF', 'secondary': '#FF00FF' },
        'feedback': { 'success': '#a3e635' },
        'border': { 'primary': '#475569' }
      },
      boxShadow: {
        'neon-cyan': '0 0 10px #00ffff, 0 0 20px #00ffff',
        'neon-magenta': '0 0 10px #FF00FF, 0 0 20px #FF00FF',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};