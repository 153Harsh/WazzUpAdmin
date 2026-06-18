/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        customGradientStart: "#ff6600", // Red with 80% opacity
        customGradientEnd: "rgba(255, 183, 77,1)", // Blue with 40% opacity
        customGradientButtonStart: "#ff6600", // Red with 80% opacity
        customGradientButtonEnd: "#ff6600", // Blue with 40% opacity
        grayBlue: '#d90166', // Define your custom color
        gray1: '#f51b47', // Define your custom color
      },
      fontFamily: {
        custom: ['Octin', 'poppins'],
      },
    },
  },
  plugins: [],
};