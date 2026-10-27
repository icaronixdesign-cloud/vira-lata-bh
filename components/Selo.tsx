import type { CSSProperties } from 'react';
import { Cachorro } from './Cachorro';

// Posição de cada letra no círculo, como no selo da casa: VIRA por cima, LATA por baixo (lendo da esquerda).
// `a` é o ângulo; `baixo` põe a letra na metade de baixo, de pé para quem lê.
const LETRAS = [
  { ch: 'V', a: -64, baixo: false },
  { ch: 'I', a: -31, baixo: false },
  { ch: 'R', a: 0, baixo: false },
  { ch: 'A', a: 36, baixo: false },
  { ch: 'L', a: 62, baixo: true },
  { ch: 'A', a: 28, baixo: true },
  { ch: 'T', a: -6, baixo: true },
  { ch: 'A', a: -42, baixo: true },
];

type Props = {
  /** Diâmetro (qualquer medida CSS). */
  tamanho: string;
  /** Monta o selo como no destaque da casa: as letras rolam até a linha e se curvam no círculo. */
  animado?: boolean;
  /** Gira devagar (pausa fora da tela). */
  girar?: boolean;
  olhar?: boolean;
  className?: string;
};

export function Selo({ tamanho, animado, girar, olhar, className }: Props) {
  return (
    <div
      className={['selo', animado && 'selo-anima', girar && 'selo-gira', className].filter(Boolean).join(' ')}
      style={{ '--selo': tamanho } as CSSProperties}
      data-loop={girar ? '' : undefined}
      aria-hidden="true"
    >
      <div className="anel">
        {LETRAS.map((l, i) => (
          <span
            key={i}
            className="sl"
            style={
              {
                '--a': `${l.a}deg`,
                '--ty': l.baixo ? 1 : -1,
                '--x': `${(i - 3.5) * 0.66}em`,
                '--i': i,
              } as CSSProperties
            }
          >
            {l.ch}
          </span>
        ))}
      </div>
      <Cachorro className="selo-cachorro" olhar={olhar} />
    </div>
  );
}
