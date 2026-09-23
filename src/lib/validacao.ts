import { z } from "zod";
import { OCASIOES } from "./formularios";

// Validação do Formulário 1 no SERVIDOR (nunca confiar só no navegador).
// Os limites de adultos/crianças são passados dinamicamente (configuráveis).

export function schemaSolicitacao(maxAdultos: number, maxCriancas: number) {
  return z
    .object({
      nome: z.string().trim().min(2, "Informe o nome completo."),
      whatsapp: z
        .string()
        .trim()
        .min(8, "Informe um WhatsApp válido com DDD."),
      dataEvento: z.string().min(1, "Selecione a data do evento."),
      ocasiao: z.enum(OCASIOES, {
        errorMap: () => ({ message: "Selecione a ocasião." }),
      }),
      ocasiaoOutro: z.string().trim().optional(),
      numAdultos: z
        .number({ invalid_type_error: "Informe o número de adultos." })
        .int("Use um número inteiro.")
        .min(1, "Informe ao menos 1 adulto.")
        .max(maxAdultos, `Nosso limite é de ${maxAdultos} adultos`),
      temCriancas: z.boolean(),
      numCriancas: z
        .number()
        .int("Use um número inteiro.")
        .min(1)
        .max(maxCriancas)
        .optional(),
      temRestricoes: z.boolean(),
      restricoesDetalhe: z.string().trim().optional(),
      temChurrasqueira: z.boolean(),
      endereco: z.string().trim().min(8, "Informe o endereço completo do evento."),
    })
    .superRefine((val, ctx) => {
      // "Outro" exige detalhamento da ocasião
      if (val.ocasiao === "Outro" && !val.ocasiaoOutro) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["ocasiaoOutro"],
          message: "Qual é a ocasião do evento?",
        });
      }
      // Se há crianças, a quantidade é obrigatória
      if (val.temCriancas && (val.numCriancas === undefined || val.numCriancas < 1)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["numCriancas"],
          message: "Informe quantas crianças.",
        });
      }
      // Se há restrições, o detalhamento é obrigatório
      if (val.temRestricoes && !val.restricoesDetalhe) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["restricoesDetalhe"],
          message: "Descreva as restrições alimentares.",
        });
      }
    });
}

export type DadosSolicitacao = z.infer<ReturnType<typeof schemaSolicitacao>>;
