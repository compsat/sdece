module.exports = {
  content: ["./*.{html,js}", "./js/*.js"],
  theme: {
    fontFamily: {
      'montserrat': ['Montserrat', 'sans-serif'],
      'hind': ['Hind', 'sans-serif'],
      'garamond': ['Garamond', 'serif']
    },
    extend: {
      // Will update this to reflect colors used on Figma
      colors: {
        darkbg: '#387181',
        lightbg: '#3D97AF',
        customBlack: '#2F2F2F',
        customGray: '#A0A0A0',
        customDarkGray: '#979797',
        customMediumGray: '#F6F6F6',
        customLightGray: '#FCFCFC'
      },
    },
  },
  plugins: [],
}