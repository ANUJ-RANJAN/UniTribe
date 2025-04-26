/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary brand colors - Enhanced with more vibrant blues
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49",
        },
        // Secondary brand colors - Enhanced with more vibrant purples
        secondary: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7e22ce",
          800: "#6b21a8",
          900: "#581c87",
          950: "#3b0764",
        },
        // Accent colors - Shifted to teal for better contrast with primary/secondary
        accent: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
          950: "#042f2e",
        },
        // Neutral colors - Improved for better contrast and readability
        neutral: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0a0a0a",
        },
        // Semantic colors - Enhanced for better accessibility
        success: "#10b981", // Emerald green
        warning: "#f59e0b", // Amber
        error: "#ef4444", // Red
        info: "#3b82f6", // Blue

        // New background tones for cards and sections
        surface: {
          50: "#ffffff",
          100: "#f9fafb",
          200: "#f3f4f6",
          300: "#e5e7eb",
          400: "#d1d5db",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Montserrat", "sans-serif"],
        display: ["Poppins", "sans-serif"], // Added for hero sections and large headings
      },
      borderRadius: {
        sm: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "9999px",
      },
      boxShadow: {
        soft: "0 2px 15px 0 rgba(0, 0, 0, 0.05)",
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        elevated:
          "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)",
        button: "0 2px 4px 0 rgba(0, 0, 0, 0.05)",
        dropdown: "0 4px 20px rgba(0, 0, 0, 0.08)",
        inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
        focus: "0 0 0 3px rgba(14, 165, 233, 0.35)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "pulse-subtle": "pulseSubtle 2s infinite",
        "bounce-gentle": "bounceGentle 1s infinite",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.8 },
        },
        bounceGentle: {
          "0%, 100%": { transform: "translateY(-2px)" },
          "50%": { transform: "translateY(0)" },
        },
      },
      spacing: {
        72: "18rem",
        80: "20rem",
        96: "24rem",
        128: "32rem",
      },
      maxWidth: {
        "1/4": "25%",
        "1/2": "50%",
        "3/4": "75%",
        "screen-sm": "640px",
        "screen-md": "768px",
        "screen-lg": "1024px",
        "screen-xl": "1280px",
        "screen-2xl": "1536px",
      },
      zIndex: {
        0: 0,
        10: 10,
        20: 20,
        30: 30,
        40: 40,
        50: 50,
        auto: "auto",
      },
      transitionProperty: {
        height: "height",
        spacing: "margin, padding",
      },
      scale: {
        102: "1.02",
        103: "1.03",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms")({
      strategy: "class", // Use class strategy for more customization
    }),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
  ],
};
