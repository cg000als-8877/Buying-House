import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "var(--background)",
          secondary: "var(--background-secondary)",
        },
        foreground: {
          DEFAULT: "var(--foreground)",
          secondary: "var(--foreground-secondary)",
          inverse: "var(--foreground-inverse)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          muted: "var(--surface-muted)",
          elevated: "var(--surface-elevated)",
        },
        card: {
          DEFAULT: "var(--card)",
          hover: "var(--card-hover)",
        },
        border: {
          DEFAULT: "var(--border)",
          subtle: "var(--border-subtle)",
          strong: "var(--border-strong)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          hover: "var(--secondary-hover)",
          foreground: "var(--secondary-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          foreground: "var(--accent-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        success: {
          DEFAULT: "var(--success)",
          subtle: "var(--success-subtle)",
          border: "var(--success-border)",
          foreground: "var(--success-foreground)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          subtle: "var(--warning-subtle)",
          border: "var(--warning-border)",
          foreground: "var(--warning-foreground)",
        },
        error: {
          DEFAULT: "var(--error)",
          subtle: "var(--error-subtle)",
          border: "var(--error-border)",
          foreground: "var(--error-foreground)",
        },
        info: {
          DEFAULT: "var(--info)",
          subtle: "var(--info-subtle)",
          border: "var(--info-border)",
          foreground: "var(--info-foreground)",
        },
        ring: "var(--ring)",
        disabled: "var(--disabled)",
        selected: "var(--selected)",
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        body: ["var(--font-manrope)", "-apple-system", "sans-serif"],
        heading: ["var(--font-manrope)", "-apple-system", "sans-serif"],
        display: ["var(--font-manrope)", "-apple-system", "sans-serif"],
        mono: ["var(--font-manrope)", "-apple-system", "sans-serif"],
        manrope: ["var(--font-manrope)", "-apple-system", "sans-serif"],
        roboto: ["var(--font-manrope)", "-apple-system", "sans-serif"],
        montserrat: ["var(--font-manrope)", "-apple-system", "sans-serif"],
        serif: ["var(--font-manrope)", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        none: "0px",
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius-md)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        pill: "9999px",
        full: "9999px",
      },
      boxShadow: {
        none: "none",
        subtle: "var(--shadow-subtle)",
        medium: "var(--shadow-medium)",
        elevated: "var(--shadow-elevated)",
      },
      spacing: {
        "section-sm": "3rem",
        "section": "5rem",
        "section-lg": "7.5rem",
      },
      transitionDuration: {
        fast: "150ms",
        normal: "250ms",
        slow: "350ms",
      },
      transitionTimingFunction: {
        corporate: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
