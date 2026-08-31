/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        atsuete: '#C1440E',
        'atsuete-dark': '#A03408',
        palayok: '#5C3A21',
        'palayok-dark': '#3D2514',
        'banana-leaf': '#4B6043',
        'banana-leaf-light': '#EBF2EA',
        kanin: '#F7F1E3',
        banig: '#E8D9B5',
        'banig-dark': '#D4C299',
        uling: '#2B2118',
        'uling-light': '#4A3B2C',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'Fraunces', 'serif'],
        body: ['Figtree', 'Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'karinderya': '0 4px 20px -2px rgba(43, 33, 24, 0.08), 0 2px 6px -1px rgba(43, 33, 24, 0.04)',
        'karinderya-lg': '0 10px 30px -4px rgba(43, 33, 24, 0.12), 0 4px 10px -2px rgba(43, 33, 24, 0.06)',
      }
    },
  },
  plugins: [],
}
