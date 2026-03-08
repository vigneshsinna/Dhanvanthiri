/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        brand: {
          50: '#f2f7f5',
          100: '#d9eae2',
          200: '#b7d7c8',
          300: '#8ec0aa',
          400: '#63a688',
          500: '#42866a',
          600: '#346d56',
          700: '#2b5846',
          800: '#25473a',
          900: '#203d33',
        },
        accent: {
          50: '#fef7ec',
          100: '#fdeac9',
          200: '#fbd58e',
          300: '#f9ba4e',
          400: '#f7a325',
          500: '#f08b0d',
          600: '#d46808',
          700: '#b0480b',
          800: '#8f3810',
          900: '#762f10',
        },
        spice: {
          50: '#fdf3f3',
          100: '#fce4e4',
          200: '#fbcccc',
          300: '#f6a6a6',
          400: '#ef7272',
          500: '#e34545',
          600: '#c72828',
          700: '#a6211d',
          800: '#891f1c',
          900: '#72201e',
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0,0,0,.07), 0 10px 20px -2px rgba(0,0,0,.04)',
        'card': '0 1px 3px 0 rgba(0,0,0,.06), 0 1px 2px -1px rgba(0,0,0,.06)',
        'elevated': '0 10px 40px -10px rgba(0,0,0,.12), 0 4px 6px -2px rgba(0,0,0,.05)',
        'glow-brand': '0 0 20px rgba(52,109,86,0.3)',
        'glow-accent': '0 0 20px rgba(240,139,13,0.3)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'bounce-in': 'bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
