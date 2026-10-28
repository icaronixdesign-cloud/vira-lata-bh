'use client';

import { useRef, useState, type CSSProperties } from 'react';
import type { Quadro } from '@/content/parede';
import { Cachorro } from './Cachorro';
import { Letras } from './Letras';

const GIRO = [-3, 2, -1.5, 3, -2.5, 1, -1, 2.5];

/** O porta-retrato em si: moldura, passe-partout e a foto (ou o cachorro desenhado nos exemplos). */
export function QuadroArte({ q, alt }: { q: Pick<Quadro, 'nome' | 'foto' | 'cor' | 'moldura'>; alt?: string }) {
  return (
    <span className="quadro-moldura">
      <span className={`quadro-passe c-${q.cor}${q.foto ? ' com-foto' : ''}`}>
        {q.foto ? (
          // Fotos vêm do Blob já reduzidas no navegador (WebP até 1200 px).
          // eslint-disable-next-line @next/next/no-img-element
          <img src={q.foto} alt={alt ?? `Foto de ${q.nome}`} loading="lazy" decoding="async" />
        ) : (
          <Cachorro className="quadro-cachorro" />
        )}
      </span>
    </span>
  );
}

/** Porta-retratos pendurados: balançam no hover/toque e abrem a ficha do cachorro. */
export function ParedeGaleria({ quadros }: { quadros: Quadro[] }) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [aberto, setAberto] = useState<Quadro | null>(null);

  const abre = (q: Quadro) => {
    setAberto(q);
    dialogo.current?.showModal();
  };

  return (
    <>
      <ul className="parede-grade" data-gesto="quadros" suppressHydrationWarning>
        {quadros.map((q, i) => (
          <li key={q.id} style={{ '--i': i, '--rot': `${GIRO[i % GIRO.length]}deg` } as CSSProperties}>
            <button
              type="button"
              className={`quadro moldura-${q.moldura}`}
              onClick={() => abre(q)}
              aria-label={`${q.nome}${q.exemplo ? ', exemplo' : ''}: ver a ficha`}
            >
              <QuadroArte q={q} />
              <span className="quadro-nome">{q.nome}</span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogo}
        className="ficha"
        aria-label={aberto ? `Ficha de ${aberto.nome}` : 'Ficha'}
        onClose={() => setAberto(null)}
        onClick={(e) => {
          if (e.target === dialogo.current) dialogo.current?.close();
        }}
      >
        {aberto ? (
          <div className="ficha-miolo" key={aberto.id}>
            <p className="ficha-tag t-maquina">Ficha de adoção{aberto.exemplo ? ' · exemplo' : ''}</p>
            <div className={`quadro moldura-${aberto.moldura} ficha-quadro`}>
              <QuadroArte q={aberto} />
            </div>
            <Letras como="h2" className="t-estencil titulo" texto={aberto.nome} gesto="rolar" />
            {aberto.frase ? <Letras como="p" className="t-maquina ficha-frase" texto={aberto.frase} gesto="datilografar" atraso={300} /> : null}
            {aberto.tutor ? <p className="t-maquina ficha-tutor">Família: {aberto.tutor}</p> : null}
            <form method="dialog">
              <button className="botao">Fechar</button>
            </form>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
