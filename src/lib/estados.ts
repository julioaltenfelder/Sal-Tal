// Estados do ciclo de vida da jornada (valores controlados no código).
// SQLite guarda como texto; aqui garantimos os valores válidos e os rótulos
// legíveis para exibição.

export const STATUS_SOLICITACAO = {
  NOVO: "Novo orçamento",
  PROPOSTA_EM_ELABORACAO: "Proposta em elaboração",
  PROPOSTA_ENVIADA: "Proposta enviada",
  ACEITA: "Aceita",
  RECUSADA: "Recusada",
  EXPIRADA: "Expirada",
  CANCELADA: "Cancelada",
} as const;

export const STATUS_PROPOSTA = {
  RASCUNHO: "Rascunho",
  ENVIADA: "Enviada",
  VISUALIZADA: "Visualizada",
  ACEITA: "Aceita",
  RECUSADA: "Recusada",
  EXPIRADA: "Expirada",
  CANCELADA: "Cancelada",
} as const;

export const STATUS_EVENTO = {
  AGUARDANDO_FORM2: "Aguardando Formulário 2",
  FORM2_PREENCHIDO: "Formulário 2 preenchido",
  AGUARDANDO_SINAL: "Aguardando sinal (50%)",
  CONFIRMADO: "Contratação confirmada",
  EM_PREPARACAO: "Em preparação",
  EXECUTADO: "Executado",
  ENCERRADO: "Encerrado",
  CANCELADO: "Cancelado",
} as const;

export const STATUS_SINAL = {
  PENDENTE: "Pendente",
  RECEBIDO: "Recebido",
} as const;

export type StatusSolicitacao = keyof typeof STATUS_SOLICITACAO;
export type StatusProposta = keyof typeof STATUS_PROPOSTA;

/** Rótulo legível para um status de proposta. */
export function rotuloStatusProposta(status: string): string {
  return STATUS_PROPOSTA[status as StatusProposta] ?? status;
}

/** Classe de cor (Tailwind) para o selo de status de proposta. */
export function corStatusProposta(status: string): string {
  switch (status) {
    case "RASCUNHO":
      return "bg-white/5 text-white/60 border border-white/10";
    case "ENVIADA":
    case "VISUALIZADA":
      return "bg-amber-500/15 text-amber-300 border border-amber-500/30";
    case "ACEITA":
      return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30";
    case "RECUSADA":
    case "EXPIRADA":
    case "CANCELADA":
      return "bg-white/5 text-white/50 border border-white/10";
    default:
      return "bg-white/5 text-white/60 border border-white/10";
  }
}

/** Rótulo legível para um status de solicitação. */
export function rotuloStatusSolicitacao(status: string): string {
  return STATUS_SOLICITACAO[status as StatusSolicitacao] ?? status;
}

/** Classe de cor (Tailwind) para o "selo" de status de solicitação. */
export function corStatusSolicitacao(status: string): string {
  switch (status) {
    case "NOVO":
      return "bg-brasa/20 text-brasa-claro border border-brasa/40";
    case "PROPOSTA_EM_ELABORACAO":
    case "PROPOSTA_ENVIADA":
      return "bg-amber-500/15 text-amber-300 border border-amber-500/30";
    case "ACEITA":
      return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30";
    case "RECUSADA":
    case "EXPIRADA":
    case "CANCELADA":
      return "bg-white/5 text-white/50 border border-white/10";
    default:
      return "bg-white/5 text-white/60 border border-white/10";
  }
}
