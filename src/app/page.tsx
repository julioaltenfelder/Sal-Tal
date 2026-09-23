import Link from "next/link";
import MarcaHeader from "@/components/MarcaHeader";

/** Ícone dentro de um círculo vinho (usado nas seções claras). */
function IconeCirculo({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-vinho text-creme">
      {children}
    </div>
  );
}

export default function PaginaInicial() {
  return (
    <div className="min-h-screen">
      <MarcaHeader />

      {/* ---------------- HERO (escuro) ---------------- */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-16">
        <div className="grid items-center gap-8 md:grid-cols-2">
          {/* Logo */}
          <div className="overflow-hidden rounded-2xl border border-carvao-borda">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logos/logo-quadrado.jpg"
              alt="SAL & TAL — O Churrasco"
              className="w-full"
            />
          </div>

          {/* Texto */}
          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.25em] text-vinho-suave">
              Churrasco premium a domicílio
            </p>
            <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
              <span className="titulo-marca">Tradição e técnica</span>
              <br />
              que atravessam gerações.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-creme/75">
              Churrasco premium, serviço completo e atendimento personalizado, sem
              precisar se preocupar com nada.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/orcamento" className="btn-vinho">
                Pedir meu orçamento
              </Link>
              <a href="#como-funciona" className="btn-ghost">
                Saiba mais
              </a>
            </div>
            <p className="mt-4 text-sm text-white/40">
              Leva cerca de 3 minutos. O envio não representa uma reserva confirmada.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- O QUE OFERECEMOS (creme) ---------------- */}
      <section className="bg-creme text-tinta">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <h2 className="mb-10 font-display text-3xl font-semibold sm:text-4xl">
            O que oferecemos
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icone: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3l7 7" />
                    <path d="M14 4c2.5 0 5 2 5 5 0 3-3 5-3 5l-8-8s3-2 6-2z" />
                    <path d="M11 13l-7 7" />
                  </svg>
                ),
                titulo: "Curadoria de cortes nobres",
                texto:
                  "Seleção dos melhores cortes e produtos, preparados com a técnica e o cuidado que você merece.",
              },
              {
                icone: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.8 8.6a3.4 3.4 0 0 0-5-.3l-.8.8-.8-.8a3.4 3.4 0 1 0-4.8 4.8l5.6 5.6 5.6-5.6a3.4 3.4 0 0 0 0-4.5z" />
                    <path d="M3 12h3l1.5-3 2 5 1.5-2" />
                  </svg>
                ),
                titulo: "Atendimento completo e personalizado",
                texto:
                  "Você recebe os convidados. Nós fazemos o restante, garantindo cada detalhe do seu evento.",
              },
              {
                icone: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6" y="4" width="12" height="16" rx="2" />
                    <path d="M9 4V3h6v1" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                ),
                titulo: "Praticidade total",
                texto:
                  "Do planejamento à execução — tudo pensado para você aproveitar, sem complicação.",
              },
            ].map((c) => (
              <div key={c.titulo} className="cartao-creme p-6">
                <IconeCirculo>{c.icone}</IconeCirculo>
                <h3 className="mb-2 font-display text-xl font-semibold leading-snug">
                  {c.titulo}
                </h3>
                <p className="text-sm leading-relaxed text-tinta-suave">{c.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- COMO FUNCIONA (escuro) ---------------- */}
      <section id="como-funciona" className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <h2 className="mb-10 font-display text-3xl font-semibold sm:text-4xl">
          Como funciona
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              n: "1",
              t: "Conte sobre o evento",
              d: "Você preenche um pedido rápido com o essencial: data, ocasião e número de convidados.",
            },
            {
              n: "2",
              t: "Recebe uma proposta sob medida",
              d: "Nossa equipe monta uma proposta personalizada e envia para você pelo WhatsApp.",
            },
            {
              n: "3",
              t: "Nós cuidamos de tudo",
              d: "No dia, preparamos o churrasco na brasa e servimos seus convidados. Você só aproveita.",
            },
          ].map((p) => (
            <div key={p.n} className="cartao p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-vinho font-display text-lg font-bold text-creme">
                {p.n}
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold">{p.t}</h3>
              <p className="text-sm text-creme/60">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- O QUE FICA COM O SAL & TAL (creme) ---------------- */}
      <section className="bg-creme text-tinta">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:py-20">
          <h2 className="mb-6 font-display text-3xl font-semibold sm:text-4xl">
            O que fica com o SAL &amp; TAL
          </h2>
          <p className="text-lg leading-relaxed text-tinta">
            Curadoria e fornecimento dos alimentos, preparo completo, apresentação e
            serviço do Churrasco aos convidados no local e limpeza da área utilizada
            pela nossa equipe.
          </p>
          <p className="mt-4 text-sm text-tinta-suave">
            Foco do cardápio: tudo é feito na brasa.
          </p>

          <div className="mt-8 rounded-2xl border border-vinho/25 bg-vinho/5 p-6">
            <p className="leading-relaxed text-tinta">
              <strong className="text-vinho">Importante:</strong> Nossos serviços não
              incluem o fornecimento de pratos, copos, talheres, mesas e cadeiras. O
              Churrasco é servido com carinho em tábuas, seguindo a nossa assinatura e
              sem precisar de mais nada. Infraestrutura adicional fica por conta do
              local do evento, combinado?
            </p>
          </div>

          <p className="mt-8 leading-relaxed text-tinta">
            Precisa de ajuda com as bebidas, guarnições adicionais ou para organizar
            algo além do Churrasco? Fale com a gente no WhatsApp e vemos juntos as
            melhores opções para o seu evento.
          </p>
        </div>
      </section>

      {/* ---------------- CTA FINAL (escuro) ---------------- */}
      <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:py-24">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">
          <span className="titulo-marca">Vamos preparar o seu churrasco?</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-creme/70">
          Conte sobre o seu evento e receba uma proposta personalizada da nossa
          equipe.
        </p>
        <div className="mt-8">
          <Link href="/orcamento" className="btn-vinho">
            Pedir meu orçamento
          </Link>
        </div>
      </section>

      <footer className="border-t border-carvao-borda/60 py-8 text-center text-xs text-white/30">
        <p>SAL &amp; TAL — O Churrasco · Tradição e técnica que atravessam gerações.</p>
        <p className="mt-2">
          <Link href="/admin/login" className="hover:text-white/50">
            Acesso da equipe
          </Link>
        </p>
      </footer>
    </div>
  );
}
