import tailwindcssAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-canvas)',
        cream: 'var(--color-cream)',
        ivory: 'var(--color-ivory)',
        lavender: 'var(--color-lavender)',
        brand: {
          DEFAULT: 'rgb(var(--rgb-brand) / <alpha-value>)',
          hover: 'var(--color-brand-hover)',
          muted: 'var(--color-brand-muted)',
        },
        plum: 'rgb(var(--rgb-plum) / <alpha-value>)',
        ink: {
          DEFAULT: 'rgb(var(--rgb-ink) / <alpha-value>)',
          soft: 'var(--color-accent-hover)',
        },
        sidebar: 'var(--color-sidebar)',
        signal: {
          lime: 'rgb(var(--rgb-signal-lime) / <alpha-value>)',
          amber: 'rgb(var(--rgb-signal-amber) / <alpha-value>)',
        },
        gold: {
          DEFAULT: 'rgb(var(--rgb-gold) / <alpha-value>)',
          muted: 'var(--color-gold-muted)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          elevated: 'var(--color-surface-elevated)',
          muted: 'rgb(var(--rgb-surface-muted) / <alpha-value>)',
        },
        border: {
          DEFAULT: 'rgb(var(--rgb-border) / <alpha-value>)',
          strong: 'rgb(var(--rgb-border-strong) / <alpha-value>)',
        },
        content: {
          DEFAULT: 'rgb(var(--rgb-content) / <alpha-value>)',
          muted: 'rgb(var(--rgb-content-muted) / <alpha-value>)',
          inverse: 'var(--color-content-inverse)',
        },
        accent: {
          DEFAULT: 'rgb(var(--rgb-accent) / <alpha-value>)',
          hover: 'var(--color-accent-hover)',
          muted: 'rgb(var(--rgb-accent-muted) / <alpha-value>)',
        },
        success: {
          DEFAULT: 'rgb(var(--rgb-success) / <alpha-value>)',
          muted: 'var(--color-success-muted)',
        },
        warning: {
          DEFAULT: 'rgb(var(--rgb-warning) / <alpha-value>)',
          muted: 'var(--color-warning-muted)',
        },
        danger: {
          DEFAULT: 'rgb(var(--rgb-danger) / <alpha-value>)',
          muted: 'var(--color-danger-muted)',
        },
        /* shadcn/ui semantic aliases — same tokens, so generated components match the POS theme */
        background: 'var(--color-surface)',
        foreground: 'var(--color-content)',
        primary: {
          DEFAULT: 'rgb(var(--rgb-accent) / <alpha-value>)',
          foreground: 'var(--color-content-inverse)',
        },
        secondary: {
          DEFAULT: 'var(--color-surface-muted)',
          foreground: 'var(--color-content)',
        },
        muted: {
          DEFAULT: 'var(--color-surface-muted)',
          foreground: 'var(--color-content-muted)',
        },
        destructive: {
          DEFAULT: 'rgb(var(--rgb-danger) / <alpha-value>)',
          foreground: 'var(--color-content-inverse)',
        },
        card: {
          DEFAULT: 'var(--color-surface)',
          foreground: 'rgb(var(--rgb-content) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'var(--color-surface)',
          foreground: 'rgb(var(--rgb-content) / <alpha-value>)',
        },
        ring: 'rgb(var(--rgb-accent) / <alpha-value>)',
        input: 'rgb(var(--rgb-border) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      spacing: {
        shell: 'var(--spacing-shell)',
        sidebar: 'var(--spacing-sidebar)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius-default)',
        lg: 'var(--radius-lg)',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
