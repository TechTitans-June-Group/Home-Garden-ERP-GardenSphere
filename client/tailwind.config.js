/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gs: {
          deep: '#14532D',
          primary: '#16A34A',
          emerald: '#10B981',
          light: '#DCFCE7',
          lime: '#84CC16',
          yellow: '#FACC15',
          orange: '#FB923C',
          sky: '#38BDF8',
          bg: '#F8FAF7',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 16px 40px -18px rgba(20, 83, 45, 0.28)',
        soft: '0 18px 50px -20px rgba(16, 33, 14, 0.35)',
      },
      backgroundImage: {
        'garden-radial':
          'radial-gradient(circle at top right, rgba(16,185,129,0.18), transparent 36%), radial-gradient(circle at bottom left, rgba(250,204,21,0.16), transparent 32%)',
      },
    },
  },
  plugins: [],
};
