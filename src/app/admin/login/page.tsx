"use client";

import { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { entrar } from "./acoes";

function FormularioLogin() {
  const router = useRouter();
  const params = useSearchParams();
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();

  function submeter(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    iniciar(async () => {
      const res = await entrar(login, senha);
      if (res.ok) {
        const destino = params.get("redirecionar") || "/admin";
        router.push(destino);
        router.refresh();
      } else {
        setErro(res.mensagem ?? "Não foi possível entrar.");
      }
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/logo-horizontal.jpg"
            alt="SAL & TAL — O Churrasco"
            className="mx-auto h-14 w-auto"
          />
          <p className="mt-4 text-sm uppercase tracking-[0.2em] text-brasa-claro">
            Área da equipe
          </p>
        </div>

        <form onSubmit={submeter} className="cartao space-y-4 p-6">
          <div>
            <label className="rotulo" htmlFor="login">
              Login
            </label>
            <input
              id="login"
              className="campo"
              autoComplete="username"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />
          </div>
          <div>
            <label className="rotulo" htmlFor="senha">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              className="campo"
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          {erro && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {erro}
            </p>
          )}

          <button type="submit" className="btn-brasa w-full" disabled={enviando}>
            {enviando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function PaginaLogin() {
  return (
    <Suspense>
      <FormularioLogin />
    </Suspense>
  );
}
