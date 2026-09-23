"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatarReal, parseNumeroBR } from "@/lib/format";
import { resumoCusto, calcularSinal } from "@/lib/proposta";
import { salvarProposta, enviarProposta, duplicarProposta } from "./acoes";

interface ItemStr {
  insumo: string;
  quantidade: string;
  unidade: string;
  custoUnitario: string;
}

interface Props {
  id: string;
  versao: number;
  status: string;
  tokenAcesso: string;
  cliente: { nome: string; whatsapp: string };
  inicial: {
    escopoDescricao: string;
    valorTotal: string;
    condicoesPagamento: string;
    validadeAte: string;
    ressalvas: string;
    observacoesInternas: string;
    despesasVariaveis: string;
    despesasFixas: string;
    margem: string;
    itens: ItemStr[];
  };
}

const EDITAVEL = (status: string) =>
  !["ACEITA", "RECUSADA", "CANCELADA"].includes(status);

export default function EditorProposta({
  id,
  versao,
  status,
  tokenAcesso,
  cliente,
  inicial,
}: Props) {
  const router = useRouter();
  const [f, setF] = useState(inicial);
  const [itens, setItens] = useState<ItemStr[]>(
    inicial.itens.length
      ? inicial.itens
      : [{ insumo: "", quantidade: "", unidade: "kg", custoUnitario: "" }],
  );
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [salvando, iniciarSalvar] = useTransition();
  const [enviando, iniciarEnviar] = useTransition();
  const [copiado, setCopiado] = useState(false);

  const editavel = EDITAVEL(status);

  // Resumo de custos (aritmética de conferência)
  const resumo = useMemo(() => {
    const itensNum = itens.map((i) => ({
      subtotal: (parseNumeroBR(i.quantidade) ?? 0) * (parseNumeroBR(i.custoUnitario) ?? 0),
    }));
    return resumoCusto({
      itens: itensNum,
      despesasVariaveis: parseNumeroBR(f.despesasVariaveis),
      despesasFixas: parseNumeroBR(f.despesasFixas),
      receita: parseNumeroBR(f.valorTotal),
    });
  }, [itens, f.despesasVariaveis, f.despesasFixas, f.valorTotal]);

  const sinal = calcularSinal(parseNumeroBR(f.valorTotal));

  function up<K extends keyof typeof f>(campo: K, valor: string) {
    setF((prev) => ({ ...prev, [campo]: valor }));
  }

  function upItem(idx: number, campo: keyof ItemStr, valor: string) {
    setItens((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, [campo]: valor } : it)),
    );
  }
  function addItem() {
    setItens((p) => [...p, { insumo: "", quantidade: "", unidade: "kg", custoUnitario: "" }]);
  }
  function removeItem(idx: number) {
    setItens((p) => p.filter((_, i) => i !== idx));
  }

  function montarDados() {
    return {
      escopoDescricao: f.escopoDescricao,
      valorTotal: parseNumeroBR(f.valorTotal),
      condicoesPagamento: f.condicoesPagamento,
      validadeAte: f.validadeAte || null,
      ressalvas: f.ressalvas,
      observacoesInternas: f.observacoesInternas,
      despesasVariaveis: parseNumeroBR(f.despesasVariaveis) ?? 0,
      despesasFixas: parseNumeroBR(f.despesasFixas) ?? 0,
      margem: parseNumeroBR(f.margem),
      itens: itens.map((i) => ({
        insumo: i.insumo,
        quantidade: parseNumeroBR(i.quantidade) ?? 0,
        unidade: i.unidade,
        custoUnitario: parseNumeroBR(i.custoUnitario) ?? 0,
      })),
    };
  }

  function salvar(): Promise<boolean> {
    return new Promise((resolve) => {
      iniciarSalvar(async () => {
        const res = await salvarProposta(id, montarDados());
        if (res.ok) {
          setMsg({ tipo: "ok", texto: "Proposta salva." });
          router.refresh();
          resolve(true);
        } else {
          setMsg({ tipo: "erro", texto: res.mensagem ?? "Erro ao salvar." });
          resolve(false);
        }
      });
    });
  }

  function enviar() {
    iniciarEnviar(async () => {
      // salva antes de enviar
      const okSalvar = await salvarProposta(id, montarDados());
      if (!okSalvar.ok) {
        setMsg({ tipo: "erro", texto: okSalvar.mensagem ?? "Erro ao salvar." });
        return;
      }
      const res = await enviarProposta(id);
      if (res.ok) {
        setMsg({ tipo: "ok", texto: "Proposta enviada! Copie o link e mande no WhatsApp." });
        router.refresh();
      } else {
        setMsg({ tipo: "erro", texto: res.mensagem ?? "Erro ao enviar." });
      }
    });
  }

  const linkCliente =
    typeof window !== "undefined"
      ? `${window.location.origin}/proposta/${tokenAcesso}`
      : `/proposta/${tokenAcesso}`;

  function copiarLink() {
    navigator.clipboard?.writeText(linkCliente).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  }

  function linkWhatsApp() {
    const digitos = cliente.whatsapp.replace(/\D/g, "");
    const comPais = digitos.startsWith("55") ? digitos : `55${digitos}`;
    const texto = encodeURIComponent(
      `Olá, ${cliente.nome}! Preparamos a proposta do seu churrasco com o SAL & TAL. ` +
        `Você pode conferir por aqui: ${linkCliente}`,
    );
    return `https://wa.me/${comPais}?text=${texto}`;
  }

  const foiEnviada = ["ENVIADA", "VISUALIZADA", "ACEITA", "RECUSADA", "EXPIRADA"].includes(
    status,
  );

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Coluna esquerda: campos */}
      <div className="space-y-6 lg:col-span-2">
        {/* Dados da proposta (visível ao cliente) */}
        <div className="cartao p-5 sm:p-6">
          <h2 className="mb-1 font-display text-lg font-semibold">
            Proposta ao cliente
          </h2>
          <p className="mb-5 text-xs text-white/40">
            Tudo nesta seção é o que o cliente enxerga. Custos ficam abaixo, em área
            confidencial.
          </p>

          <div className="space-y-4">
            <div>
              <label className="rotulo">Escopo / descrição da experiência</label>
              <textarea
                className="campo min-h-[110px]"
                disabled={!editavel}
                value={f.escopoDescricao}
                onChange={(e) => up("escopoDescricao", e.target.value)}
                placeholder="Descreva a experiência, os cortes e o serviço combinados para este evento."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="rotulo">Valor total ao cliente (R$) *</label>
                <input
                  className="campo"
                  inputMode="decimal"
                  disabled={!editavel}
                  value={f.valorTotal}
                  onChange={(e) => up("valorTotal", e.target.value)}
                  placeholder="Ex: 2.500,00"
                />
              </div>
              <div>
                <label className="rotulo">Válida até</label>
                <input
                  type="date"
                  className="campo"
                  disabled={!editavel}
                  value={f.validadeAte}
                  onChange={(e) => up("validadeAte", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="rotulo">Condições de pagamento</label>
              <input
                className="campo"
                disabled={!editavel}
                value={f.condicoesPagamento}
                onChange={(e) => up("condicoesPagamento", e.target.value)}
                placeholder="Ex: sinal de 50% para confirmar e 50% no dia do evento."
              />
            </div>

            <div>
              <label className="rotulo">Ressalvas</label>
              <textarea
                className="campo min-h-[70px]"
                disabled={!editavel}
                value={f.ressalvas}
                onChange={(e) => up("ressalvas", e.target.value)}
                placeholder="Ex: o valor pode ser ajustado após a confirmação dos detalhes do local (deslocamento/estrutura)."
              />
            </div>
          </div>
        </div>

        {/* Bloco confidencial: precificação */}
        <div className="cartao border-vinho/30 p-5 sm:p-6">
          <div className="mb-1 flex items-center gap-2">
            <h2 className="font-display text-lg font-semibold">
              Precificação interna
            </h2>
            <span className="rounded-md bg-vinho/15 px-2 py-0.5 text-xs text-vinho-suave">
              Confidencial
            </span>
          </div>
          <p className="mb-5 text-xs text-white/40">
            Estrutura editável para conferência. Não há cálculo automático de preço
            ou de quantidade — isso é definido por você.
          </p>

          {/* Tabela de insumos */}
          <div className="space-y-2">
            <div className="hidden gap-2 px-1 text-xs text-white/40 sm:grid sm:grid-cols-[1fr_80px_90px_110px_110px_32px]">
              <span>Insumo</span>
              <span>Qtd.</span>
              <span>Unid.</span>
              <span>Custo unit.</span>
              <span>Subtotal</span>
              <span />
            </div>

            {itens.map((it, idx) => {
              const subtotal =
                (parseNumeroBR(it.quantidade) ?? 0) * (parseNumeroBR(it.custoUnitario) ?? 0);
              return (
                <div
                  key={idx}
                  className="grid gap-2 sm:grid-cols-[1fr_80px_90px_110px_110px_32px]"
                >
                  <input
                    className="campo py-2"
                    disabled={!editavel}
                    value={it.insumo}
                    onChange={(e) => upItem(idx, "insumo", e.target.value)}
                    placeholder="Ex: Picanha"
                  />
                  <input
                    className="campo py-2"
                    inputMode="decimal"
                    disabled={!editavel}
                    value={it.quantidade}
                    onChange={(e) => upItem(idx, "quantidade", e.target.value)}
                    placeholder="Qtd."
                  />
                  <select
                    className="campo py-2"
                    disabled={!editavel}
                    value={it.unidade}
                    onChange={(e) => upItem(idx, "unidade", e.target.value)}
                  >
                    <option value="kg">kg</option>
                    <option value="unidade">unid.</option>
                  </select>
                  <input
                    className="campo py-2"
                    inputMode="decimal"
                    disabled={!editavel}
                    value={it.custoUnitario}
                    onChange={(e) => upItem(idx, "custoUnitario", e.target.value)}
                    placeholder="R$"
                  />
                  <div className="flex items-center px-1 text-sm text-creme/80">
                    {formatarReal(subtotal)}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    disabled={!editavel}
                    className="flex items-center justify-center rounded-lg border border-carvao-borda text-white/40 hover:text-red-400 disabled:opacity-40"
                    aria-label="Remover item"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          {editavel && (
            <button
              type="button"
              onClick={addItem}
              className="mt-3 text-sm text-vinho-suave hover:text-vinho-claro"
            >
              + Adicionar insumo
            </button>
          )}

          {/* Despesas e margem */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="rotulo">Despesas variáveis (R$)</label>
              <input
                className="campo"
                inputMode="decimal"
                disabled={!editavel}
                value={f.despesasVariaveis}
                onChange={(e) => up("despesasVariaveis", e.target.value)}
                placeholder="Ex: deslocamento"
              />
            </div>
            <div>
              <label className="rotulo">Despesas fixas (R$)</label>
              <input
                className="campo"
                inputMode="decimal"
                disabled={!editavel}
                value={f.despesasFixas}
                onChange={(e) => up("despesasFixas", e.target.value)}
              />
            </div>
            <div>
              <label className="rotulo">Margem (%) — referência</label>
              <input
                className="campo"
                inputMode="decimal"
                disabled={!editavel}
                value={f.margem}
                onChange={(e) => up("margem", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="rotulo mt-4">Observações internas</label>
            <textarea
              className="campo min-h-[70px]"
              disabled={!editavel}
              value={f.observacoesInternas}
              onChange={(e) => up("observacoesInternas", e.target.value)}
            />
          </div>

          {/* Resumo */}
          <div className="mt-6 rounded-xl border border-carvao-borda bg-carvao/50 p-4 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-white/50">Custo dos insumos</span>
              <span>{formatarReal(resumo.totalInsumos)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-white/50">+ Despesas (variáveis + fixas)</span>
              <span>{formatarReal(resumo.despesasVariaveis + resumo.despesasFixas)}</span>
            </div>
            <div className="flex justify-between border-t border-carvao-borda py-1">
              <span className="text-white/50">= Custo total</span>
              <span>{formatarReal(resumo.custoTotal)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-white/50">Receita (valor ao cliente)</span>
              <span>{formatarReal(resumo.receita)}</span>
            </div>
            <div className="mt-1 flex justify-between border-t border-carvao-borda py-1 font-semibold">
              <span className="text-vinho-suave">Resultado bruto (receita − custos)</span>
              <span className={resumo.resultadoBruto < 0 ? "text-red-400" : "text-emerald-300"}>
                {formatarReal(resumo.resultadoBruto)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Coluna direita: ações e link do cliente */}
      <div className="space-y-6">
        <div className="cartao p-5 sm:p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">Ações</h2>

          {msg && (
            <p
              className={`mb-4 rounded-lg px-3 py-2 text-sm ${
                msg.tipo === "ok"
                  ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border border-red-500/30 bg-red-500/10 text-red-300"
              }`}
            >
              {msg.texto}
            </p>
          )}

          {editavel ? (
            <div className="space-y-3">
              <button
                type="button"
                className="btn-ghost w-full"
                onClick={() => salvar()}
                disabled={salvando || enviando}
              >
                {salvando ? "Salvando..." : "Salvar rascunho"}
              </button>
              <button
                type="button"
                className="btn-vinho w-full"
                onClick={enviar}
                disabled={salvando || enviando}
              >
                {enviando ? "Enviando..." : foiEnviada ? "Salvar e reenviar" : "Enviar ao cliente"}
              </button>
            </div>
          ) : (
            <p className="rounded-lg border border-carvao-borda bg-carvao/50 px-3 py-2 text-sm text-white/60">
              Proposta encerrada ({status.toLowerCase()}). Para revisar, crie uma nova
              versão.
            </p>
          )}

          <div className="mt-4 border-t border-carvao-borda pt-4">
            <form action={duplicarProposta.bind(null, id)}>
              <button type="submit" className="text-sm text-white/50 hover:text-white/80">
                Duplicar em nova versão
              </button>
            </form>
          </div>
        </div>

        {/* Link do cliente (após enviar) */}
        {foiEnviada && (
          <div className="cartao p-5 sm:p-6">
            <h3 className="mb-3 font-display text-base font-semibold">
              Link do cliente
            </h3>
            <div className="mb-3 break-all rounded-lg border border-carvao-borda bg-carvao/50 px-3 py-2 text-xs text-creme/70">
              {linkCliente}
            </div>
            <div className="space-y-2">
              <button type="button" className="btn-ghost w-full text-sm" onClick={copiarLink}>
                {copiado ? "Link copiado!" : "Copiar link"}
              </button>
              <a
                href={linkWhatsApp()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-vinho w-full text-sm"
              >
                Enviar no WhatsApp
              </a>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={linkCliente}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost text-sm"
                >
                  Ver como cliente
                </a>
                <a
                  href={`/proposta/${tokenAcesso}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost text-sm"
                >
                  Baixar PDF
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Sinal (referência interna) */}
        <div className="cartao p-5 sm:p-6">
          <h3 className="mb-2 font-display text-base font-semibold">
            Sinal de garantia (50%)
          </h3>
          <p className="text-2xl font-bold text-creme">{formatarReal(sinal)}</p>
          <p className="mt-2 text-xs text-white/40">
            Solicitado após o Formulário 2. A proposta já avisa o cliente de forma
            discreta.
          </p>
        </div>
      </div>
    </div>
  );
}
