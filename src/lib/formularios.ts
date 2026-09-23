// Opções e textos EXATOS dos formulários (Seção 7 do briefing).
// Não alterar enunciados nem alternativas.

export const OCASIOES = [
  "Aniversário",
  "Confraternização de empresa",
  "Churrasco em família e amigos",
  "Encontro de amantes do churrasco",
  "Outro",
] as const;

export const OPCOES_SIM_NAO = ["Não", "Sim"] as const;

export const MENSAGEM_CONCLUSAO_FORM1 =
  "Perfeito! Recebemos sua solicitação. Nossa equipe analisará os detalhes e " +
  "entrará em contato no seu WhatsApp para apresentar uma proposta personalizada. " +
  "O envio não representa uma reserva confirmada.";

// Limites padrão (também guardados no banco em Configuracao, editáveis).
export const MAX_ADULTOS_PADRAO = 30;
export const MAX_CRIANCAS_PADRAO = 30;
