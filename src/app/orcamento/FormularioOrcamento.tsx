"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { OCASIOES } from "@/lib/formularios";
import { enviarSolicitacao } from "./acoes";

interface DataOpcao {
  valor: string;
  rotulo: string;
}

interface Props {
  maxAdultos: number;
  maxCriancas: number;
  datasDisponiveis: DataOpcao[];
}

interface Estado {
  nome: string;
  whatsapp: string;
  dataEvento: string;
  ocasiao: string;
  ocasiaoOutro: string;
  numAdultos: string;
  temCriancas: "" | "Sim" | "Não";
  numCriancas: string;
  temRestricoes: "" | "Sim" | "Não";
  restricoesDetalhe: string;
  temChurrasqueira: "" | "Sim" | "Não";
  endereco: string;
}

const ESTADO_INICIAL: Estado = {
  nome: "",
  whatsapp: "",
  dataEvento: "",
  ocasiao: "",
  ocasiaoOutro: "",
  numAdultos: "",
  temCriancas: "",
  numCriancas: "",
  temRestricoes: "",
  restricoesDetalhe: "",
  temChurrasqueira: "",
  endereco: "",
};

const TOTAL_PASSOS = 4;

export default function FormularioOrcamento({
  maxAdultos,
  maxCriancas,
  datasDisponiveis,
}: Props) {
  const router = useRouter();
  const [passo, setPasso] = useState(1);
  const [form, setForm] = useState<Estado>(ESTADO_INICIAL);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, iniciarEnvio] = useTransition();

  function set<K extends keyof Estado>(campo: K, valor: Estado[K]) {
    setForm((f) => ({ ...f, [campo]: valor }));
    setErros((e) => {
      const novo = { ...e };
      delete novo[campo];
      return novo;
    });
  }

  // Validação do passo atual (no navegador). O servidor revalida tudo.
  function validarPasso(p: number): boolean {
    const e: Record<string, string> = {};
    if (p === 1) {
      if (form.nome.trim().length < 2) e.nome = "Informe o nome completo.";
      if (form.whatsapp.trim().length < 8)
        e.whatsapp = "Informe um WhatsApp válido com DDD.";
    }
    if (p === 2) {
      if (!form.dataEvento) e.dataEvento = "Selecione a data do evento.";
      if (!form.ocasiao) e.ocasiao = "Selecione a ocasião.";
      if (form.ocasiao === "Outro" && !form.ocasiaoOutro.trim())
        e.ocasiaoOutro = "Qual é a ocasião do evento?";
    }
    if (p === 3) {
      const n = Number(form.numAdultos);
      if (!form.numAdultos || Number.isNaN(n) || n < 1)
        e.numAdultos = "Informe o número de adultos.";
      else if (!Number.isInteger(n)) e.numAdultos = "Use um número inteiro.";
      else if (n > maxAdultos) e.numAdultos = `Nosso limite é de ${maxAdultos} adultos`;
      if (!form.temCriancas) e.temCriancas = "Selecione uma opção.";
      if (form.temCriancas === "Sim") {
        const c = Number(form.numCriancas);
        if (!form.numCriancas || Number.isNaN(c) || c < 1)
          e.numCriancas = "Informe quantas crianças.";
        else if (c > maxCriancas) e.numCriancas = `Máximo de ${maxCriancas}.`;
      }
    }
    if (p === 4) {
      if (!form.temRestricoes) e.temRestricoes = "Selecione uma opção.";
      if (form.temRestricoes === "Sim" && !form.restricoesDetalhe.trim())
        e.restricoesDetalhe = "Descreva as restrições alimentares.";
      if (!form.temChurrasqueira) e.temChurrasqueira = "Selecione uma opção.";
      if (form.endereco.trim().length < 8)
        e.endereco = "Informe o endereço completo do evento.";
    }
    setErros(e);
    return Object.keys(e).length === 0;
  }

  function proximo() {
    if (validarPasso(passo)) {
      setPasso((p) => Math.min(p + 1, TOTAL_PASSOS));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function anterior() {
    setErroGeral(null);
    setPasso((p) => Math.max(p - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function enviar() {
    if (!validarPasso(4)) return;
    setErroGeral(null);

    const payload = {
      nome: form.nome,
      whatsapp: form.whatsapp,
      dataEvento: form.dataEvento,
      ocasiao: form.ocasiao,
      ocasiaoOutro: form.ocasiaoOutro || undefined,
      numAdultos: Number(form.numAdultos),
      temCriancas: form.temCriancas === "Sim",
      numCriancas:
        form.temCriancas === "Sim" ? Number(form.numCriancas) : undefined,
      temRestricoes: form.temRestricoes === "Sim",
      restricoesDetalhe:
        form.temRestricoes === "Sim" ? form.restricoesDetalhe : undefined,
      temChurrasqueira: form.temChurrasqueira === "Sim",
      endereco: form.endereco,
    };

    iniciarEnvio(async () => {
      const res = await enviarSolicitacao(payload);
      if (res.ok) {
        router.push("/orcamento/sucesso");
      } else if (res.erros) {
        setErros(res.erros);
        // Volta ao passo do primeiro erro
        const campo = Object.keys(res.erros)[0];
        const mapa: Record<string, number> = {
          nome: 1,
          whatsapp: 1,
          dataEvento: 2,
          ocasiao: 2,
          ocasiaoOutro: 2,
          numAdultos: 3,
          temCriancas: 3,
          numCriancas: 3,
          temRestricoes: 4,
          restricoesDetalhe: 4,
          temChurrasqueira: 4,
          endereco: 4,
        };
        setPasso(mapa[campo] ?? passo);
      } else {
        setErroGeral(res.mensagem ?? "Algo deu errado. Tente novamente.");
      }
    });
  }

  return (
    <div className="cartao p-5 sm:p-8">
      {/* Progresso */}
      <div className="mb-8">
        <div className="mb-2 flex justify-between text-xs text-white/40">
          <span>
            Passo {passo} de {TOTAL_PASSOS}
          </span>
          <span>{Math.round((passo / TOTAL_PASSOS) * 100)}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-carvao-medio">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brasa-amarelo to-brasa transition-all"
            style={{ width: `${(passo / TOTAL_PASSOS) * 100}%` }}
          />
        </div>
      </div>

      {/* PASSO 1 — Identificação */}
      {passo === 1 && (
        <div className="space-y-5">
          <h2 className="font-display text-xl font-semibold">Quem é o anfitrião?</h2>
          <div>
            <label className="rotulo" htmlFor="nome">
              Nome completo *
            </label>
            <input
              id="nome"
              className="campo"
              value={form.nome}
              onChange={(e) => set("nome", e.target.value)}
              placeholder="Seu nome completo"
            />
            {erros.nome && <p className="erro">{erros.nome}</p>}
          </div>
          <div>
            <label className="rotulo" htmlFor="whatsapp">
              WhatsApp (com DDD) *
            </label>
            <input
              id="whatsapp"
              className="campo"
              inputMode="tel"
              value={form.whatsapp}
              onChange={(e) => set("whatsapp", e.target.value)}
              placeholder="Ex: 12 99123-4567"
            />
            {erros.whatsapp && <p className="erro">{erros.whatsapp}</p>}
          </div>
        </div>
      )}

      {/* PASSO 2 — Data e ocasião */}
      {passo === 2 && (
        <div className="space-y-6">
          <h2 className="font-display text-xl font-semibold">Data e ocasião</h2>
          <div>
            <label className="rotulo" htmlFor="dataEvento">
              Data prevista para o evento *
            </label>
            {datasDisponiveis.length === 0 ? (
              <p className="rounded-xl border border-carvao-borda bg-carvao/60 px-4 py-3 text-sm text-white/50">
                No momento não há datas abertas. Fale com a gente pelo WhatsApp.
              </p>
            ) : (
              <select
                id="dataEvento"
                className="campo"
                value={form.dataEvento}
                onChange={(e) => set("dataEvento", e.target.value)}
              >
                <option value="">Selecione uma data disponível</option>
                {datasDisponiveis.map((d) => (
                  <option key={d.valor} value={d.valor}>
                    {d.rotulo}
                  </option>
                ))}
              </select>
            )}
            <p className="dica">
              A data solicitada não gera confirmação automática. A equipe verifica
              a agenda antes de assumir qualquer compromisso.
            </p>
            {erros.dataEvento && <p className="erro">{erros.dataEvento}</p>}
          </div>

          <div>
            <span className="rotulo">Ocasião do evento *</span>
            <div className="grid gap-2 sm:grid-cols-2">
              {OCASIOES.map((op) => (
                <label
                  key={op}
                  className={`opcao ${form.ocasiao === op ? "opcao-ativa" : ""}`}
                >
                  <input
                    type="radio"
                    name="ocasiao"
                    className="accent-brasa"
                    checked={form.ocasiao === op}
                    onChange={() => set("ocasiao", op)}
                  />
                  <span className="text-sm">{op}</span>
                </label>
              ))}
            </div>
            {erros.ocasiao && <p className="erro">{erros.ocasiao}</p>}

            {form.ocasiao === "Outro" && (
              <div className="mt-3">
                <label className="rotulo" htmlFor="ocasiaoOutro">
                  Qual é a ocasião do evento? *
                </label>
                <input
                  id="ocasiaoOutro"
                  className="campo"
                  value={form.ocasiaoOutro}
                  onChange={(e) => set("ocasiaoOutro", e.target.value)}
                />
                {erros.ocasiaoOutro && <p className="erro">{erros.ocasiaoOutro}</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PASSO 3 — Convidados */}
      {passo === 3 && (
        <div className="space-y-6">
          <h2 className="font-display text-xl font-semibold">Quantidade de convidados</h2>
          <div>
            <label className="rotulo" htmlFor="numAdultos">
              Número de adultos *
            </label>
            <input
              id="numAdultos"
              className="campo"
              inputMode="numeric"
              value={form.numAdultos}
              onChange={(e) =>
                set("numAdultos", e.target.value.replace(/\D/g, ""))
              }
              placeholder="Ex: 15"
            />
            <p className="dica">Nosso limite é de {maxAdultos} adultos.</p>
            {erros.numAdultos && <p className="erro">{erros.numAdultos}</p>}
          </div>

          <div>
            <span className="rotulo">Haverá crianças?</span>
            <div className="grid grid-cols-2 gap-2">
              {(["Não", "Sim"] as const).map((op) => (
                <label
                  key={op}
                  className={`opcao justify-center ${
                    form.temCriancas === op ? "opcao-ativa" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="temCriancas"
                    className="accent-brasa"
                    checked={form.temCriancas === op}
                    onChange={() => set("temCriancas", op)}
                  />
                  <span className="text-sm">{op}</span>
                </label>
              ))}
            </div>
            {erros.temCriancas && <p className="erro">{erros.temCriancas}</p>}
          </div>

          {form.temCriancas === "Sim" && (
            <div>
              <label className="rotulo" htmlFor="numCriancas">
                Quantas crianças (até 12 anos)?
              </label>
              <input
                id="numCriancas"
                className="campo"
                inputMode="numeric"
                value={form.numCriancas}
                onChange={(e) =>
                  set("numCriancas", e.target.value.replace(/\D/g, ""))
                }
                placeholder="Ex: 4"
              />
              {erros.numCriancas && <p className="erro">{erros.numCriancas}</p>}
            </div>
          )}
        </div>
      )}

      {/* PASSO 4 — Restrições, infraestrutura e localização */}
      {passo === 4 && (
        <div className="space-y-6">
          <h2 className="font-display text-xl font-semibold">Últimos detalhes</h2>

          <div>
            <span className="rotulo">
              Existem restrições alimentares ou necessidades específicas entre os
              convidados? *
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(["Não", "Sim"] as const).map((op) => (
                <label
                  key={op}
                  className={`opcao justify-center ${
                    form.temRestricoes === op ? "opcao-ativa" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="temRestricoes"
                    className="accent-brasa"
                    checked={form.temRestricoes === op}
                    onChange={() => set("temRestricoes", op)}
                  />
                  <span className="text-sm">{op}</span>
                </label>
              ))}
            </div>
            {erros.temRestricoes && <p className="erro">{erros.temRestricoes}</p>}

            {form.temRestricoes === "Sim" && (
              <div className="mt-3">
                <label className="rotulo" htmlFor="restricoesDetalhe">
                  Informe:
                </label>
                <textarea
                  id="restricoesDetalhe"
                  className="campo min-h-[90px]"
                  value={form.restricoesDetalhe}
                  onChange={(e) => set("restricoesDetalhe", e.target.value)}
                  placeholder="Inclua: tipo de restrição (alergia, vegetariano, vegano, religiosa, outra), quantidade de pessoas envolvidas e detalhes relevantes."
                />
                {erros.restricoesDetalhe && (
                  <p className="erro">{erros.restricoesDetalhe}</p>
                )}
              </div>
            )}
          </div>

          <div>
            <span className="rotulo">Há churrasqueira disponível no local? *</span>
            <div className="grid grid-cols-2 gap-2">
              {(["Sim", "Não"] as const).map((op) => (
                <label
                  key={op}
                  className={`opcao justify-center ${
                    form.temChurrasqueira === op ? "opcao-ativa" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="temChurrasqueira"
                    className="accent-brasa"
                    checked={form.temChurrasqueira === op}
                    onChange={() => set("temChurrasqueira", op)}
                  />
                  <span className="text-sm">{op}</span>
                </label>
              ))}
            </div>
            <p className="dica">
              Detalhes sobre tipo, tamanho e condições serão coletados depois.
            </p>
            {erros.temChurrasqueira && (
              <p className="erro">{erros.temChurrasqueira}</p>
            )}
          </div>

          <div>
            <label className="rotulo" htmlFor="endereco">
              Endereço completo do evento *
            </label>
            <textarea
              id="endereco"
              className="campo min-h-[80px]"
              value={form.endereco}
              onChange={(e) => set("endereco", e.target.value)}
              placeholder="Rua, número, bairro, complemento"
            />
            <p className="dica">
              Essencial para elaboração da proposta, considerando custos de
              deslocamento e logística.
            </p>
            {erros.endereco && <p className="erro">{erros.endereco}</p>}
          </div>
        </div>
      )}

      {erroGeral && (
        <p className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {erroGeral}
        </p>
      )}

      {/* Navegação */}
      <div className="mt-8 flex items-center justify-between gap-3">
        {passo > 1 ? (
          <button type="button" className="btn-ghost" onClick={anterior}>
            Voltar
          </button>
        ) : (
          <span />
        )}

        {passo < TOTAL_PASSOS ? (
          <button type="button" className="btn-brasa" onClick={proximo}>
            Continuar
          </button>
        ) : (
          <button
            type="button"
            className="btn-brasa"
            onClick={enviar}
            disabled={enviando}
          >
            {enviando ? "Enviando..." : "Enviar solicitação"}
          </button>
        )}
      </div>
    </div>
  );
}
