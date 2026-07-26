import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // `screens` previously sat at the theme root, which REPLACED Tailwind's
      // entire scale — the project had no sm/md/lg/xl at all, which is why the
      // codebase is full of desktop-first `xs:` overrides. Extending restores
      // the defaults while keeping `xs` so existing markup still works.
      screens: {
        'xs': { 'max': '700px' },
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        /** The red-pen accent. Used for marks and emphasis, never for chrome. */
        signal: {
          DEFAULT: "hsl(var(--signal))",
          foreground: "hsl(var(--signal-foreground))",
          muted: "hsl(var(--signal-muted))",
        },
        /** Hairlines and the graph-paper ruling. */
        rule: "hsl(var(--rule))",
      },
      fontFamily: {
        // Geist ships its own variable names via `GeistSans.variable`.
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Tightening as sizes grow — display type needs less leading.
        "2xs": ["0.6875rem", { lineHeight: "1.45", letterSpacing: "0.06em" }],
        xs: ["0.75rem", { lineHeight: "1.5", letterSpacing: "0.02em" }],
        sm: ["0.875rem", { lineHeight: "1.55" }],
        base: ["1rem", { lineHeight: "1.65" }],
        lg: ["1.125rem", { lineHeight: "1.7" }],
        xl: ["1.25rem", { lineHeight: "1.55" }],
        "2xl": ["1.5rem", { lineHeight: "1.35", letterSpacing: "-0.011em" }],
        "3xl": ["1.875rem", { lineHeight: "1.25", letterSpacing: "-0.016em" }],
        "4xl": ["2.25rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "5xl": ["3rem", { lineHeight: "1.08", letterSpacing: "-0.024em" }],
        "6xl": ["3.75rem", { lineHeight: "1.04", letterSpacing: "-0.028em" }],
        "7xl": ["4.5rem", { lineHeight: "1", letterSpacing: "-0.032em" }],
      },
      maxWidth: {
        /** Comfortable reading measure for article prose. */
        prose: "68ch",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        '5': 'rgba(0, 0, 0, 0.14) 0px 2px 5px',
        /** Soft and diffuse — modern surfaces suggest depth, they don't stamp it. */
        paper: "0 1px 2px hsl(var(--ink-shadow) / 0.04), 0 2px 8px hsl(var(--ink-shadow) / 0.04)",
        lifted: "0 4px 12px hsl(var(--ink-shadow) / 0.06), 0 16px 40px hsl(var(--ink-shadow) / 0.10)",
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
        "rise": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "rise": "rise 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
