'use client';

import { useEffect, useState } from 'react';
import { LINHAS_HORARIO } from '@/content/horarios';
import { agoraEmBH } from '@/lib/status';
import { Letras } from './Letras';

/** Linhas de horário em estêncil, com a de hoje marcada (calculada no fuso de BH, depois de carregar). */
export function Horarios({ className }: { className?: string }) {
  const [hoje, setHoje] = useState<number | null>(null);
  useEffect(() => setHoje(agoraEmBH().dia), []);
  return (
    <ul className={['horarios', 'pautado', className].filter(Boolean).join(' ')}>
      {LINHAS_HORARIO.map((linha, k) => (
        <li key={linha.dias} data-hoje={hoje !== null && (linha.indices as readonly number[]).includes(hoje) ? '' : undefined}>
          <Letras texto={linha.dias} gesto="rolar" className="t-estencil" atraso={k * 120} />
          <Letras texto={linha.horas} gesto="rolar" className="t-estencil" atraso={k * 120 + 260} />
        </li>
      ))}
    </ul>
  );
}
