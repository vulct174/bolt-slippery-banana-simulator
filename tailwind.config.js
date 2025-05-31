/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        yellow: {
          50: '#fffdf0',
          100: '#fffbe0',
          200: '#fff7c2',
          300: '#fff3a3',
          400: '#ffec75',
          500: '#ffe94c',
          600: '#ffe021',
          700: '#ffd700',
          800: '#e6c200',
          900: '#a68c00',
        },
        brown: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#c49a7c',
          600: '#a17a65',
          700: '#846358',
          800: '#5d4037',
          900: '#3e2723',
        },
        green: {
          50: '#f0fdf6',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        }
      },
      fontFamily: {
        comic: ['Comic Sans MS', 'cursive', 'sans-serif'],
      },
      boxShadow: {
        'banana': '0 4px 14px 0 rgba(255, 220, 0, 0.39)',
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
      },
    },
  },
  plugins: [],
};