module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      gridTemplateColumns: {
        'table': '80px 60px 60px 1fr 1fr 1fr',
      },
      colors:{
        primary: '#222',
        secondary: '#cc0000',
      }
    },
  },
  plugins: [],
}
