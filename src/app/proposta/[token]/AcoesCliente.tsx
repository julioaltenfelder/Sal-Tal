"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { aceitarProposta, recusarProposta } from "./acoes";

export default function AcoesCliente({ token }: { token: string }) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState<null | "aceitar" | "recusar">(null);
  const [erro, setErro] = useState<string | null>(null);
  const [processando, iniciar] = useTransition();

  function confirmar() {
    setErro(null);
    iniciar(async () => {
      const res =
        confirmando === "aceitar"
          ? await aceitarProposta(token)
          : await recusarProposta(token);
      if (res.ok) {
        setConfirmando(null);
        router.refresh();
      } else {
        setErro(res.mensagem ?? "Não foi possível concluir. Tente novamente.");
      }
    });
  }

  return (
    <div className="cartao-creme p-6">
      <h3 className="mb-2 font-display text-lg font-semibold text-tinta">
        O que achou da proposta?
      </h3>
      <p className="mb-5 text-sm text-tinta-suave">
        Você pode aceitar para seguirmos com a preparação, ou recusar. Qualquer
        dúvida, fale com a nossa equipe no WhatsApp.
      </p>

      {erro && (
        <p className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </p>
      )}

      {confirmando === null ? (
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="btn-vinho flex-1"
            onClick={() => setConfirmando("aceitar")}
          >
            Aceitar proposta
          </button>
          <button
            type="button"
            className="btn-outline-escuro flex-1"
            onClick={() => setConfirmando("recusar")}
          >
            Recusar
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-tinta/15 bg-white/40 p-4">
          <p className="mb-4 text-sm text-tinta">
            {confirmando === "aceitar"
              ? "Confirmar o aceite desta proposta? Em seguida seguimos com os detalhes do evento."
              : "Tem certeza de que deseja recusar esta proposta?"}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              className={confirmando === "aceitar" ? "btn-vinho" : "btn-outline-escuro"}
              onClick={confirmar}
              disabled={processando}
            >
              {processando
                ? "Processando..."
                : confirmando === "aceitar"
                  ? "Sim, aceitar"
                  : "Sim, recusar"}
            </button>
            <button
              type="button"
              className="btn-outline-escuro"
              onClick={() => setConfirmando(null)}
              disabled={processando}
            >
              Voltar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
