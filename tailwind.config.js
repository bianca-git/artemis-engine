/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'glow': 'glow 2s infinite',
        'pulse-magenta': 'pulse-magenta 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 255, 255, 0.6)' },
        },
        'pulse-magenta': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(255, 0, 255, 0.4)' },
          '50%': { boxShadow: '0 0 25px rgba(255, 0, 255, 0.7)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      colors: {
        'neon-cyan': '#00ffff',
        'neon-magenta': '#ff00ff',
        'cyber-blue': '#0080ff',
        'cyber-purple': '#8000ff',
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(0, 255, 255, 0.5)',
        'neon-lg': '0 0 30px rgba(0, 255, 255, 0.7)',
        'magenta': '0 0 20px rgba(255, 0, 255, 0.5)',
        'magenta-lg': '0 0 30px rgba(255, 0, 255, 0.7)',
      },
    },
  },
  plugins: [],
};
