import Link from "next/link";
import { notFound } from "next/navigation";
import AdminShell from "@/components/AdminShell";
import { prisma } from "@/lib/db";
import { formatarData, dataParaInputISO } from "@/lib/format";
import { rotuloStatusProposta, corStatusProposta } from "@/lib/estados";
import EditorProposta from "./EditorProposta";

export const dynamic = "force-dynamic";

function numStr(n: number | null | undefined): string {
  return n === null || n === undefined ? "" : String(n);
}

export default async function PaginaEditorProposta({
  params,
}: {
  params: { id: string };
}) {
  const proposta = await prisma.proposta.findUnique({
    where: { id: params.id },
    include: {
      custoItens: { orderBy: { criadoEm: "asc" } },
      solicitacao: { include: { cliente: true } },
    },
  });

  if (!proposta) notFound();

  const s = proposta.solicitacao;
  const c = s.cliente;

  return (
    <AdminShell>
      <div className="mb-6">
        <Link
          href={`/admin/solicitacoes/${s.id}`}
          className="text-sm text-white/40 hover:text-white/70"
        >
          ← Voltar à solicitação
        </Link>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-bold sm:text-3xl">
            Proposta · {c.nome}
          </h1>
          <span className="text-sm text-white/40">versão {proposta.versao}</span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${corStatusProposta(
              proposta.status,
            )}`}
          >
            {rotuloStatusProposta(proposta.status)}
          </span>
        </div>
        <p className="mt-1 text-sm text-white/50">
          Evento: {s.ocasiao === "Outro" ? s.ocasiaoOutro : s.ocasiao} ·{" "}
          {formatarData(s.dataEvento)} · {s.numAdultos} adultos
          {s.temCriancas && s.numCriancas ? ` + ${s.numCriancas} crianças` : ""}
        </p>
      </div>

      <EditorProposta
        id={proposta.id}
        versao={proposta.versao}
        status={proposta.status}
        tokenAcesso={proposta.tokenAcesso}
        cliente={{ nome: c.nome, whatsapp: c.whatsapp }}
        inicial={{
          escopoDescricao: proposta.escopoDescricao ?? "",
          valorTotal: numStr(proposta.valorTotal),
          condicoesPagamento: proposta.condicoesPagamento ?? "",
          validadeAte: proposta.validadeAte
            ? dataParaInputISO(proposta.validadeAte)
            : "",
          ressalvas: proposta.ressalvas ?? "",
          observacoesInternas: proposta.observacoesInternas ?? "",
          despesasVariaveis: numStr(proposta.despesasVariaveis),
          despesasFixas: numStr(proposta.despesasFixas),
          margem: numStr(proposta.margem),
          itens: proposta.custoItens.map((i) => ({
            insumo: i.insumo,
            quantidade: numStr(i.quantidade),
            unidade: i.unidade,
            custoUnitario: numStr(i.custoUnitario),
          })),
        }}
      />
    </AdminShell>
  );
}
