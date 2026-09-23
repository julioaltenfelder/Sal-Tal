import Link from "next/link";
import MarcaHeader from "@/components/MarcaHeader";
import { MENSAGEM_CONCLUSAO_FORM1 } from "@/lib/formularios";

export default function PaginaSucesso() {
  return (
    <div className="min-h-screen">
      <MarcaHeader />
      <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-16 text-center sm:py-24">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b from-brasa-claro to-brasa-escuro text-3xl shadow-brasa">
          🔥
        </div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          <span className="titulo-brasa">Solicitação recebida!</span>
        </h1>
        <p className="mt-5 text-creme/75">{MENSAGEM_CONCLUSAO_FORM1}</p>
        <Link href="/" className="btn-ghost mt-10">
          Voltar ao início
        </Link>
      </main>
    </div>
  );
}
