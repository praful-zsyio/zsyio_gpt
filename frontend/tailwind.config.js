/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#040b17', // Deep cosmic sky base
        surface: {
          DEFAULT: 'rgba(255, 255, 255, 0.08)',
          light: 'rgba(255, 255, 255, 0.15)',
          white: 'rgba(255, 255, 255, 0.92)',
          border: 'rgba(255, 255, 255, 0.18)',
        },
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        cyber: {
          cyan: '#38bdf8',
          blue: '#60a5fa',
          violet: '#818cf8',
          purple: '#c084fc',
          emerald: '#34d399',
          amber: '#fbbf24',
        },
      },
      boxShadow: {
        'glow-sky': '0 0 30px rgba(56, 189, 248, 0.45)',
        'glow-white': '0 0 25px rgba(255, 255, 255, 0.35)',
        'glow-subtle': '0 12px 40px 0 rgba(2, 132, 199, 0.25)',
        'frost': '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'gradient-x': 'gradientX 8s ease infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 0.7, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.03)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backgroundImage: {
        'sky-radial': 'radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.25), rgba(255, 255, 255, 0.05) 50%, transparent 80%)',
        'sky-white-mesh': 'linear-gradient(135deg, #07192f 0%, #0369a1 35%, #0284c7 65%, #bae6fd 100%)',
        'cyber-gradient': 'linear-gradient(135deg, #38bdf8 0%, #60a5fa 40%, #e0f2fe 85%, #ffffff 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(56, 189, 248, 0.08) 100%)',
      },
    },
  },
  plugins: [],
};
