import Link from "next/link";
import { notFound } from "next/navigation";
import AdminShell from "@/components/AdminShell";
import { prisma } from "@/lib/db";
import { formatarData, formatarDataHora } from "@/lib/format";
import { rotuloStatusSolicitacao, corStatusSolicitacao } from "@/lib/estados";

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
    include: { cliente: true },
  });

  if (!s) notFound();

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
            <h2 className="mb-2 font-display text-lg font-semibold">
              Próximo passo
            </h2>
            <p className="text-sm text-white/60">
              A elaboração da proposta (composição, custos e preço) será feita
              nesta ficha na <strong className="text-brasa-claro">Fase 2</strong>.
              Por ora, entre em contato pelo WhatsApp para dar andamento.
            </p>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
