import { notFound } from "next/navigation";
import MarcaHeader from "@/components/MarcaHeader";
import { prisma } from "@/lib/db";
import { formatarData } from "@/lib/format";
import { formatarReal } from "@/lib/format";
import {
  ITENS_INCLUIDOS,
  ITENS_EXCLUIDOS,
  APRESENTACAO_EXPERIENCIA,
  NOTA_SINAL,
  calcularSinal,
  propostaVisivelAoCliente,
} from "@/lib/proposta";
import AcoesCliente from "./AcoesCliente";

export const dynamic = "force-dynamic";

export default async function PaginaProposta({
  params,
}: {
  params: { token: string };
}) {
  let proposta = await prisma.proposta.findUnique({
    where: { tokenAcesso: params.token },
    include: { solicitacao: { include: { cliente: true } } },
  });

  if (!proposta || !propostaVisivelAoCliente(proposta.status)) {
    notFound();
  }

  const expirada =
    ["ENVIADA", "VISUALIZADA"].includes(proposta.status) &&
    proposta.validadeAte &&
    proposta.validadeAte.getTime() < Date.now();

  // Atualiza estado de visualização/expiração (registro discreto)
  if (expirada) {
    await prisma.proposta.update({
      where: { id: proposta.id },
      data: { status: "EXPIRADA" },
    });
    proposta = { ...proposta, status: "EXPIRADA" };
  } else if (proposta.status === "ENVIADA") {
    await prisma.proposta.update({
      where: { id: proposta.id },
      data: { status: "VISUALIZADA", visualizadaEm: new Date() },
    });
    proposta = { ...proposta, status: "VISUALIZADA" };
  }

  const s = proposta.solicitacao;
  const c = s.cliente;
  const sinal = calcularSinal(proposta.valorTotal);
  const podeAgir = ["ENVIADA", "VISUALIZADA"].includes(proposta.status);
  const convidados =
    s.numAdultos + (s.temCriancas && s.numCriancas ? s.numCriancas : 0);

  return (
    <div className="min-h-screen">
      <MarcaHeader />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        {/* Banner de estado */}
        {proposta.status === "ACEITA" && (
          <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-200">
            <p className="font-display text-lg font-semibold">Proposta aceita! 🔥</p>
            <p className="mt-1 text-sm">
              Que alegria! Em breve nossa equipe entra em contato pelo WhatsApp para
              detalhar o evento e combinar o sinal de garantia.
            </p>
          </div>
        )}
        {proposta.status === "RECUSADA" && (
          <div className="mb-6 rounded-2xl border border-white/15 bg-white/5 p-5 text-creme/70">
            <p className="font-display text-lg font-semibold">Proposta recusada</p>
            <p className="mt-1 text-sm">
              Tudo bem! Se mudar de ideia ou quiser ajustar algo, fale com a gente no
              WhatsApp.
            </p>
          </div>
        )}
        {proposta.status === "EXPIRADA" && (
          <div className="mb-6 rounded-2xl border border-white/15 bg-white/5 p-5 text-creme/70">
            <p className="font-display text-lg font-semibold">Proposta expirada</p>
            <p className="mt-1 text-sm">
              Esta proposta passou da data de validade. Fale com a nossa equipe para
              recebermos uma versão atualizada.
            </p>
          </div>
        )}

        {/* Documento da proposta (creme) */}
        <article className="cartao-creme overflow-hidden text-tinta">
          <div className="border-b border-creme-borda bg-white/40 px-6 py-6 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-vinho">
              Proposta de churrasco premium
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold">{c.nome}</h1>
            <p className="mt-2 text-sm text-tinta-suave">
              {s.ocasiao === "Outro" ? s.ocasiaoOutro : s.ocasiao} ·{" "}
              {formatarData(s.dataEvento)} · {convidados} convidados
            </p>
          </div>

          <div className="space-y-8 px-6 py-8 sm:px-8">
            {/* Apresentação */}
            <section>
              <p className="leading-relaxed text-tinta">{APRESENTACAO_EXPERIENCIA}</p>
            </section>

            {/* Escopo */}
            {proposta.escopoDescricao && (
              <section>
                <h2 className="mb-2 font-display text-lg font-semibold">
                  Sobre o seu evento
                </h2>
                <p className="whitespace-pre-wrap leading-relaxed text-tinta">
                  {proposta.escopoDescricao}
                </p>
              </section>
            )}

            {/* Incluídos / Excluídos */}
            <section className="grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-vinho">
                  Incluído
                </h3>
                <ul className="space-y-2 text-sm text-tinta">
                  {ITENS_INCLUIDOS.map((i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-vinho">✓</span>
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-tinta-suave">
                  Não incluído
                </h3>
                <ul className="space-y-2 text-sm text-tinta-suave">
                  {ITENS_EXCLUIDOS.map((i) => (
                    <li key={i}>• {i}</li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-tinta-suave">
                  Infraestrutura fica por conta do local. Precisa de bebidas ou algo
                  além do churrasco? Falamos pelo WhatsApp.
                </p>
              </div>
            </section>

            {/* Valor */}
            <section className="rounded-xl border border-vinho/20 bg-vinho/5 p-6">
              <p className="text-sm text-tinta-suave">Valor total</p>
              <p className="font-display text-4xl font-bold text-vinho">
                {formatarReal(proposta.valorTotal)}
              </p>
              {proposta.condicoesPagamento && (
                <p className="mt-3 text-sm text-tinta">
                  <strong>Condições de pagamento:</strong>{" "}
                  {proposta.condicoesPagamento}
                </p>
              )}
              {proposta.validadeAte && (
                <p className="mt-1 text-sm text-tinta-suave">
                  Proposta válida até {formatarData(proposta.validadeAte)}.
                </p>
              )}
            </section>

            {/* Nota do sinal (discreta) */}
            <section className="rounded-xl border border-creme-borda bg-white/40 p-5">
              <h3 className="mb-1 text-sm font-semibold text-tinta">
                Sinal de garantia
              </h3>
              <p className="text-sm text-tinta-suave">{NOTA_SINAL}</p>
              {sinal !== null && (
                <p className="mt-2 text-sm text-tinta">
                  Valor de referência do sinal (50%):{" "}
                  <strong>{formatarReal(sinal)}</strong>.
                </p>
              )}
            </section>

            {/* Ressalvas */}
            {proposta.ressalvas && (
              <section>
                <p className="text-xs leading-relaxed text-tinta-suave">
                  {proposta.ressalvas}
                </p>
              </section>
            )}

            {/* PDF */}
            <div>
              <a
                href={`/proposta/${params.token}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-vinho underline underline-offset-4 hover:text-vinho-claro"
              >
                Baixar proposta em PDF
              </a>
            </div>
          </div>
        </article>

        {/* Ações do cliente */}
        {podeAgir && (
          <div className="mt-6">
            <AcoesCliente token={params.token} />
          </div>
        )}

        <p className="mt-8 text-center text-xs text-white/30">
          SAL &amp; TAL — O Churrasco · Tradição e técnica que atravessam gerações.
        </p>
      </main>
    </div>
  );
}
