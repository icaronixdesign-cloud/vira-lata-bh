'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import type { CSSProperties, ReactElement } from 'react';
import { ACOMPANHA, CARDAPIO, reais } from '@/content/cardapio';
import { Letras } from './Letras';

// Cores dos rótulos, na ordem da prateleira (uma cor da marca por lata).
const CORES = ['azul', 'creme', 'rosa', 'laranja', 'azul', 'rosa', 'creme'] as const;

/** Desenhos de rótulo de conserva, um por lata, no traço simples da casa. */
const DESENHOS: ReactElement[] = [
  // Truta defumada: um peixe gordo e a fumaça
  <g key="truta">
    <path d="M18 48c10-14 34-22 52-22s30 10 32 20c-2 10-14 20-32 20S28 62 18 52l-10 8 2-14-2-14z" />
    <circle cx="86" cy="42" r="2.6" fill="currentColor" stroke="none" />
    <path d="M70 16c4-4 0-8 4-12M84 18c4-4 0-8 4-12" opacity="0.7" />
  </g>,
  // Sardinha: duas sardinhas nadando em sentidos opostos
  <g key="sardinha">
    <path d="M16 28c8-8 30-12 48-10 12 2 20 6 22 10-2 4-10 8-22 10-18 2-40-2-48-10zm70 0 14-8-4 8 4 8z" />
    <path d="M104 52c-8-8-30-12-48-10-12 2-20 6-22 10 2 4 10 8 22 10 18 2 40-2 48-10zm-70 0-14-8 4 8-4 8z" />
  </g>,
  // Manjubinha: um cardume de peixinhos
  <g key="manjubinha">
    <path d="M22 24c6-5 18-7 28-6 7 1 11 3 13 6-2 3-6 5-13 6-10 1-22-1-28-6zm41 0 9-5-2 5 2 5z" />
    <path d="M38 44c6-5 18-7 28-6 7 1 11 3 13 6-2 3-6 5-13 6-10 1-22-1-28-6zm41 0 9-5-2 5 2 5z" />
    <path d="M22 64c6-5 18-7 28-6 7 1 11 3 13 6-2 3-6 5-13 6-10 1-22-1-28-6zm41 0 9-5-2 5 2 5z" />
  </g>,
  // Polvo: cabeça redonda e quatro tentáculos enrolados
  <g key="polvo">
    <path d="M60 14c14 0 24 10 24 22 0 6-3 10-6 13M60 14c-14 0-24 10-24 22 0 6 3 10 6 13" />
    <path d="M42 49c-2 8-8 12-14 10 4 8 14 8 18-2M78 49c2 8 8 12 14 10-4 8-14 8-18-2M52 52c0 8-4 14-10 16 8 4 14-4 16-12M68 52c0 8 4 14 10 16-8 4-14-4-16-12" />
    <circle cx="52" cy="34" r="2.6" fill="currentColor" stroke="none" />
    <circle cx="68" cy="34" r="2.6" fill="currentColor" stroke="none" />
  </g>,
  // Bacalhau: o peixe inteiro de perfil, rabo aberto
  <g key="bacalhau">
    <path d="M14 40c12-12 36-18 56-16 14 2 24 8 28 16-4 8-14 14-28 16-20 2-44-4-56-16zm84 0 12-10-3 10 3 10zM34 30v20M52 26v28" />
    <circle cx="80" cy="36" r="2.6" fill="currentColor" stroke="none" />
  </g>,
  // Azeitonas: o raminho com três azeitonas
  <g key="azeitonas">
    <path d="M18 64c22-6 42-20 58-40M62 38c6 4 14 4 20 0M44 52c4 6 12 8 18 6" />
    <ellipse cx="86" cy="52" rx="9" ry="12" />
    <ellipse cx="66" cy="62" rx="9" ry="12" />
    <ellipse cx="94" cy="24" rx="9" ry="12" />
  </g>,
  // Carne de lata: a lata retangular e baixa, com o vapor subindo
  <g key="carne">
    <rect x="22" y="38" width="76" height="30" rx="8" />
    <path d="M30 38c0-5 14-8 30-8s30 3 30 8M48 18c3-4-1-7 2-11M62 20c3-4-1-7 2-11M76 18c3-4-1-7 2-11" />
  </g>,
];

/**
 * Prateleira das latas: o scroll vertical move a prateleira na horizontal.
 * Sem JS ou com "reduzir movimento", vira uma faixa horizontal nativa com scroll-snap.
 * Com JS: container sticky, transform calculado do progresso do scroll (sem sequestrar a rolagem),
 * camadas em velocidades diferentes, inclinação pela velocidade e a chave de lata como progresso.
 */
export function Prateleira() {
  const pista = useRef<HTMLElement>(null);
  const palco = useRef<HTMLDivElement>(null);
  const trilho = useRef<HTMLDivElement>(null);
  const fundo = useRef<HTMLParagraphElement>(null);
  const frente = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elPista = pista.current;
    const elPalco = palco.current;
    const elTrilho = trilho.current;
    const elFundo = fundo.current;
    const elFrente = frente.current;
    if (!elPista || !elPalco || !elTrilho || !elFundo || !elFrente) return;

    const reduz = matchMedia('(prefers-reduced-motion: reduce)');
    const mouse = matchMedia('(hover: hover) and (pointer: fine)');
    let imersiva = false;
    let extra = 0;
    let visivel = false;
    let pedido = 0;
    let alvo = 0;
    let atual = 0;
    let inclina = 0;

    const progresso = () => {
      const r = elPista.getBoundingClientRect();
      const curso = r.height - innerHeight;
      return curso > 0 ? Math.min(1, Math.max(0, -r.top / curso)) : 0;
    };

    const aplica = () => {
      elTrilho.style.transform = `translate3d(${(-atual * extra).toFixed(1)}px, 0, 0)`;
      elFundo.style.transform = `translate3d(${(-atual * extra * 0.35).toFixed(1)}px, 0, 0)`;
      elFrente.style.transform = `translate3d(${(-atual * extra * 1.25).toFixed(1)}px, 0, 0)`;
      elPalco.style.setProperty('--pp', atual.toFixed(4));
      elPalco.style.setProperty('--inclina', `${inclina.toFixed(2)}deg`);
    };

    const quadro = () => {
      pedido = 0;
      const antes = atual;
      // Com mouse, a roda desliza suave; no toque, o dedo manda (1:1, sem atraso).
      atual += (alvo - atual) * (mouse.matches ? 0.16 : 1);
      const vel = atual - antes;
      inclina += (Math.max(-3.5, Math.min(3.5, vel * 2400)) - inclina) * 0.12;
      aplica();
      if (Math.abs(alvo - atual) > 0.0004 || Math.abs(inclina) > 0.03) {
        pedido = requestAnimationFrame(quadro);
      } else {
        inclina = 0;
        aplica();
      }
    };

    const acorda = () => {
      if (!imersiva || !visivel) return;
      alvo = progresso();
      if (!pedido) pedido = requestAnimationFrame(quadro);
    };

    const mede = () => {
      extra = Math.max(0, elTrilho.scrollWidth - elPalco.clientWidth);
      elPista.style.height = `calc(100svh + ${Math.round(extra)}px)`;
      acorda();
    };

    const liga = () => {
      imersiva = true;
      elPista.setAttribute('data-imersiva', '');
      mede();
      atual = alvo = progresso();
      aplica();
    };
    const desliga = () => {
      imersiva = false;
      elPista.removeAttribute('data-imersiva');
      elPista.style.height = '';
      elTrilho.style.transform = '';
      elFundo.style.transform = '';
      elFrente.style.transform = '';
      if (pedido) cancelAnimationFrame(pedido);
      pedido = 0;
    };

    const olho = new IntersectionObserver((entradas) => {
      for (const e of entradas) {
        visivel = e.isIntersecting;
        if (visivel) acorda();
      }
    });
    olho.observe(elPista);

    const medidor = new ResizeObserver(() => {
      if (elPista.hasAttribute('data-imersiva')) mede();
    });

    // No toque, fica a faixa horizontal nativa com scroll-snap: medida no celular (Chrome, CPU 4×),
    // ela rola mais fluida que a prateleira imersiva, e a rolagem vertical nunca é tocada.
    const decide = () => {
      if (reduz.matches || !mouse.matches) desliga();
      else liga();
    };
    decide();
    medidor.observe(elTrilho);
    medidor.observe(elPalco);

    addEventListener('scroll', acorda, { passive: true });
    reduz.addEventListener('change', decide);
    mouse.addEventListener('change', decide);
    return () => {
      removeEventListener('scroll', acorda);
      reduz.removeEventListener('change', decide);
      mouse.removeEventListener('change', decide);
      olho.disconnect();
      medidor.disconnect();
      desliga();
    };
  }, []);

  const latas = CARDAPIO.find((c) => c.id === 'latas')!;
  return (
    <section ref={pista} className="prateleira" aria-labelledby="prateleira-titulo">
      <div ref={palco} className="prateleira-palco c-creme pautado">
        {/* A palavra-fantasma vem do CSS (content), para não existir nó de texto quase invisível. */}
        <p ref={fundo} className="prateleira-fundo t-gigante" aria-hidden="true" />
        <div ref={trilho} className="prateleira-trilho">
          <header className="prateleira-abre">
            <Letras como="h2" id="prateleira-titulo" className="t-gigante carimbo" texto={latas.titulo} gesto="carimbar" />
            <Letras como="p" className="cardapio-intro" texto={latas.intro} gesto="pular" preguicoso />
            <p className="prateleira-dica t-maquina" aria-hidden="true">
              <span className="so-faixa">Arraste a prateleira →</span>
              <span className="so-imersiva">Role para abrir a prateleira →</span>
            </p>
          </header>
          <ul className="prateleira-latas">
            {latas.itens.map((item, i) => (
              <li key={item.nome} className={`rotulo c-${CORES[i % CORES.length]}`} style={{ '--i': i } as CSSProperties}>
                <svg className="rotulo-desenho" viewBox="0 0 120 80" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {DESENHOS[i % DESENHOS.length]}
                </svg>
                <Letras como="h3" className="rotulo-nome" texto={item.nome} gesto="sacudir" preguicoso />
                <p className="rotulo-preco t-maquina colchete">{reais(item.preco)}</p>
                <p className="rotulo-tag t-maquina">Lata nº {i + 1} · Vira-lata · Lourdes, BH</p>
              </li>
            ))}
          </ul>
          <footer className="prateleira-fecha">
            <div className="acompanha">
              <Letras como="h3" className="t-estencil" texto={ACOMPANHA.titulo} gesto="rolar" />
              <p>{ACOMPANHA.texto}</p>
              <ul className="trios">
                {ACOMPANHA.trios.map((trio) => (
                  <li key={trio}>
                    <Letras texto={trio} gesto="sacudir" preguicoso />
                    <span className="t-maquina colchete">trio</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="acoes">
              <Link href="/cardapio#latas" className="botao abanar">
                <Letras texto={`Ver as ${latas.itens.length} latas no cardápio`} gesto="rolar" />
              </Link>
            </div>
          </footer>
        </div>
        <div ref={frente} className="prateleira-frente" aria-hidden="true">
          <span className="fagulha f1" />
          <span className="fagulha f2" />
          <span className="fagulha f3" />
          <span className="fagulha f4" />
        </div>
        <div className="prateleira-chave" aria-hidden="true">
          <span className="chave-trilha">
            <span className="chave-rolinho" />
          </span>
          <svg className="chave-haste" viewBox="0 0 24 44" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <circle cx="12" cy="9" r="6" />
            <path d="M12 15v25M8 36h8" />
          </svg>
        </div>
      </div>
    </section>
  );
}
