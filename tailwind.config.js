/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neutral backgrounds & text
        background: '#111827',
        surface: 'rgba(23, 37, 51, 0.5)',
        copy: { primary: '#d1d5db', secondary: '#9ca3af' },
        // Vibrant accents
        accent: { primary: '#4DE5FF', secondary: '#FF4D8F' },
        feedback: { success: '#A3E635' },
        border: { primary: '#475569' }
      },
      boxShadow: {
        neonCyan: '0 0 10px #4DE5FF, 0 0 20px #4DE5FF',
        neonMagenta: '0 0 10px #FF4D8F, 0 0 20px #FF4D8F',
        neonGradient: '0 0 20px #7F00FF, 0 0 40px #E100FF'
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(to right, #4DE5FF, #FF4D8F)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};