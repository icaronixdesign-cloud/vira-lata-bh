// Sorteio estável: o servidor e o navegador tiram os mesmos números para o mesmo texto,
// então cada letra tem sempre o mesmo "jeito" (giro, atraso) e a hidratação não diverge.

export function semente(texto: string): number {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function sorteador(seed: number) {
  let a = seed || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Valor entre -1 e 1 com 2 casas, pronto para virar variável CSS. */
export const sinal = (sortear: () => number) => (sortear() * 2 - 1).toFixed(2);
