"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { lerSessao } from "@/lib/auth";
import { resumoCusto } from "@/lib/proposta";
import { dataDeInputISO } from "@/lib/format";

export interface ItemEntrada {
  insumo: string;
  quantidade: number;
  unidade: string;
  custoUnitario: number;
}

export interface DadosProposta {
  // Visível ao cliente
  escopoDescricao?: string | null;
  valorTotal?: number | null;
  condicoesPagamento?: string | null;
  validadeAte?: string | null; // aaaa-mm-dd
  ressalvas?: string | null;
  // Confidencial
  observacoesInternas?: string | null;
  despesasVariaveis?: number | null;
  despesasFixas?: number | null;
  margem?: number | null;
  itens: ItemEntrada[];
}

export interface Resultado {
  ok: boolean;
  mensagem?: string;
}

async function exigirSessao() {
  const sessao = await lerSessao();
  if (!sessao) redirect("/admin/login");
}

/** Salva os campos da proposta e regrava a tabela de custos. */
export async function salvarProposta(
  id: string,
  dados: DadosProposta,
): Promise<Resultado> {
  await exigirSessao();

  const proposta = await prisma.proposta.findUnique({ where: { id } });
  if (!proposta) return { ok: false, mensagem: "Proposta não encontrada." };
  if (["ACEITA", "RECUSADA", "CANCELADA"].includes(proposta.status)) {
    return {
      ok: false,
      mensagem:
        "Esta proposta está encerrada e não pode mais ser editada. Crie uma nova versão.",
    };
  }

  const itens = (dados.itens ?? [])
    .filter((i) => i.insumo?.trim())
    .map((i) => ({
      insumo: i.insumo.trim(),
      quantidade: Number(i.quantidade) || 0,
      unidade: i.unidade || "kg",
      custoUnitario: Number(i.custoUnitario) || 0,
      subtotal: (Number(i.quantidade) || 0) * (Number(i.custoUnitario) || 0),
    }));

  const resumo = resumoCusto({
    itens,
    despesasVariaveis: dados.despesasVariaveis,
    despesasFixas: dados.despesasFixas,
    receita: dados.valorTotal,
  });

  try {
    await prisma.$transaction(async (tx) => {
      await tx.custoItem.deleteMany({ where: { propostaId: id } });
      await tx.proposta.update({
        where: { id },
        data: {
          escopoDescricao: dados.escopoDescricao?.trim() || null,
          valorTotal: dados.valorTotal ?? null,
          condicoesPagamento: dados.condicoesPagamento?.trim() || null,
          validadeAte: dados.validadeAte ? dataDeInputISO(dados.validadeAte) : null,
          ressalvas: dados.ressalvas?.trim() || null,
          observacoesInternas: dados.observacoesInternas?.trim() || null,
          despesasVariaveis: dados.despesasVariaveis ?? 0,
          despesasFixas: dados.despesasFixas ?? 0,
          margem: dados.margem ?? null,
          resultadoBruto: resumo.resultadoBruto,
          custoItens: {
            create: itens,
          },
        },
      });
    });

    revalidatePath(`/admin/propostas/${id}`);
    return { ok: true };
  } catch (e) {
    console.error("Erro ao salvar proposta:", e);
    return { ok: false, mensagem: "Não foi possível salvar. Tente novamente." };
  }
}

/** Marca a proposta como enviada (gera/mantém o link do cliente). */
export async function enviarProposta(id: string): Promise<Resultado> {
  await exigirSessao();

  const proposta = await prisma.proposta.findUnique({ where: { id } });
  if (!proposta) return { ok: false, mensagem: "Proposta não encontrada." };
  if (proposta.valorTotal === null || proposta.valorTotal === undefined) {
    return {
      ok: false,
      mensagem: "Informe o valor total da proposta antes de enviar.",
    };
  }
  if (["ACEITA", "RECUSADA", "CANCELADA"].includes(proposta.status)) {
    return { ok: false, mensagem: "Esta proposta já está encerrada." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.proposta.update({
      where: { id },
      data: { status: "ENVIADA", enviadaEm: new Date() },
    });
    await tx.solicitacao.update({
      where: { id: proposta.solicitacaoId },
      data: { status: "PROPOSTA_ENVIADA" },
    });
  });

  revalidatePath(`/admin/propostas/${id}`);
  return { ok: true };
}

/** Cria uma nova versão (rascunho) copiando esta proposta, para revisão. */
export async function duplicarProposta(id: string) {
  await exigirSessao();

  const origem = await prisma.proposta.findUnique({
    where: { id },
    include: { custoItens: true },
  });
  if (!origem) redirect("/admin");

  const ultima = await prisma.proposta.findFirst({
    where: { solicitacaoId: origem.solicitacaoId },
    orderBy: { versao: "desc" },
    select: { versao: true },
  });
  const proximaVersao = (ultima?.versao ?? origem.versao) + 1;

  const nova = await prisma.proposta.create({
    data: {
      solicitacaoId: origem.solicitacaoId,
      versao: proximaVersao,
      status: "RASCUNHO",
      escopoDescricao: origem.escopoDescricao,
      valorTotal: origem.valorTotal,
      condicoesPagamento: origem.condicoesPagamento,
      validadeAte: origem.validadeAte,
      ressalvas: origem.ressalvas,
      observacoesInternas: origem.observacoesInternas,
      despesasVariaveis: origem.despesasVariaveis,
      despesasFixas: origem.despesasFixas,
      margem: origem.margem,
      resultadoBruto: origem.resultadoBruto,
      custoItens: {
        create: origem.custoItens.map((i) => ({
          insumo: i.insumo,
          quantidade: i.quantidade,
          unidade: i.unidade,
          custoUnitario: i.custoUnitario,
          subtotal: i.subtotal,
        })),
      },
    },
  });

  redirect(`/admin/propostas/${nova.id}`);
}
