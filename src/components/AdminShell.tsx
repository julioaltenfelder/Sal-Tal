import Link from "next/link";
import { lerSessao } from "@/lib/auth";
import { sair } from "@/app/admin/acoes";

/** Moldura da área administrativa: cabeçalho com logo, nome e "Sair". */
export default async function AdminShell({
  children,
  titulo,
}: {
  children: React.ReactNode;
  titulo?: string;
}) {
  const sessao = await lerSessao();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-carvao-borda/60 bg-carvao/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href="/admin" aria-label="Painel">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logos/logo-horizontal.jpg"
                alt="SAL & TAL"
                className="h-9 w-auto"
              />
            </Link>
            <span className="hidden rounded-md border border-carvao-borda bg-carvao-medio/50 px-2 py-0.5 text-xs uppercase tracking-wide text-white/50 sm:inline">
              Painel da equipe
            </span>
          </div>
          <div className="flex items-center gap-3">
            {sessao && (
              <span className="hidden text-sm text-white/50 sm:inline">
                {sessao.nome}
              </span>
            )}
            <form action={sair}>
              <button className="btn-ghost px-4 py-2 text-sm" type="submit">
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        {titulo && (
          <h1 className="mb-6 font-display text-2xl font-bold sm:text-3xl">
            {titulo}
          </h1>
        )}
        {children}
      </main>
    </div>
  );
}
