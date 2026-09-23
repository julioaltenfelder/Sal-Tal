import type { Config } from "tailwindcss";

/**
 * Paleta da marca SAL & TAL (alinhada à apresentação/Gamma):
 * - carvão / preto: seções escuras
 * - creme: seções claras e sofisticadas
 * - vinho / bordô: cor de destaque (botões, ícones, selos) — tom quente,
 *   discreto e premium, no lugar do alaranjado.
 * - tinta: tipografia escura sobre fundo creme.
 *
 * Obs.: o token `brasa` é mantido como ALIAS de `vinho` para compatibilidade
 * com classes já existentes; ambos apontam para os mesmos tons de bordô.
 */
const vinho = {
  DEFAULT: "#7d1f1d",
  claro: "#9b302c",
  escuro: "#5a1513",
  profundo: "#3d0f0e",
  suave: "#c98b7f",
};

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        carvao: {
          DEFAULT: "#100f0d",
          claro: "#1a1815",
          medio: "#25221e",
          borda: "#332f29",
        },
        vinho,
        brasa: vinho, // alias de compatibilidade
        creme: {
          DEFAULT: "#f6efe1",
          card: "#ede1ce",
          borda: "#e2d5bf",
        },
        tinta: {
          DEFAULT: "#2a2420",
          suave: "#6d6155",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      boxShadow: {
        vinho: "0 10px 40px -12px rgba(125, 31, 29, 0.45)",
        brasa: "0 10px 40px -12px rgba(125, 31, 29, 0.45)",
        cartao: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px -12px rgba(42,36,32,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
