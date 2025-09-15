/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Ensure our custom theme colors are always included
    'bg-opportunity-50', 'bg-opportunity-500', 'bg-opportunity-600',
    'text-opportunity-50', 'text-opportunity-500', 'text-opportunity-600',
    'bg-product-50', 'bg-product-600', 'bg-product-700',
    'text-product-50', 'text-product-600', 'text-product-700',
    'bg-data-asset-50', 'bg-data-asset-600', 'bg-data-asset-700',
    'text-data-asset-50', 'text-data-asset-600', 'text-data-asset-700',
    'bg-data-source-50', 'bg-data-source-600', 'bg-data-source-700',
    'text-data-source-50', 'text-data-source-600', 'text-data-source-700',
  ],
  theme: {
    extend: {
      colors: {
        // Node type colors
        opportunity: {
          50: '#fef3e2',   // subtle
          500: '#f59e42',  // base
          600: '#ea580c',  // emphasis
        },
        product: {
          50: '#ede9fe',   // subtle
          600: '#7c3aed',  // base
          700: '#6d28d9',  // emphasis
        },
        'data-asset': {
          50: '#dbeafe',   // subtle
          600: '#2563eb',  // base
          700: '#1d4ed8',  // emphasis
        },
        'data-source': {
          50: '#d1fae5',   // subtle
          600: '#059669',  // base
          700: '#047857',  // emphasis
        },
      },
    },
  },
  plugins: [
    // Custom utilities
    function({ addUtilities }) {
      const newUtilities = {
        '.hide-scrollbar': {
          /* Chrome, Safari and Opera */
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          /* IE, Edge and Firefox */
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          'scroll-behavior': 'smooth',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}

