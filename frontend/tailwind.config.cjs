module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* ─── Brand Ocean (Primary) ─── */
        'brand-ocean': {
          DEFAULT: '#0E2A47',
          light: '#1C4C78',
          hover: '#143A5F',
        },
        /* ─── Brand Sand (Secondary) ─── */
        'brand-sand': {
          DEFAULT: '#F4EFE6',
          light: '#FBF8F2',
          muted: '#E6DDCF',
        },
        /* ─── Brand Gold (Accent) ─── */
        'brand-gold': {
          DEFAULT: '#C8A84E',
          hover: '#B8923D',
          soft: '#E7D6A3',
        },
        /* ─── Dark Mode Base ─── */
        'brand-dark': {
          DEFAULT: '#0B1623',
          surface: '#111F2E',
          border: '#1E2D3D',
        },
        /* ─── Semantic ─── */
        'brand-success': '#2E7D32',
        'brand-error': '#C62828',
        'brand-warning': '#ED6C02',
        /* ─── Role Accents ─── */
        'role-tourist': '#0E2A47',
        'role-company': '#C8A84E',
        'role-guide': '#1F7A8C',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
