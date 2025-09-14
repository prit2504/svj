/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.ejs",  // include all EJS templates
    "./public/**/*.js"   // include any frontend JS files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
