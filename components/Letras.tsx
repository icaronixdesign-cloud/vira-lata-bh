import type { CSSProperties, ElementType } from 'react';
import { semente, sinal, sorteador } from '@/lib/aleatorio';

export type Gesto = 'rolar' | 'pular' | 'carimbar' | 'datilografar' | 'sacudir' | 'sair';

/** Gestos que usam o sorteio --r (giro/desvio por letra); os outros dispensam o estilo extra. */
export const USA_R: ReadonlySet<string> = new Set(['carimbar', 'datilografar', 'sacudir', 'sair']);

type Props = {
  texto: string;
  gesto: Gesto;
  /** Tag HTML do bloco (h1, p, span…). */
  como?: ElementType;
  className?: string;
  /** Palavras que pulam mais alto e ganham marca-texto. */
  destaques?: string[];
  /** Atraso antes da primeira letra, em ms. */
  atraso?: number;
  /** Intervalo entre letras, em ms (cada gesto tem o seu padrão). */
  passo?: number;
  /** Textos longos: o servidor manda texto corrido; o navegador divide ao chegar na tela e junta de novo no fim. */
  preguicoso?: boolean;
  /** Letras balançam como rabo de cachorro no hover. */
  abanar?: boolean;
  /** Letras se afastam do cursor (só mouse). */
  farejar?: boolean;
  id?: string;
};

const limpa = (palavra: string) => palavra.toLocaleLowerCase('pt-BR').replace(/[^\p{L}\p{N}]/gu, '');

/**
 * Cada letra de cada palavra entra com um gesto do universo da casa.
 * As letras ficam `aria-hidden`; a frase inteira vai num texto oculto para leitor de tela e buscadores.
 * As palavras nunca quebram no meio. Sem JS, o texto aparece parado e legível.
 * Quando a última letra assenta, o texto volta a ser corrido (menos nós vivos no DOM);
 * só `abanar` e `farejar` continuam divididos, porque precisam das letras no hover.
 */
export function Letras({
  texto,
  gesto,
  como: Tag = 'span',
  className,
  destaques,
  atraso = 0,
  passo,
  preguicoso,
  abanar,
  farejar,
  id,
}: Props) {
  const estilo = {
    '--d0': `${atraso}ms`,
    ...(passo ? { '--passo': `${passo}ms` } : {}),
  } as CSSProperties;
  const classes = ['letras', abanar && 'abanar', className].filter(Boolean).join(' ');

  if (preguicoso) {
    return (
      <Tag
        className={classes}
        data-gesto={gesto}
        data-lazy=""
        data-destaques={destaques?.length ? destaques.join(',') : undefined}
        style={estilo}
        id={id}
      >
        <span className="v">{texto}</span>
      </Tag>
    );
  }

  const comR = USA_R.has(gesto);
  const sortear = sorteador(semente(texto));
  const marcadas = new Set((destaques ?? []).map(limpa));
  let n = 0;
  const partes = texto.split(/(\s+)/).filter(Boolean);

  return (
    <Tag className={classes} data-gesto={gesto} data-farejar={farejar ? '' : undefined} style={estilo} id={id}>
      <span className="sr">{texto}</span>
      <span className="v" aria-hidden="true">
        {partes.map((parte, k) =>
          /^\s+$/.test(parte) ? (
            ' '
          ) : (
            <span className={marcadas.has(limpa(parte)) ? 'w k' : 'w'} key={k}>
              {Array.from(parte).map((ch) => {
                const i = n++;
                const vars: Record<string, string | number> = { '--i': i };
                if (comR) vars['--r'] = sinal(sortear);
                return (
                  <span className="l" key={i} style={vars as CSSProperties}>
                    {ch}
                  </span>
                );
              })}
            </span>
          ),
        )}
      </span>
    </Tag>
  );
}
