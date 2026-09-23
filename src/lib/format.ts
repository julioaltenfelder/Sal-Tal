// Utilitários de formatação no padrão brasileiro (pt-BR, fuso de São Paulo).

const TZ = "America/Sao_Paulo";

/** Formata um valor em Real: 1250 -> "R$ 1.250,00" */
export function formatarReal(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

/** Formata data no padrão dd/mm/aaaa (fuso de São Paulo). */
export function formatarData(data: Date | string | null | undefined): string {
  if (!data) return "—";
  const d = typeof data === "string" ? new Date(data) : data;
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

/** Formata data e hora: dd/mm/aaaa às HH:mm */
export function formatarDataHora(data: Date | string | null | undefined): string {
  if (!data) return "—";
  const d = typeof data === "string" ? new Date(data) : data;
  const dataStr = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
  const horaStr = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
  return `${dataStr} às ${horaStr}`;
}

/** Converte "aaaa-mm-dd" (input date) para um Date às 12h no fuso local, evitando
 *  o deslocamento de um dia causado por UTC. */
export function dataDeInputISO(iso: string): Date {
  // Interpreta como meio-dia para não escorregar de dia por conta do fuso.
  return new Date(`${iso}T12:00:00-03:00`);
}

/** Converte um Date para "aaaa-mm-dd" (para value de <input type=date>). */
export function dataParaInputISO(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

/**
 * Interpreta um número digitado no padrão brasileiro ou simples.
 * Aceita "1.250,00", "1250,5", "1250.5" e "1250". Retorna null se vazio/inválido.
 */
export function parseNumeroBR(texto: string | null | undefined): number | null {
  if (texto === null || texto === undefined) return null;
  const limpo = String(texto).trim();
  if (!limpo) return null;
  let normalizado = limpo;
  if (limpo.includes(",")) {
    // vírgula é o separador decimal: remove pontos de milhar
    normalizado = limpo.replace(/\./g, "").replace(",", ".");
  }
  const n = Number(normalizado);
  return Number.isFinite(n) ? n : null;
}
