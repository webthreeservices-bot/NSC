import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './node_modules/daisyui/dist/**/*.js',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
        spotlight: {
          "0%": {
            opacity: "0",
            transform: "translate(-72%, -62%) scale(0.5)",
          },
          "100%": {
            opacity: "1",
            transform: "translate(-50%,-40%) scale(1)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: 'shimmer 2s infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        spotlight: "spotlight 2s ease .75s 1 forwards",
      },
    },
  },
  daisyui: {
    themes: [
      {
        dark: {
          "primary": "oklch(0.89 0.196 126.665)",
          "primary-content": "oklch(0.27 0.072 132.109)",
          "secondary": "oklch(0.51 0.262 276.966)",
          "secondary-content": "oklch(0.28 0.091 267.935)",
          "accent": "oklch(0.87 0.169 91.605)",
          "accent-content": "oklch(0.27 0.077 45.635)",
          "neutral": "oklch(0.44 0.03 256.802)",
          "neutral-content": "oklch(0.98 0.002 247.839)",
          "base-100": "oklch(0 0 0)",
          "base-200": "oklch(0.21 0.034 264.665)",
          "base-300": "oklch(0.90 0.182 98.111)",
          "base-content": "oklch(0.98 0.003 247.858)",
          "info": "oklch(0.54 0.245 262.881)",
          "info-content": "oklch(0.12 0.042 264.695)",
          "success": "oklch(0.64 0.2 131.684)",
          "success-content": "oklch(0.98 0.031 120.757)",
          "warning": "oklch(0.68 0.162 75.834)",
          "warning-content": "oklch(0.98 0.026 102.212)",
          "error": "oklch(0.57 0.245 27.325)",
          "error-content": "oklch(0.97 0.013 17.38)",
          "--rounded-box": "2rem",
          "--rounded-btn": "0.25rem",
          "--rounded-badge": "0.5rem",
        },
      },
    ],
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: true,
    themeRoot: ":root",
  },
  plugins: [
    require("daisyui"),
    require("@tailwindcss/typography"),
    require("tailwindcss-animate"),
  ],
} satisfies Config

export default config