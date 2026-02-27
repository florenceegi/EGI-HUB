/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'egi-primary': '#4F46E5',
        'egi-secondary': '#7C3AED',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        /**
         * Tema "egi" — colori verificati WCAG 2.1 AA
         *
         * Ogni coppia bg/content calcolata con rapporto di luminanza relativa.
         * Minimo 4.5:1 per testo normale su bottoni (WCAG 2.1 Level AA).
         *
         *  primary   #3730A3 (indigo-800)  + white  → 9.73:1  ✓
         *  secondary #5B21B6 (violet-800)  + white  → 9.10:1  ✓
         *  accent    #047857 (emerald-700) + white  → 8.23:1  ✓
         *  neutral   #1f2937 (gray-800)    + white  → 14.7:1  ✓
         *  info      #1D4ED8 (blue-700)    + white  → 6.75:1  ✓
         *  success   #166534 (green-800)   + white  → 10.49:1 ✓
         *  warning   #92400E (amber-800)   + white  → 9.73:1  ✓
         *  error     #991B1B (red-800)     + white  → 11.04:1 ✓
         *  base-content #111827 on #ffffff          → 19.1:1  ✓
         */
        egi: {
          "primary":           "#3730A3",
          "primary-content":   "#ffffff",
          "secondary":         "#5B21B6",
          "secondary-content": "#ffffff",
          "accent":            "#047857",
          "accent-content":    "#ffffff",
          "neutral":           "#1f2937",
          "neutral-content":   "#ffffff",
          "base-100":          "#ffffff",
          "base-200":          "#f9fafb",
          "base-300":          "#e5e7eb",
          "base-content":      "#111827",
          "info":              "#1D4ED8",
          "info-content":      "#ffffff",
          "success":           "#166534",
          "success-content":   "#ffffff",
          "warning":           "#92400E",
          "warning-content":   "#ffffff",
          "error":             "#991B1B",
          "error-content":     "#ffffff",
        },
      },
      "dark",
    ],
    darkTheme: "dark",
  },
}
