"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { calcularSinal } from "@/lib/proposta";

export interface Resultado {
  ok: boolean;
  mensagem?: string;
}

function aceitavel(status: string, validadeAte: Date | null): boolean {
  if (!["ENVIADA", "VISUALIZADA"].includes(status)) return false;
  if (validadeAte && validadeAte.getTime() < Date.now()) return false;
  return true;
}

/** Cliente aceita a proposta: cria o evento e registra o sinal (50%). */
export async function aceitarProposta(token: string): Promise<Resultado> {
  const proposta = await prisma.proposta.findUnique({
    where: { tokenAcesso: token },
    include: { solicitacao: true, evento: true },
  });
  if (!proposta) return { ok: false, mensagem: "Proposta não encontrada." };
  if (proposta.status === "ACEITA") return { ok: true }; // idempotente
  if (!aceitavel(proposta.status, proposta.validadeAte)) {
    return {
      ok: false,
      mensagem: "Esta proposta não está mais disponível para aceite.",
    };
  }

  const valorSinal = calcularSinal(proposta.valorTotal);

  await prisma.$transaction(async (tx) => {
    await tx.proposta.update({
      where: { id: proposta.id },
      data: { status: "ACEITA", aceitaEm: new Date() },
    });
    await tx.solicitacao.update({
      where: { id: proposta.solicitacaoId },
      data: { status: "ACEITA" },
    });
    if (!proposta.evento) {
      await tx.evento.create({
        data: {
          clienteId: proposta.solicitacao.clienteId,
          propostaId: proposta.id,
          valorSinal,
          statusSinal: "PENDENTE",
          status: "AGUARDANDO_FORM2",
        },
      });
    }
  });

  revalidatePath(`/proposta/${token}`);
  return { ok: true };
}

/** Cliente recusa a proposta. */
export async function recusarProposta(token: string): Promise<Resultado> {
  const proposta = await prisma.proposta.findUnique({
    where: { tokenAcesso: token },
    include: { solicitacao: true },
  });
  if (!proposta) return { ok: false, mensagem: "Proposta não encontrada." };
  if (proposta.status === "RECUSADA") return { ok: true };
  if (!["ENVIADA", "VISUALIZADA"].includes(proposta.status)) {
    return { ok: false, mensagem: "Esta proposta não pode mais ser recusada." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.proposta.update({
      where: { id: proposta.id },
      data: { status: "RECUSADA", recusadaEm: new Date() },
    });
    await tx.solicitacao.update({
      where: { id: proposta.solicitacaoId },
      data: { status: "RECUSADA" },
    });
  });

  revalidatePath(`/proposta/${token}`);
  return { ok: true };
}
