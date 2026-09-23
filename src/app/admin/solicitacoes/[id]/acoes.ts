"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { lerSessao } from "@/lib/auth";

// Cria uma nova proposta (versão 1, rascunho) para uma solicitação e leva o
// administrador ao editor. Marca a solicitação como "proposta em elaboração".
export async function criarProposta(solicitacaoId: string) {
  const sessao = await lerSessao();
  if (!sessao) redirect("/admin/login");

  const solicitacao = await prisma.solicitacao.findUnique({
    where: { id: solicitacaoId },
    include: { propostas: { orderBy: { versao: "desc" }, take: 1 } },
  });
  if (!solicitacao) redirect("/admin");

  const proximaVersao = (solicitacao.propostas[0]?.versao ?? 0) + 1;

  const proposta = await prisma.proposta.create({
    data: {
      solicitacaoId,
      versao: proximaVersao,
      status: "RASCUNHO",
    },
  });

  if (solicitacao.status === "NOVO") {
    await prisma.solicitacao.update({
      where: { id: solicitacaoId },
      data: { status: "PROPOSTA_EM_ELABORACAO" },
    });
  }

  redirect(`/admin/propostas/${proposta.id}`);
}
