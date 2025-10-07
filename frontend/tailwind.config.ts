import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          pink: '#FF006E',
          cyan: '#00F0FF',
          yellow: '#FFFF00',
          purple: '#B000FF',
          green: '#00FF41',
          orange: '#FF6B00',
          blue: '#0080FF',
        },
        dark: {
          bg: '#0A0E17',
          surface: '#131824',
          card: '#1A1F2E',
        },
      },
      fontFamily: {
        inter: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        poppins: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        cyber: ['Orbitron', 'monospace'],
        mono: ['"Roboto Mono"', 'monospace'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(180deg, rgba(11,15,25,0.85), rgba(11,15,25,0.6))',
        'radial-neon': 'radial-gradient(800px 400px at 20% -10%, rgba(139,92,246,0.45), transparent 60%), radial-gradient(700px 350px at 110% 10%, rgba(6,182,212,0.4), transparent 55%)',
      },
      keyframes: {
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        neonPulse: {
          '0%, 100%': { opacity: '1', textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor' },
          '50%': { opacity: '0.8', textShadow: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '41.99%': { opacity: '1' },
          '42%': { opacity: '0.6' },
          '43%': { opacity: '1' },
          '45.99%': { opacity: '1' },
          '46%': { opacity: '0.4' },
          '46.5%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        typing: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
      },
      animation: {
        glitch: 'glitch 0.3s ease-in-out infinite',
        scan: 'scan 3s linear infinite',
        neonPulse: 'neonPulse 2s ease-in-out infinite',
        flicker: 'flicker 3s linear infinite',
        float: 'float 6s ease-in-out infinite',
        typing: 'typing 3s steps(30, end) 1 both',
      },
    },
  },
  plugins: [],
} satisfies Config


