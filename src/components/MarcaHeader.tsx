import Link from "next/link";

/** Cabeçalho da área do cliente, com o logo horizontal sobre fundo escuro. */
export default function MarcaHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-carvao-borda/60 bg-carvao/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" aria-label="SAL & TAL — O Churrasco">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/logo-horizontal.jpg"
            alt="SAL & TAL — O Churrasco"
            className="h-11 w-auto sm:h-12"
          />
        </Link>
        <Link href="/orcamento" className="btn-brasa px-4 py-2 text-sm">
          Pedir orçamento
        </Link>
      </div>
    </header>
  );
}
