import Link from "next/link";
import { notFound } from "next/navigation";
import AdminShell from "@/components/AdminShell";
import { prisma } from "@/lib/db";
import { formatarData, formatarDataHora } from "@/lib/format";
import { formatarReal } from "@/lib/format";
import {
  rotuloStatusSolicitacao,
  corStatusSolicitacao,
  rotuloStatusProposta,
  corStatusProposta,
} from "@/lib/estados";
import { criarProposta } from "./acoes";

export const dynamic = "force-dynamic";

function linkWhatsApp(whatsapp: string): string {
  const digitos = whatsapp.replace(/\D/g, "");
  const comPais = digitos.startsWith("55") ? digitos : `55${digitos}`;
  return `https://wa.me/${comPais}`;
}

function Linha({ rotulo, valor }: { rotulo: string; valor: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-carvao-borda/50 py-3 last:border-0 sm:flex-row sm:gap-4">
      <dt className="w-full text-sm text-white/40 sm:w-56 sm:shrink-0">{rotulo}</dt>
      <dd className="text-sm text-creme">{valor || "—"}</dd>
    </div>
  );
}

export default async function DetalheSolicitacao({
  params,
}: {
  params: { id: string };
}) {
  const s = await prisma.solicitacao.findUnique({
    where: { id: params.id },
    include: {
      cliente: true,
      propostas: { orderBy: { versao: "desc" } },
    },
  });

  if (!s) notFound();

  const criarPropostaAcao = criarProposta.bind(null, s.id);

  return (
    <AdminShell>
      <div className="mb-6">
        <Link href="/admin" className="text-sm text-white/40 hover:text-white/70">
          ← Voltar ao painel
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold sm:text-3xl">
              {s.cliente.nome}
            </h1>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${corStatusSolicitacao(
                s.status,
              )}`}
            >
              {rotuloStatusSolicitacao(s.status)}
            </span>
          </div>
          <p className="mt-1 text-sm text-white/40">
            Solicitação #{String(s.numero).padStart(4, "0")} · recebida{" "}
            {formatarDataHora(s.criadoEm)}
          </p>
        </div>
        <a
          href={linkWhatsApp(s.cliente.whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-brasa"
        >
          Falar no WhatsApp
        </a>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Dados do evento */}
        <div className="lg:col-span-2">
          <div className="cartao p-5 sm:p-6">
            <h2 className="mb-2 font-display text-lg font-semibold">
              Dados do evento
            </h2>
            <dl>
              <Linha rotulo="Contato (WhatsApp)" valor={s.cliente.whatsapp} />
              <Linha rotulo="Data prevista" valor={formatarData(s.dataEvento)} />
              <Linha
                rotulo="Ocasião"
                valor={s.ocasiao === "Outro" ? `Outro: ${s.ocasiaoOutro}` : s.ocasiao}
              />
              <Linha rotulo="Número de adultos" valor={s.numAdultos} />
              <Linha
                rotulo="Crianças (até 12 anos)"
                valor={s.temCriancas ? (s.numCriancas ?? "Sim") : "Não"}
              />
              <Linha
                rotulo="Restrições alimentares"
                valor={
                  s.temRestricoes ? (
                    <span className="whitespace-pre-wrap">
                      {s.restricoesDetalhe}
                    </span>
                  ) : (
                    "Não"
                  )
                }
              />
              <Linha
                rotulo="Churrasqueira no local"
                valor={s.temChurrasqueira ? "Sim" : "Não"}
              />
              <Linha
                rotulo="Endereço do evento"
                valor={<span className="whitespace-pre-wrap">{s.endereco}</span>}
              />
            </dl>
          </div>
        </div>

        {/* Cliente / próximos passos */}
        <div className="space-y-6">
          <div className="cartao p-5 sm:p-6">
            <h2 className="mb-3 font-display text-lg font-semibold">Cliente</h2>
            <dl>
              <Linha rotulo="Nome" valor={s.cliente.nome} />
              <Linha rotulo="WhatsApp" valor={s.cliente.whatsapp} />
              <Linha
                rotulo="Cliente desde"
                valor={formatarData(s.cliente.criadoEm)}
              />
            </dl>
          </div>

          <div className="cartao p-5 sm:p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Propostas</h2>
              <form action={criarPropostaAcao}>
                <button type="submit" className="btn-vinho px-4 py-2 text-sm">
                  {s.propostas.length === 0 ? "Criar proposta" : "Nova versão"}
                </button>
              </form>
            </div>

            {s.propostas.length === 0 ? (
              <p className="text-sm text-white/50">
                Nenhuma proposta ainda. Crie a primeira para montar a composição,
                os custos e o preço.
              </p>
            ) : (
              <ul className="space-y-2">
                {s.propostas.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/admin/propostas/${p.id}`}
                      className="flex items-center justify-between rounded-lg border border-carvao-borda bg-carvao/50 px-3 py-2 transition hover:border-vinho/50"
                    >
                      <span className="text-sm">
                        <span className="text-white/40">v{p.versao}</span>{" "}
                        <span className="text-creme">
                          {formatarReal(p.valorTotal)}
                        </span>
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${corStatusProposta(
                          p.status,
                        )}`}
                      >
                        {rotuloStatusProposta(p.status)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
