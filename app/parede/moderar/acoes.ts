'use server';

import { timingSafeEqual } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE_MODERACAO, autorizado, marcaModeracao } from '@/lib/moderacao';
import { aprovar, remover } from '@/lib/parede';

export async function entrar(form: FormData) {
  const senha = Buffer.from(String(form.get('senha') ?? ''));
  const certa = Buffer.from(process.env.MODERACAO_SENHA ?? '');
  if (!certa.length || senha.length !== certa.length || !timingSafeEqual(senha, certa)) {
    redirect('/parede/moderar?erro=1');
  }
  (await cookies()).set(COOKIE_MODERACAO, marcaModeracao(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/parede/moderar',
    maxAge: 60 * 60 * 8,
  });
  redirect('/parede/moderar');
}

export async function sair() {
  (await cookies()).delete({ name: COOKIE_MODERACAO, path: '/parede/moderar' });
  redirect('/parede/moderar');
}

function atualizaParede() {
  revalidatePath('/parede');
  revalidatePath('/');
  revalidatePath('/parede/moderar');
}

export async function aprovarEnvio(form: FormData) {
  if (!(await autorizado())) redirect('/parede/moderar');
  try {
    await aprovar(String(form.get('id') ?? ''));
  } catch (erro) {
    console.error('[parede] aprovar falhou', erro);
    redirect('/parede/moderar?aviso=1');
  }
  atualizaParede();
}

export async function removerEnvio(form: FormData) {
  if (!(await autorizado())) redirect('/parede/moderar');
  try {
    await remover(String(form.get('id') ?? ''));
  } catch (erro) {
    console.error('[parede] remover falhou', erro);
    redirect('/parede/moderar?aviso=1');
  }
  atualizaParede();
}
