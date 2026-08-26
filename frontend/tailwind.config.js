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
        pokemon: ['PokemonSolid', 'sans-serif']
      }
    },
  },
  plugins: [],
}
