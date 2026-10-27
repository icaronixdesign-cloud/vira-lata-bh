'use client';

import { useEffect } from 'react';
import { semente, sinal, sorteador } from '@/lib/aleatorio';

const SELETOR = '[data-gesto]:not([data-in]), [data-loop], [data-abrir]:not([data-aberta]), .cartao';

/** Textos longos: divide em letras ao chegar na tela e volta a ser texto corrido quando a última letra assenta. */
function divide(el: HTMLElement) {
  const v = el.querySelector<HTMLElement>(':scope > .v');
  if (!v || el.dataset.dividido !== undefined) return;
  el.dataset.dividido = '';
  const texto = v.textContent ?? '';
  const sortear = sorteador(semente(texto));
  const frag = document.createDocumentFragment();
  let n = 0;
  for (const parte of texto.split(/(\s+)/)) {
    if (!parte) continue;
    if (/^\s+$/.test(parte)) {
      frag.append(' ');
      continue;
    }
    const w = document.createElement('span');
    w.className = 'w';
    for (const ch of parte) {
      const l = document.createElement('span');
      l.className = 'l';
      l.textContent = ch;
      l.style.setProperty('--i', String(n++));
      l.style.setProperty('--r', sinal(sortear));
      w.append(l);
    }
    frag.append(w);
  }
  const sr = document.createElement('span');
  sr.className = 'sr';
  sr.textContent = texto;
  v.replaceChildren(frag);
  v.setAttribute('aria-hidden', 'true');
  el.prepend(sr);

  let restantes = n;
  const junta = () => {
    if (!el.isConnected || el.dataset.junto !== undefined) return;
    el.dataset.junto = '';
    el.removeEventListener('animationend', aoFim);
    v.textContent = texto;
    v.removeAttribute('aria-hidden');
    sr.remove();
  };
  const aoFim = (e: AnimationEvent) => {
    if ((e.target as HTMLElement).classList.contains('l') && --restantes <= 0) junta();
  };
  el.addEventListener('animationend', aoFim);
  const estilo = getComputedStyle(el);
  const passo = parseFloat(estilo.getPropertyValue('--passo')) || 20;
  const d0 = parseFloat(estilo.getPropertyValue('--d0')) || 0;
  window.setTimeout(junta, d0 + n * passo + 2400);
}

type Centro = { x: number; y: number };
const centros = new WeakMap<HTMLElement, Centro[]>();

/** Liga as letras, os loops, os cartões empilhados, os olhos do cachorro e o "farejar". Um único observador para tudo. */
export function Interacoes() {
  useEffect(() => {
    const reduz = matchMedia('(prefers-reduced-motion: reduce)');
    const mouse = matchMedia('(hover: hover) and (pointer: fine)');

    const entra = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          entra.unobserve(el);
          if (el.hasAttribute('data-lazy') && !reduz.matches) divide(el);
          el.setAttribute('data-in', '');
        }
      },
      { rootMargin: '0px 0px -6% 0px' },
    );

    const loops = new IntersectionObserver((entradas) => {
      for (const e of entradas) (e.target as HTMLElement).toggleAttribute('data-off', !e.isIntersecting);
    });

    const abre = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).setAttribute('data-aberta', '');
          abre.unobserve(e.target);
        }
      },
      { threshold: 0.5 },
    );

    // Cartões mais altos que a tela grudam pelo pé, para nada ficar escondido.
    const alturas = new ResizeObserver((itens) => {
      for (const it of itens) {
        const alvo = it.target as HTMLElement;
        const alto = it.borderBoxSize?.[0]?.blockSize ?? alvo.offsetHeight;
        alvo.style.setProperty('--h', `${Math.round(alto)}px`);
      }
    });

    const um = (el: HTMLElement) => {
      if (el.matches('[data-gesto]:not([data-in])')) entra.observe(el);
      if (el.matches('[data-loop]')) loops.observe(el);
      if (el.matches('[data-abrir]:not([data-aberta])')) abre.observe(el);
      if (el.matches('.cartao')) alturas.observe(el);
    };
    const registra = (raiz: ParentNode) => {
      if (raiz instanceof HTMLElement) um(raiz);
      raiz.querySelectorAll<HTMLElement>(SELETOR).forEach(um);
    };
    registra(document);
    const mudou = new MutationObserver((mudancas) => {
      for (const m of mudancas) m.addedNodes.forEach((n) => n instanceof HTMLElement && registra(n));
    });
    mudou.observe(document.body, { childList: true, subtree: true });

    // Olhos que seguem o cursor e letras que se afastam dele: só com mouse e sem "reduzir movimento".
    let px = -9999;
    let py = -9999;
    let pedido = 0;
    const quadro = () => {
      pedido = 0;
      const altura = window.innerHeight;
      document.querySelectorAll<SVGSVGElement>('.cachorro[data-olhar]').forEach((svg) => {
        const r = svg.getBoundingClientRect();
        if (r.bottom < 0 || r.top > altura) return;
        const dx = px - (r.left + r.width * 0.49);
        const dy = py - (r.top + r.height * 0.335);
        const d = Math.hypot(dx, dy) || 1;
        const k = Math.min(1, d / 280);
        svg.style.setProperty('--ox', `${((dx / d) * 5 * k).toFixed(2)}px`);
        svg.style.setProperty('--oy', `${((dy / d) * 3.4 * k).toFixed(2)}px`);
      });
      document.querySelectorAll<HTMLElement>('[data-farejar][data-in]').forEach((el) => {
        const r = el.getBoundingClientRect();
        const perto = px > r.left - 160 && px < r.right + 160 && py > r.top - 160 && py < r.bottom + 160;
        const letras = el.querySelectorAll<HTMLElement>('.l');
        if (!perto) {
          if (el.dataset.farejando !== undefined) {
            letras.forEach((l) => {
              l.style.translate = '';
              l.style.rotate = '';
            });
            delete el.dataset.farejando;
          }
          return;
        }
        el.dataset.farejando = '';
        let lista = centros.get(el);
        if (!lista || lista.length !== letras.length) {
          lista = Array.from(letras, (l) => ({ x: l.offsetLeft + l.offsetWidth / 2, y: l.offsetTop + l.offsetHeight / 2 }));
          centros.set(el, lista);
        }
        letras.forEach((l, i) => {
          const c = lista![i];
          const dx = r.left + c.x - px;
          const dy = r.top + c.y - py;
          const d = Math.hypot(dx, dy);
          const f = Math.max(0, 1 - d / 170);
          if (f === 0) {
            l.style.translate = '';
            l.style.rotate = '';
            return;
          }
          const k = (f * f * 26) / (d || 1);
          l.style.translate = `${(dx * k).toFixed(1)}px ${(dy * k).toFixed(1)}px`;
          l.style.rotate = `${((dx < 0 ? -1 : 1) * f * 16).toFixed(1)}deg`;
        });
      });
    };
    const aoMover = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || !mouse.matches || reduz.matches) return;
      px = e.clientX;
      py = e.clientY;
      if (!pedido) pedido = requestAnimationFrame(quadro);
    };
    const aoRedimensionar = () => {
      document.querySelectorAll<HTMLElement>('[data-farejar]').forEach((el) => centros.delete(el));
    };
    window.addEventListener('pointermove', aoMover, { passive: true });
    window.addEventListener('resize', aoRedimensionar, { passive: true });

    return () => {
      entra.disconnect();
      loops.disconnect();
      abre.disconnect();
      alturas.disconnect();
      mudou.disconnect();
      window.removeEventListener('pointermove', aoMover);
      window.removeEventListener('resize', aoRedimensionar);
      if (pedido) cancelAnimationFrame(pedido);
    };
  }, []);

  return null;
}
