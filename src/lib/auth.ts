import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { COOKIE_NOME } from "./constantes";

const DURACAO_SEGUNDOS = 60 * 60 * 8; // 8 horas

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET não configurado no ambiente (.env).");
  }
  return new TextEncoder().encode(secret);
}

export interface SessaoAdmin {
  id: string;
  login: string;
  nome: string;
}

/** Gera o hash de uma senha (usado no cadastro/seed). */
export async function gerarHashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, 10);
}

/** Confere uma senha contra o hash armazenado. */
export async function conferirSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}

/** Cria a sessão do admin (cookie httpOnly assinado). */
export async function criarSessao(admin: SessaoAdmin): Promise<void> {
  const token = await new SignJWT({ ...admin })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DURACAO_SEGUNDOS}s`)
    .sign(getSecret());

  cookies().set(COOKIE_NOME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACAO_SEGUNDOS,
  });
}

/** Encerra a sessão. */
export function encerrarSessao(): void {
  cookies().delete(COOKIE_NOME);
}

/** Lê e valida a sessão a partir do cookie. Retorna null se não autenticado. */
export async function lerSessao(): Promise<SessaoAdmin | null> {
  const token = cookies().get(COOKIE_NOME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      id: String(payload.id),
      login: String(payload.login),
      nome: String(payload.nome),
    };
  } catch {
    return null;
  }
}
