// Só no servidor. Guarda os envios da Parede no Vercel Blob:
//   parede/fotos/…              fotos (WebP, nome com sufixo aleatório)
//   parede/indice/00000042.json a lista de envios, uma versão nova a cada mudança
//
// Por que versões numeradas: arquivo sobrescrito em loja pública é servido pela CDN com a versão
// anterior por até um minuto. Aqui nada é sobrescrito; a versão atual é a de maior número na listagem
// (consulta à API, sem CDN), e gravar a versão N+1 só funciona para quem chegar primeiro: se duas
// mudanças disputarem o mesmo número, a segunda é recusada, relê e tenta de novo.
// Dados mínimos (LGPD): foto, nome do cachorro, frase e, se a pessoa quiser, o nome dela. Sem contato, sem IP.
import { del, head, list, put } from '@vercel/blob';
import { unstable_rethrow } from 'next/navigation';
import { estilo, type Quadro } from '@/content/parede';

export const PAREDE_ATIVA = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

const PASTA = 'parede/indice/';
const MANTER = 30;

export type Envio = {
  id: string;
  status: 'pendente' | 'aprovado';
  nome: string;
  frase?: string;
  tutor?: string;
  foto: string;
  criado: string;
  aprovado?: string;
  consentimento: true;
};

type Indice = { envios: Envio[] };
type Versao = { n: number; url: string };

const debug = (...partes: unknown[]) => {
  if (process.env.PAREDE_DEBUG) console.log('[parede]', ...partes);
};
const espera = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const caminhoDa = (n: number) => `${PASTA}${String(n).padStart(8, '0')}.json`;
const numeroDe = (pathname: string) => Number(pathname.slice(PASTA.length, -'.json'.length));

/** Todas as versões do índice, da mais nova para a mais velha. */
async function versoes(): Promise<Versao[]> {
  const todas: Versao[] = [];
  let cursor: string | undefined;
  do {
    const pagina = await list({ prefix: PASTA, cursor, limit: 1000 });
    for (const b of pagina.blobs) {
      const n = numeroDe(b.pathname);
      if (Number.isInteger(n) && n > 0) todas.push({ n, url: b.url });
    }
    cursor = pagina.hasMore ? pagina.cursor : undefined;
  } while (cursor);
  return todas.sort((a, b) => b.n - a.n);
}

/**
 * Lê a versão mais nova. Sem nenhuma versão ainda, a Parede está vazia (n = 0).
 * `mostrar`: usado nas páginas com ISR; cada versão tem endereço próprio e nunca muda, então pode ficar
 * no cache do Next (um fetch sem cache tiraria a página do modo estático).
 * `gravar`: usado pelo envio e pela moderação (rotas dinâmicas); sempre direto da origem.
 */
async function lerIndice(modo: 'gravar' | 'mostrar' = 'gravar'): Promise<{ indice: Indice; n: number }> {
  const [atual] = await versoes();
  if (!atual) return { indice: { envios: [] }, n: 0 };
  // Arquivo recém-criado pode levar um instante para responder na origem.
  const tentativas = modo === 'gravar' ? 6 : 1;
  for (let tentativa = 0; tentativa < tentativas; tentativa++) {
    const resposta = await fetch(atual.url, modo === 'gravar' ? { cache: 'no-store' } : { cache: 'force-cache' });
    if (resposta.ok) {
      const indice = (await resposta.json()) as Indice;
      if (!Array.isArray(indice.envios)) throw new Error('Índice da Parede corrompido.');
      debug('leu versão', atual.n, indice.envios.length, 'envios', modo);
      return { indice, n: atual.n };
    }
    if (tentativa < tentativas - 1) await espera(250);
  }
  throw new Error('O índice da Parede não respondeu. Tente de novo.');
}

/** Apaga as versões antigas, guardando as mais recentes para conferência. */
async function podaVersoes() {
  const antigas = (await versoes()).slice(MANTER);
  if (antigas.length) await del(antigas.map((v) => v.url));
}

/**
 * Lê, muda e grava a próxima versão. Se outra mudança já criou esse número, relê e tenta de novo.
 * `muda` pode devolver `null` para desistir sem gravar (ex.: o envio não está mais no índice).
 */
async function altera(muda: (indice: Indice) => Indice | null) {
  for (let tentativa = 0; tentativa < 8; tentativa++) {
    const { indice, n } = await lerIndice();
    const novo = muda(indice);
    if (!novo) return false;
    const caminho = caminhoDa(n + 1);
    try {
      await put(caminho, JSON.stringify(novo), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: false,
        cacheControlMaxAge: 31536000,
      });
    } catch (erro) {
      // Só tentamos de novo se o número realmente já existe (outra mudança passou na frente).
      const existe = await head(caminho).then(
        () => true,
        () => false,
      );
      if (!existe) throw erro;
      debug('versão', n + 1, 'já existe; relendo');
      await espera(200 * (tentativa + 1));
      continue;
    }
    debug('gravou versão', n + 1, 'com', novo.envios.length, 'envios');
    await podaVersoes().catch(() => undefined);
    return true;
  }
  throw new Error('A Parede está movimentada agora. Tente de novo.');
}

const recentesPrimeiro = (a: Envio, b: Envio) => b.criado.localeCompare(a.criado);

/**
 * Uma leitura só, dividida em fila e parede. Na dúvida, mostra vazio (exibir nunca grava nada).
 * `modo`: `mostrar` nas páginas públicas (com cache), `gravar` na moderação (sempre fresco).
 */
export async function listaDaParede(modo: 'gravar' | 'mostrar' = 'mostrar') {
  let envios: Envio[] = [];
  if (PAREDE_ATIVA) {
    try {
      envios = (await lerIndice(modo)).indice.envios;
    } catch (erro) {
      unstable_rethrow(erro); // erros internos do Next (ex.: renderização dinâmica) seguem adiante
      console.error('[parede] leitura falhou', erro);
    }
  }
  return {
    pendentes: envios.filter((e) => e.status === 'pendente').sort(recentesPrimeiro),
    aprovados: envios
      .filter((e) => e.status === 'aprovado')
      .sort((a, b) => (b.aprovado ?? '').localeCompare(a.aprovado ?? '')),
  };
}

export const pendentes = async () => (await listaDaParede()).pendentes;
export const aprovados = async () => (await listaDaParede()).aprovados;

export async function salvarPendente(envio: Omit<Envio, 'status'>) {
  await altera((indice) => ({ envios: [{ ...envio, status: 'pendente' }, ...indice.envios] }));
}

export async function aprovar(id: string) {
  const agora = new Date().toISOString();
  return altera((indice) =>
    indice.envios.some((e) => e.id === id && e.status === 'pendente')
      ? { envios: indice.envios.map((e) => (e.id === id ? { ...e, status: 'aprovado', aprovado: agora } : e)) }
      : null,
  );
}

/** Recusa um pendente ou tira da parede um aprovado: sai do índice e a foto é apagada. */
export async function remover(id: string) {
  let foto: string | undefined;
  const removeu = await altera((indice) => {
    const envio = indice.envios.find((e) => e.id === id);
    if (!envio) return null;
    foto = envio.foto;
    return { envios: indice.envios.filter((e) => e.id !== id) };
  });
  if (removeu && foto) await del(foto).catch(() => undefined);
  return removeu;
}

export const paraQuadro = (envio: Envio, i: number): Quadro => ({
  id: envio.id,
  nome: envio.nome,
  frase: envio.frase,
  tutor: envio.tutor,
  foto: envio.foto,
  ...estilo(i),
});

/** Só aceitamos fotos que vieram do nosso próprio armazenamento. */
export function fotoValida(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && u.hostname.endsWith('.public.blob.vercel-storage.com') && u.pathname.startsWith('/parede/fotos/');
  } catch {
    return false;
  }
}

/** Limpa texto livre: tira caracteres de controle e sinais de tag, junta espaços e corta no tamanho. */
export function limpa(valor: unknown, max: number) {
  return String(valor ?? '')
    .replace(/[\u0000-\u001f\u007f<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

// Limite simples por IP, em memória (vale por instância; a moderação segura o resto).
const recentes = new Map<string, number[]>();
export function passouDoLimite(request: Request, maximo = 6, janelaMs = 10 * 60 * 1000) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const agora = Date.now();
  const lista = (recentes.get(ip) ?? []).filter((t) => agora - t < janelaMs);
  lista.push(agora);
  recentes.set(ip, lista);
  return lista.length > maximo;
}
