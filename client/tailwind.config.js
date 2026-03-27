/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],

  theme: {
    extend: {
      colors: {
        /* Brand palette */
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        /* Sidebar / dark chrome */
        surface: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        /* Luxury public palette */
        cream: {
          50:  '#fdfcfa',
          100: '#faf8f5',
          200: '#f4ede3',
          300: '#e8d9c8',
          400: '#d5b99a',
        },
        gold: {
          300: '#d4a96a',
          400: '#c49550',
          500: '#b8843a',
          600: '#9e6f2d',
          700: '#7d5620',
        },
        navy: {
          800: '#0f1923',
          900: '#080f18',
        },
        /* Lead / pipeline status colors */
        status: {
          new:        '#6366f1', /* indigo */
          contacted:  '#f59e0b', /* amber */
          qualified:  '#3b82f6', /* blue */
          proposal:   '#8b5cf6', /* violet */
          negotiation:'#ec4899', /* pink */
          won:        '#22c55e', /* green */
          lost:       '#ef4444', /* red */
        },
      },

      fontFamily: {
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
        serif:   ['"Playfair Display"', 'Georgia', 'serif'],
        mono:    ['DM Mono', 'monospace'],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      },

      borderRadius: {
        '4xl': '2rem',
      },

      boxShadow: {
        card:  '0 1px 3px 0 rgb(0 0 0 / .1), 0 1px 2px -1px rgb(0 0 0 / .1)',
        panel: '0 4px 6px -1px rgb(0 0 0 / .07), 0 2px 4px -2px rgb(0 0 0 / .07)',
        modal: '0 20px 25px -5px rgb(0 0 0 / .15), 0 8px 10px -6px rgb(0 0 0 / .15)',
      },

      animation: {
        'fade-in':    'fadeIn 0.2s ease-in-out',
        'slide-in':   'slideIn 0.25s ease-out',
        'slide-up':   'slideUp 0.25s ease-out',
        'spin-slow':  'spin 2s linear infinite',
      },

      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%':   { transform: 'translateX(-8px)', opacity: '0' },
          '100%': { transform: 'translateX(0)',    opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',   opacity: '1' },
        },
      },

      screens: {
        '3xl': '1920px',
      },
    },
  },

  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class', /* no afecta estilos globales */
    }),
    require('@tailwindcss/typography'),
  ],
};
