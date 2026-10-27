'use client';

import { useEffect, useRef, useState } from 'react';
import { CARDAPIO, reais } from '@/content/cardapio';
import { ESTADOS } from './lata3d/estados';
import type { Palco } from './lata3d/palco3d';

const CORES = ['creme', 'azul', 'creme', 'rosa', 'laranja', 'azul', 'rosa', 'creme'] as const;

/** Vitrine da lata 3D: arraste para girar, escolha a lata, abra e feche. */
export function LataVitrine() {
  const caixa = useRef<HTMLDivElement>(null);
  const tela = useRef<HTMLCanvasElement>(null);
  const [atual, setAtual] = useState(1);
  const [pronta, setPronta] = useState(false);
  const ctrl = useRef<{ escolhe: (i: number) => void; alterna: () => void } | null>(null);
  const latas = CARDAPIO.find((c) => c.id === 'latas')!;

  useEffect(() => {
    const elCaixa = caixa.current;
    const canvas = tela.current;
    if (!elCaixa || !canvas) return;
    let palco: Palco | null = null;
    let vivo = true;
    let pedido = 0;
    const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
    // estado: giro/elevação (arrasto com inércia), abertura e troca de lata (fecha → gira trocando → abre)
    const s = { giro: -0.4, elev: 0.6, vg: 0, ve: 0, t: 1, tAlvo: 1, A: 1, B: 1, mix: 0, fila: -1, conteudo: 1, salto: 0 };
    let arrasto: { x: number; y: number } | null = null;
    let ultimo = 0;

    const quadro = (agora: number) => {
      pedido = 0;
      const dt = ultimo ? Math.min(0.05, (agora - ultimo) / 1000) : 1 / 60;
      ultimo = agora;
      if (!arrasto) {
        s.giro += s.vg * dt;
        s.elev = Math.min(1.35, Math.max(0.12, s.elev + s.ve * dt));
        s.vg *= Math.exp(-3 * dt);
        s.ve *= Math.exp(-3 * dt);
      }
      // troca pendente: fecha, cobre a cinta com a nova girando, abre
      if (s.fila >= 0) {
        s.tAlvo = 0;
        if (s.t < 0.02) {
          s.B = s.fila;
          s.mix = Math.min(1, s.mix + dt * 1.6);
          s.salto = Math.sin(Math.PI * s.mix) * 0.009;
          s.conteudo = s.mix > 0.5 ? s.B : s.A;
          if (s.mix >= 1) {
            s.A = s.B;
            s.mix = 0;
            s.salto = 0;
            s.fila = -1;
            s.tAlvo = 1;
          }
        }
      }
      const vel = reduz ? 1 : 1.1;
      s.t += Math.sign(s.tAlvo - s.t) * Math.min(Math.abs(s.tAlvo - s.t), dt * vel);
      const giroTroca = s.fila >= 0 ? s.mix * Math.PI * 2 : 0;
      const w = elCaixa.clientWidth;
      palco?.aplica({
        t: s.t, A: s.A, B: s.B, mix: s.mix, conteudo: s.conteudo,
        giro: s.giro + giroTroca, salto: s.salto, rolagem: 0,
        elev: s.elev, azim: 0, vaga: w / 1.2,
      });
      const anda = arrasto || Math.abs(s.vg) > 0.01 || Math.abs(s.ve) > 0.01 || s.t !== s.tAlvo || s.fila >= 0;
      if (anda) pedido = requestAnimationFrame(quadro);
      else ultimo = 0;
    };
    const acorda = () => {
      if (!pedido) pedido = requestAnimationFrame(quadro);
    };
    const dimensiona = () => {
      if (!palco) return;
      const w = elCaixa.clientWidth;
      const h = elCaixa.clientHeight;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      palco.tamanho(w, h, Math.min(devicePixelRatio || 1, 2, Math.sqrt(3e6 / (w * h))));
      acorda();
    };

    const desce = (e: PointerEvent) => {
      arrasto = { x: e.clientX, y: e.clientY };
      canvas.setPointerCapture(e.pointerId);
      acorda();
    };
    const move = (e: PointerEvent) => {
      if (!arrasto) return;
      const dx = e.clientX - arrasto.x;
      const dy = e.clientY - arrasto.y;
      arrasto = { x: e.clientX, y: e.clientY };
      s.giro += dx * 0.01;
      s.elev = Math.min(1.35, Math.max(0.12, s.elev + dy * 0.006));
      s.vg = dx * 0.6;
      s.ve = dy * 0.3;
    };
    const sobe = () => {
      arrasto = null;
      acorda();
    };
    canvas.addEventListener('pointerdown', desce);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', sobe);
    canvas.addEventListener('pointercancel', sobe);

    ctrl.current = {
      escolhe: (i) => {
        if (i === s.A && s.fila < 0) return;
        s.fila = i;
        acorda();
      },
      alterna: () => {
        s.tAlvo = s.tAlvo > 0.5 ? 0 : 1;
        acorda();
      },
    };

    const ro = new ResizeObserver(dimensiona);
    (async () => {
      try {
        const { criaPalco } = await import('./lata3d/palco3d');
        const p = await criaPalco({ canvas, base: '/lata-3d/', estados: ESTADOS, toque: !matchMedia('(pointer: fine)').matches });
        if (!vivo) return p.libera();
        palco = p;
        await p.carregaRotulos();
        ro.observe(elCaixa);
        dimensiona();
        setPronta(true);
      } catch (e) {
        console.warn('lata 3D indisponível:', e);
      }
    })();

    return () => {
      vivo = false;
      ro.disconnect();
      if (pedido) cancelAnimationFrame(pedido);
      canvas.removeEventListener('pointerdown', desce);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', sobe);
      canvas.removeEventListener('pointercancel', sobe);
      palco?.libera();
    };
  }, []);

  const item = atual > 0 ? latas.itens[atual - 1] : null;
  return (
    <div className="vitrine">
      <div ref={caixa} className="vitrine-palco" data-pronta={pronta ? '' : undefined}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/lata-3d/lata-aberta.webp" alt="" width={1600} height={1200} />
        <canvas ref={tela} aria-label="Lata 3D: arraste para girar" role="img" />
        <p className="vitrine-dica t-maquina" aria-hidden="true">Arraste para girar</p>
      </div>
      <div className="vitrine-painel">
        <p className="vitrine-num t-maquina">{item ? `Lata nº ${atual}` : 'A lata da casa'}</p>
        <h2 className="vitrine-nome">{item ? item.nome : 'Sardinhas no azeite'}</h2>
        {item ? <p className="vitrine-preco t-maquina colchete">{reais(item.preco)}</p> : null}
        <button type="button" className="botao" onClick={() => ctrl.current?.alterna()}>
          Abrir / fechar
        </button>
        <ul className="vitrine-latas" aria-label="Escolha a lata">
          {ESTADOS.map((e, i) => (
            <li key={e.id}>
              <button
                type="button"
                className={`vitrine-lata c-${CORES[i]}`}
                aria-pressed={atual === i}
                onClick={() => {
                  setAtual(i);
                  ctrl.current?.escolhe(i);
                }}
              >
                {i === 0 ? 'Casa' : `${i} · ${e.id === 'carne' ? 'carne de lata' : e.id}`}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
