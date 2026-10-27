// Só no servidor. A moderação da Parede usa uma senha guardada em MODERACAO_SENHA (Vercel e .env.local).
import { createHash } from 'node:crypto';
import { cookies } from 'next/headers';

export const COOKIE_MODERACAO = 'parede_mod';

/** Valor do cookie: um hash da senha, para o cookie nunca carregar a senha em si. */
export const marcaModeracao = () =>
  createHash('sha256').update(`vira-lata:parede:${process.env.MODERACAO_SENHA ?? ''}`).digest('hex');

export async function autorizado() {
  if (!process.env.MODERACAO_SENHA) return false;
  return (await cookies()).get(COOKIE_MODERACAO)?.value === marcaModeracao();
}
