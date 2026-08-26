/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        poke: {
          red: '#EE1515',
          darkred: '#CC0000',
          blue: '#2A75BB',
          yellow: '#FFCB05',
          gold: '#C7A008',
          dark: '#1D2C5E'
        }
      },
      fontFamily: {
        pokemon: ['PokemonSolid', 'Righteous', 'sans-serif'],
        arcade: ['"Press Start 2P"', 'monospace'],
        display: ['Righteous', 'cursive', 'sans-serif'],
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pokeball-wobble': 'wobble 0.8s ease-in-out infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        wobble: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-20deg)' },
          '75%': { transform: 'rotate(20deg)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(255, 203, 5, 0.3)' },
          '100%': { boxShadow: '0 0 35px rgba(255, 203, 5, 0.8), 0 0 10px rgba(238, 21, 21, 0.5)' },
        }
      }
    },
  },
  plugins: [],
}
