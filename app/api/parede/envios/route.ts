export const fetchCache = 'force-no-store';

import { PAREDE_ATIVA, fotoValida, limpa, passouDoLimite, salvarPendente } from '@/lib/parede';

// Registra o envio como pendente. A foto já está no Blob; aqui só entram os dados e o consentimento.
export async function POST(request: Request) {
  if (!PAREDE_ATIVA) return Response.json({ error: 'A Parede está fechada para envios agora.' }, { status: 503 });
  const dados = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!dados) return Response.json({ error: 'Envio vazio.' }, { status: 400 });

  // Campo-isca: gente não vê, robô preenche. Fingimos que deu certo.
  if (limpa(dados.site, 200)) return Response.json({ ok: true });
  if (passouDoLimite(request)) return Response.json({ error: 'Muitos envios seguidos. Tente de novo daqui a pouco.' }, { status: 429 });

  const nome = limpa(dados.nome, 40);
  const frase = limpa(dados.frase, 120);
  const tutor = limpa(dados.tutor, 60);
  const foto = String(dados.foto ?? '');

  if (!nome) return Response.json({ error: 'Faltou o nome do cachorro.' }, { status: 400 });
  if (!fotoValida(foto)) return Response.json({ error: 'A foto não chegou direito. Tente de novo.' }, { status: 400 });
  if (dados.consentimento !== true) return Response.json({ error: 'Precisamos da sua autorização para mostrar a foto.' }, { status: 400 });

  try {
    await salvarPendente({
      id: crypto.randomUUID(),
      nome,
      frase: frase || undefined,
      tutor: tutor || undefined,
      foto,
      criado: new Date().toISOString(),
      consentimento: true,
    });
  } catch (erro) {
    console.error('[parede] envio falhou', erro);
    return Response.json({ error: 'A Parede está movimentada agora. Tente de novo em instantes.' }, { status: 503 });
  }
  return Response.json({ ok: true });
}
