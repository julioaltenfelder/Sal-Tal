// Textos e regras da proposta (Fase 2).
// Itens incluídos/excluídos vêm da definição da marca (Seção 4 do briefing).

export const ITENS_INCLUIDOS = [
  "Compra e curadoria dos insumos",
  "Preparo completo do churrasco na brasa",
  "Apresentação e serviço aos convidados, em tábuas",
  "Limpeza da área usada pela nossa equipe",
] as const;

export const ITENS_EXCLUIDOS = [
  "Bebidas e gelo",
  "Pratos, copos e talheres",
  "Mesas e cadeiras",
] as const;

export const APRESENTACAO_EXPERIENCIA =
  "O SAL & TAL oferece uma experiência de churrasco premium a domicílio, " +
  "combinando tradição, técnica, qualidade e conveniência. Você aproveita o " +
  "evento com os convidados enquanto a nossa equipe cuida de todos os preparativos " +
  "e da execução, na brasa, do começo ao fim.";

// Percentual do sinal de garantia.
export const PERCENTUAL_SINAL = 0.5;

/** Valor do sinal de garantia (50% da proposta), arredondado a centavos. */
export function calcularSinal(valorTotal: number | null | undefined): number | null {
  if (valorTotal === null || valorTotal === undefined) return null;
  return Math.round(valorTotal * PERCENTUAL_SINAL * 100) / 100;
}

/** Nota discreta sobre o sinal, exibida na proposta e na área do cliente. */
export const NOTA_SINAL =
  "Para confirmar a sua reserva, após o preenchimento dos detalhes operacionais " +
  "do evento solicitaremos um sinal de 50% do valor, como garantia de confirmação " +
  "e cobertura dos insumos, a ser pago antes do evento. As instruções são enviadas " +
  "pela nossa equipe via WhatsApp.";

export interface ResumoCusto {
  totalInsumos: number;
  despesasVariaveis: number;
  despesasFixas: number;
  custoTotal: number;
  receita: number;
  resultadoBruto: number;
}

/**
 * Cálculo de apoio da precificação — apenas ARITMÉTICA de conferência
 * (subtotais e resultado = receita − custos). NÃO sugere preço nem quantidade;
 * a lógica de precificação é definida à parte e inserida como configuração.
 */
export function resumoCusto(dados: {
  itens: { subtotal: number }[];
  despesasVariaveis?: number | null;
  despesasFixas?: number | null;
  receita?: number | null;
}): ResumoCusto {
  const totalInsumos = dados.itens.reduce((s, i) => s + (i.subtotal || 0), 0);
  const despesasVariaveis = dados.despesasVariaveis ?? 0;
  const despesasFixas = dados.despesasFixas ?? 0;
  const receita = dados.receita ?? 0;
  const custoTotal = totalInsumos + despesasVariaveis + despesasFixas;
  return {
    totalInsumos,
    despesasVariaveis,
    despesasFixas,
    custoTotal,
    receita,
    resultadoBruto: receita - custoTotal,
  };
}

/** Uma proposta é visível ao cliente quando já foi enviada (não é rascunho/cancelada). */
export function propostaVisivelAoCliente(status: string): boolean {
  return ["ENVIADA", "VISUALIZADA", "ACEITA", "RECUSADA", "EXPIRADA"].includes(status);
}
