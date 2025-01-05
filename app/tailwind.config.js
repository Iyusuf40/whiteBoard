/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./static/**/*.{html,js}",
    "node_modules/preline/dist/*.js",
  ],
  theme: {
    extend: {
      colors: {
        customGray: 'rgba(160, 169, 161, 0.9)', // Define your custom color here
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('preline/plugin'),
  ],
}
