/** @type {import('tailwindcss').Config} */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Extending the color palette with our design system colors
      colors: {
        // Dark Theme (Default)
        'dark-bg': '#000000',
        'dark-text-primary': '#4ade80',    // green-400
        'dark-text-secondary': '#9ca3af', // gray-400
        'dark-text-command': '#facc15',    // yellow-400
        'dark-border': '#22c55e',          // green-500
        'dark-active': '#15803d',          // green-800
        'dark-error': '#f87171',           // red-400
        'dark-success': '#4ade80',         // green-400
        'dark-input-bg': '#111827',        // gray-900
        'dark-hover': 'rgba(34, 197, 94, 0.1)', // Example: green-500 with 10% opacity

        // Light Theme
        'light-bg': '#f3f4f6',             // gray-100
        'light-text-primary': '#166534',   // green-800
        'light-text-secondary': '#4b5563', // gray-600
        'light-text-command': '#ca8a04',   // yellow-600
        'light-border': '#15803d',         // green-700
        'light-active': '#dcfce7',         // green-100
        'light-error': '#dc2626',          // red-600
        'light-success': '#16a34a',        // green-600
        'light-input-bg': '#ffffff',       // white
        'light-hover': 'rgba(22, 163, 74, 0.1)', // Example: green-600 with 10% opacity
      },
      // Extending font sizes based on the design system
      fontSize: {
        'xs': '12px', // Status Labels
        'sm': '14px', // Base Text
        'base': '16px',// Command Text
        'lg': '18px', // Headers
        'xl': '20px', // Data Values
      },
      // Ensuring the font family is always monospace
      fontFamily: {
        mono: ['"Roboto Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
      },
      // Setting border radius
      borderRadius: {
        'DEFAULT': '0.25rem', // 4px
      },
    },
  },
  plugins: [],
};