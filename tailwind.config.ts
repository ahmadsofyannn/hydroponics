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
        hydro: {
          forest: '#1B4D3E',   // Hijau Daun Utama
          sage: '#E8F5E9',     // Hijau Muda Background Card / Badge
          slate: '#334155',    // Warna Teks
          water: '#0284C7',    // Aksen Nutrisi / Air
        }
      }
    },
  },
  plugins: [],
};
export default config;