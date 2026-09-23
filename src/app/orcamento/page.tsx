import MarcaHeader from "@/components/MarcaHeader";
import { prisma } from "@/lib/db";
import { dataParaInputISO } from "@/lib/format";
import FormularioOrcamento from "./FormularioOrcamento";

export const dynamic = "force-dynamic";

export default async function PaginaOrcamento() {
  const config = await prisma.configuracao.findUnique({ where: { id: "default" } });
  const datas = await prisma.dataDisponivel.findMany({
    where: { ativa: true, data: { gte: new Date() } },
    orderBy: { data: "asc" },
  });

  const datasDisponiveis = datas.map((d) => ({
    valor: dataParaInputISO(d.data),
    rotulo: new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(d.data),
  }));

  return (
    <div className="min-h-screen">
      <MarcaHeader />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">
            <span className="titulo-brasa">Conte-nos sobre o seu evento</span>
          </h1>
          <p className="mt-3 text-creme/70">
            Com essas informações, nossa equipe monta uma proposta personalizada
            para você. Leva cerca de 3 minutos.
          </p>
        </div>

        <FormularioOrcamento
          maxAdultos={config?.maxAdultos ?? 30}
          maxCriancas={config?.maxCriancas ?? 30}
          datasDisponiveis={datasDisponiveis}
        />
      </main>
    </div>
  );
}
