module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      screens: {
        'xs': '320px',   // Extra small phones
        'sm': '640px',   // Small phones
        'md': '768px',   // Tablets
        'lg': '1024px',  // Small laptops
        'xl': '1280px',  // Desktops
        '2xl': '1536px', // Large screens
      },
      fontSize: {
        '2xs': ['0.5rem', { lineHeight: '0.75rem' }],           // 8px
        'xs': ['0.625rem', { lineHeight: '0.875rem' }],      // 10px
        'sm': ['0.75rem', { lineHeight: '1rem' }],           // 12px
        'base': ['0.875rem', { lineHeight: '1.25rem' }],     // 14px (was 16px)
        'lg': ['1rem', { lineHeight: '1.5rem' }],            // 16px
        'xl': ['1.125rem', { lineHeight: '1.75rem' }],       // 18px
        '2xl': ['1.25rem', { lineHeight: '1.75rem' }],       // 20px
        '3xl': ['1.5rem', { lineHeight: '2rem' }],           // 24px
        '4xl': ['2rem', { lineHeight: '2.5rem' }],           // 32px
        '5xl': ['2.5rem', { lineHeight: '3rem' }],           // 40px
        '6xl': ['3rem', { lineHeight: '3.5rem' }],           // 48px
      },
      spacing: {
        '2xs': '0.25rem',  // 4px
        'xs': '0.5rem',    // 8px
        'sm': '0.75rem',   // 12px
        'md': '1rem',      // 16px
        'lg': '1.5rem',    // 24px
        'xl': '2rem',      // 32px
        '2xl': '2.5rem',   // 40px
        '3xl': '3rem',     // 48px
      },
      borderRadius: {
        'xs': '0.25rem',
        'sm': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
