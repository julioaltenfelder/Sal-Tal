"use server";

import { prisma } from "@/lib/db";
import { conferirSenha, criarSessao } from "@/lib/auth";

export interface ResultadoLogin {
  ok: boolean;
  mensagem?: string;
}

export async function entrar(
  login: string,
  senha: string,
): Promise<ResultadoLogin> {
  const loginLimpo = login.trim().toLowerCase();
  if (!loginLimpo || !senha) {
    return { ok: false, mensagem: "Informe login e senha." };
  }

  const usuario = await prisma.usuarioAdmin.findUnique({
    where: { login: loginLimpo },
  });

  // Mesma mensagem para usuário inexistente ou senha errada (não revela qual falhou)
  if (!usuario || !usuario.ativo) {
    return { ok: false, mensagem: "Login ou senha incorretos." };
  }

  const ok = await conferirSenha(senha, usuario.senhaHash);
  if (!ok) {
    return { ok: false, mensagem: "Login ou senha incorretos." };
  }

  await criarSessao({ id: usuario.id, login: usuario.login, nome: usuario.nome });
  return { ok: true };
}
