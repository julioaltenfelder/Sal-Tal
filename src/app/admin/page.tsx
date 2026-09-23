import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import { prisma } from "@/lib/db";
import { formatarData, formatarDataHora } from "@/lib/format";
import { rotuloStatusSolicitacao, corStatusSolicitacao } from "@/lib/estados";

export const dynamic = "force-dynamic";

export default async function PainelAdmin() {
  const [solicitacoes, totalClientes] = await Promise.all([
    prisma.solicitacao.findMany({
      orderBy: { criadoEm: "desc" },
      include: { cliente: true },
    }),
    prisma.cliente.count(),
  ]);

  const novas = solicitacoes.filter((s) => s.status === "NOVO").length;
  const emAndamento = solicitacoes.filter((s) =>
    ["PROPOSTA_EM_ELABORACAO", "PROPOSTA_ENVIADA"].includes(s.status),
  ).length;

  const cards = [
    { rotulo: "Novas solicitações", valor: novas, destaque: true },
    { rotulo: "Em andamento", valor: emAndamento },
    { rotulo: "Total de solicitações", valor: solicitacoes.length },
    { rotulo: "Clientes", valor: totalClientes },
  ];

  return (
    <AdminShell titulo="Painel">
      {/* Resumo */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.rotulo}
            className={`cartao p-4 ${c.destaque && c.valor > 0 ? "ring-1 ring-brasa/40" : ""}`}
          >
            <p className="text-xs uppercase tracking-wide text-white/40">
              {c.rotulo}
            </p>
            <p className="mt-1 font-display text-3xl font-bold text-creme">
              {c.valor}
            </p>
          </div>
        ))}
      </div>

      {/* Lista de solicitações */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Solicitações</h2>
      </div>

      {solicitacoes.length === 0 ? (
        <div className="cartao p-10 text-center text-white/50">
          Ainda não há solicitações. Assim que um cliente enviar o formulário de
          orçamento, ela aparece aqui.
        </div>
      ) : (
        <div className="space-y-3">
          {solicitacoes.map((s) => (
            <Link
              key={s.id}
              href={`/admin/solicitacoes/${s.id}`}
              className="cartao flex flex-col gap-3 p-4 transition hover:border-brasa/50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-white/40">
                    #{String(s.numero).padStart(4, "0")}
                  </span>
                  <span className="truncate font-semibold text-creme">
                    {s.cliente.nome}
                  </span>
                </div>
                <p className="mt-1 text-sm text-white/50">
                  {s.ocasiao === "Outro" ? s.ocasiaoOutro : s.ocasiao} ·{" "}
                  {formatarData(s.dataEvento)} · {s.numAdultos} adultos
                  {s.temCriancas && s.numCriancas ? ` + ${s.numCriancas} crianças` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${corStatusSolicitacao(
                    s.status,
                  )}`}
                >
                  {rotuloStatusSolicitacao(s.status)}
                </span>
                <span className="text-xs text-white/30">
                  recebida {formatarDataHora(s.criadoEm)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
