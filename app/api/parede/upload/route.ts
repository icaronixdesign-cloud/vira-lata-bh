export const fetchCache = 'force-no-store';

import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { PAREDE_ATIVA, passouDoLimite } from '@/lib/parede';

// Gera o token para o navegador mandar a foto direto para o Blob (sem passar pelo limite de corpo da função).
export async function POST(request: Request) {
  if (!PAREDE_ATIVA) return Response.json({ error: 'A Parede está fechada para envios agora.' }, { status: 503 });
  const body = (await request.json()) as HandleUploadBody;
  try {
    const resposta = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith('parede/fotos/')) throw new Error('Caminho inválido.');
        if (passouDoLimite(request)) throw new Error('Muitos envios seguidos. Tente de novo daqui a pouco.');
        return {
          allowedContentTypes: ['image/webp', 'image/jpeg', 'image/png'],
          maximumSizeInBytes: 3 * 1024 * 1024,
          addRandomSuffix: true,
          validUntil: Date.now() + 10 * 60 * 1000,
        };
      },
    });
    return Response.json(resposta);
  } catch (erro) {
    return Response.json({ error: (erro as Error).message }, { status: 400 });
  }
}
