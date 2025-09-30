/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#000000',
        'bg-secondary': '#1a1a1a',
        'bg-tertiary': '#2a2a2a',
        'text-primary': '#ffffff',
        'text-secondary': '#b4b4b4',
        'text-tertiary': '#808080',
        'accent': '#fffc00',
        'accent-muted': '#cccc00',
        'border': '#333333',
        'hover-bg': '#2a2a2a',
        'highlight': 'rgba(255, 252, 0, 0.3)',
        'snap-purple': '#9b51e0',
      },
      fontFamily: {
        system: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Fira Sans',
          'Droid Sans',
          'Helvetica Neue',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
