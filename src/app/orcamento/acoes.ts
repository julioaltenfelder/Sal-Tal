"use server";

import { prisma } from "@/lib/db";
import { schemaSolicitacao } from "@/lib/validacao";
import { dataDeInputISO } from "@/lib/format";

export interface ResultadoEnvio {
  ok: boolean;
  erros?: Record<string, string>;
  mensagem?: string;
}

// Recebe os dados do Formulário 1 (validados no navegador) e:
// 1) valida DE NOVO no servidor (nunca confiar só no cliente),
// 2) reaproveita o cliente se o WhatsApp já existir (evita duplicados),
// 3) salva a solicitação com um número sequencial amigável.
export async function enviarSolicitacao(dados: unknown): Promise<ResultadoEnvio> {
  // Carrega os limites configuráveis
  const config = await prisma.configuracao.findUnique({ where: { id: "default" } });
  const maxAdultos = config?.maxAdultos ?? 30;
  const maxCriancas = config?.maxCriancas ?? 30;

  const parsed = schemaSolicitacao(maxAdultos, maxCriancas).safeParse(dados);
  if (!parsed.success) {
    const erros: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const campo = String(issue.path[0] ?? "geral");
      if (!erros[campo]) erros[campo] = issue.message;
    }
    return { ok: false, erros };
  }

  const d = parsed.data;

  // Confere se a data escolhida é uma data disponível e ativa
  const dataEvento = dataDeInputISO(d.dataEvento);
  const disponivel = await prisma.dataDisponivel.findFirst({
    where: { data: dataEvento, ativa: true },
  });
  if (!disponivel) {
    return {
      ok: false,
      erros: { dataEvento: "Selecione uma das datas disponíveis." },
    };
  }

  try {
    const whatsappLimpo = d.whatsapp.trim();

    await prisma.$transaction(async (tx) => {
      // Reaproveita cliente existente pelo WhatsApp, ou cria um novo
      let cliente = await tx.cliente.findFirst({
        where: { whatsapp: whatsappLimpo },
      });
      if (!cliente) {
        cliente = await tx.cliente.create({
          data: { nome: d.nome.trim(), whatsapp: whatsappLimpo },
        });
      }

      // Número sequencial amigável
      const ultima = await tx.solicitacao.findFirst({
        orderBy: { numero: "desc" },
        select: { numero: true },
      });
      const numero = (ultima?.numero ?? 0) + 1;

      await tx.solicitacao.create({
        data: {
          numero,
          clienteId: cliente.id,
          dataEvento,
          ocasiao: d.ocasiao,
          ocasiaoOutro: d.ocasiao === "Outro" ? d.ocasiaoOutro?.trim() : null,
          numAdultos: d.numAdultos,
          temCriancas: d.temCriancas,
          numCriancas: d.temCriancas ? d.numCriancas ?? null : null,
          temRestricoes: d.temRestricoes,
          restricoesDetalhe: d.temRestricoes ? d.restricoesDetalhe?.trim() : null,
          temChurrasqueira: d.temChurrasqueira,
          endereco: d.endereco.trim(),
          status: "NOVO",
        },
      });
    });

    return { ok: true };
  } catch (e) {
    console.error("Erro ao salvar solicitação:", e);
    return {
      ok: false,
      mensagem: "Não foi possível registrar sua solicitação. Tente novamente.",
    };
  }
}
