import type { Config } from "tailwindcss";

/**
 * Paleta da marca SAL & TAL:
 * - carvão / preto: fundos escuros
 * - branco: tipografia principal
 * - brasa: tons quentes (alaranjado e vermelho) para destaques
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        carvao: {
          DEFAULT: "#141210",
          claro: "#1f1b18",
          medio: "#2a2521",
          borda: "#3a332d",
        },
        brasa: {
          DEFAULT: "#e8541e", // alaranjado brasa
          claro: "#ff7a3d",
          escuro: "#c23a12",
          vermelho: "#b21f16",
          amarelo: "#f7a83e",
        },
        creme: "#f4ede4",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      boxShadow: {
        brasa: "0 10px 40px -10px rgba(232, 84, 30, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
