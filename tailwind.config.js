/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,ts,css}"
  ],
  theme: {
    extend: {
      colors: {
        fluor: "#1187d6",
        darkBlue: "#0b6da6",
        acero: "#999696",
        btn: "#bfb71b"
      },

      // animaciones personalizadas
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        fadeOut: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.95)' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.4s ease-out',
        fadeOut: 'fadeOut 0.3s ease-in',
      },
    },
  },
  plugins: [],
}
