/**
 * Дизайн-токены сайта. Подключаются в src/styles/globals.css через @config.
 *
 * Палитра «перламутр и ампула»: холодный перламутровый фон, баклажановый
 * тёмный цвет вместо чёрного и четыре пастельных оттенка — по одному на
 * каждую категорию процедур (цвет на сайте всегда означает категорию).
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        porcelain: "#F4F3F6",
        pearl: "#FFFFFF",
        ink: {
          DEFAULT: "#2A2130",
          soft: "#3B3042",
        },
        smoke: "#655C6B",
        mauve: {
          DEFAULT: "#86637F",
          light: "#C9B6C5",
        },
        line: "#E2DEE6",
        // Категории процедур
        powder: { DEFAULT: "#F4E1E2", deep: "#94545C" }, // инъекционная
        lilac: { DEFAULT: "#E7E3F2", deep: "#625793" }, // аппаратная
        aloe: { DEFAULT: "#DEEAE1", deep: "#46705A" }, // уход
        ice: { DEFAULT: "#DEE8F1", deep: "#466A8C" }, // лазер
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Классическая типографская шкала (Bringhurst): 14 16 18 21 24 36 48 60 72
        "2xs": ["0.75rem", { lineHeight: "1.1rem" }],
        sm: ["0.875rem", { lineHeight: "1.35rem" }],
        base: ["1rem", { lineHeight: "1.6rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.3125rem", { lineHeight: "1.9rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["2.25rem", { lineHeight: "2.6rem" }],
        "4xl": ["3rem", { lineHeight: "3.3rem" }],
        "5xl": ["3.75rem", { lineHeight: "4rem" }],
        "6xl": ["4.5rem", { lineHeight: "4.7rem" }],
      },
      borderRadius: {
        panel: "1.75rem",
      },
      maxWidth: {
        site: "76rem",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.35s ease-out both",
        "fade-in": "fade-in 0.25s ease-out both",
      },
    },
  },
};
