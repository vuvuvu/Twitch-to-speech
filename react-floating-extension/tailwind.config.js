/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./video.html",
    "./panel.html",
    "./config.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        twitch: {
          purple: '#9146FF',
          'purple-dark': '#772CE8',
          'purple-light': '#A970FF',
          dark: '#0E0E10',
          'dark-alt': '#18181B',
          'dark-light': '#1F1F23',
          'gray-light': '#EFEFF1',
          'gray-medium': '#ADADB8',
          'gray-dark': '#464649'
        },
        accent: {
          green: '#00F5FF',
          red: '#FF6B6B',
          orange: '#FFB347',
          blue: '#4ECDC4'
        }
      },
      fontFamily: {
        'twitch': ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif']
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce-subtle 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'scale-in': 'scale-in 0.2s ease-out'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(145, 70, 255, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(145, 70, 255, 0.8)' }
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'slide-down': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      },
      backdropBlur: {
        xs: '2px'
      },
      boxShadow: {
        'twitch': '0 4px 14px 0 rgba(145, 70, 255, 0.25)',
        'twitch-lg': '0 10px 25px 0 rgba(145, 70, 255, 0.35)',
        'glow': '0 0 20px rgba(145, 70, 255, 0.6)',
        'inner-glow': 'inset 0 0 10px rgba(145, 70, 255, 0.3)'
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem'
      }
    },
  },
  plugins: [],
}