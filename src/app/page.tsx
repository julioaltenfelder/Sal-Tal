import Link from "next/link";
import MarcaHeader from "@/components/MarcaHeader";

export default function PaginaInicial() {
  return (
    <div className="min-h-screen">
      <MarcaHeader />

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pb-16 pt-14 sm:pt-20">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-brasa-claro">
          Churrasco premium a domicílio
        </p>
        <h1 className="font-display text-4xl font-bold leading-tight sm:text-6xl">
          <span className="titulo-brasa">Tradição e técnica</span>
          <br />
          que atravessam gerações.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-creme/70">
          Nossa equipe assume tudo — a compra dos insumos, o preparo na brasa e o
          serviço no local. Você aproveita o evento com seus convidados, sem se
          preocupar com nada.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link href="/orcamento" className="btn-brasa">
            Pedir meu orçamento
          </Link>
          <a href="#como-funciona" className="btn-ghost">
            Como funciona
          </a>
        </div>
        <p className="mt-4 text-sm text-white/40">
          Leva cerca de 3 minutos. O envio não representa uma reserva confirmada.
        </p>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="mx-auto max-w-5xl px-4 pb-16">
        <h2 className="mb-8 font-display text-2xl font-semibold sm:text-3xl">
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
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-brasa-claro to-brasa-escuro font-display text-lg font-bold text-white">
                {p.n}
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold">{p.t}</h3>
              <p className="text-sm text-creme/60">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* O que inclui */}
      <section className="mx-auto max-w-5xl px-4 pb-20">
        <div className="cartao p-6 sm:p-8">
          <h2 className="mb-6 font-display text-2xl font-semibold">
            A experiência SAL &amp; TAL
          </h2>
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brasa-claro">
                Nós cuidamos
              </h3>
              <ul className="space-y-2 text-sm text-creme/75">
                <li>• Compra e curadoria dos insumos</li>
                <li>• Preparo completo do churrasco na brasa</li>
                <li>• Apresentação e serviço, em tábuas</li>
                <li>• Limpeza da área usada pela equipe</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-creme/50">
                Fica por conta do local
              </h3>
              <ul className="space-y-2 text-sm text-creme/60">
                <li>• Bebidas e gelo</li>
                <li>• Pratos, copos e talheres</li>
                <li>• Mesas e cadeiras</li>
              </ul>
              <p className="mt-4 text-xs text-white/40">
                Precisa de algo além do churrasco? A gente alinha pelo WhatsApp —
                tudo é suscetível a arranjo.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link href="/orcamento" className="btn-brasa">
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
