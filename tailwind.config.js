const {nextui} = require("@nextui-org/react");


/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    

  ],
  theme: {
   
    fontFamily: {
      'sans': ['Poppins', 'sans-serif'],
      'anton': ['Anton', 'sans-serif'],
      // You can include other font families here if needed.
    },
    backgroundImage: theme => ({
      'gradient-purple': 'linear-gradient(97deg, rgba(103,29,110,1) 0%, rgba(144,44,152,1) 100%)',
    }),
    extend: {
      colors:{
        primary:"#833589",
        secondary:"#f3ad00",
        

       },
    },
  },
  plugins: [nextui()],
}

