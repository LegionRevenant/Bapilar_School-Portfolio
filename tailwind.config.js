/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      animation: {
        'water-flow': 'flow 3s ease-in-out infinite',
        'flash-bg': 'flash-bg 1s steps(2, start) infinite',
      },
      keyframes: {
        flow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'flash-bg': {
          '0%, 100%': { backgroundColor: '#dc2626' },
          '50%': { backgroundColor: '#b91c1c' },     
        },
      }
    },
  },
  plugins: [],
}
