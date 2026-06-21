import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'ex-bg': '#000000',
        'ex-text': '#FFFFFF',
        'ex-pink': '#FF00BB',
        'ex-blue': '#3700FF',
        'ex-admin': '#0A0A0A',
      },
      fontFamily: {
        sans: ['var(--font-archivo)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
