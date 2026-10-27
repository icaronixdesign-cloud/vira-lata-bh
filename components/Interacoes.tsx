'use client';

import { useEffect } from 'react';
import { semente, sinal, sorteador } from '@/lib/aleatorio';
import { USA_R } from './Letras';

const SELETOR = '[data-gesto], [data-loop], [data-abrir]:not([data-aberta]), .cartao';

const limpa = (palavra: string) => palavra.toLocaleLowerCase('pt-BR').replace(/[^\p{L}\p{N}]/gu, '');

/** Textos preguiçosos: divide em letras ao chegar na tela (com marca-texto via data-destaques). */
function divide(el: HTMLElement) {
  const v = el.querySelector<HTMLElement>(':scope > .v');
  if (!v || el.dataset.dividido !== undefined) return;
  el.dataset.dividido = '';
  delete el.dataset.junto;
  const texto = v.textContent ?? '';
  const comR = USA_R.has(el.dataset.gesto ?? '');
  const marcadas = new Set((el.dataset.destaques ?? '').split(',').map(limpa).filter(Boolean));
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
    w.className = marcadas.has(limpa(parte)) ? 'w k' : 'w';
    for (const ch of parte) {
      const l = document.createElement('span');
      l.className = 'l';
      l.textContent = ch;
      l.style.setProperty('--i', String(n++));
      if (comR) l.style.setProperty('--r', sinal(sortear));
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
}

/** Devolve o texto corrido palavra a palavra (o marca-texto .k sobrevive), derrubando os nós por letra. */
function junta(el: HTMLElement) {
  if (!el.isConnected || el.dataset.junto !== undefined) return;
  const v = el.querySelector<HTMLElement>(':scope > .v');
  if (!v) return;
  el.dataset.junto = '';
  delete el.dataset.dividido; // o laboratório pode dividir de novo
  for (const w of v.querySelectorAll<HTMLElement>('.w')) w.replaceChildren(w.textContent ?? '');
  v.removeAttribute('aria-hidden');
  el.querySelector(':scope > .sr')?.remove();
}

/** Junta quando a última letra assenta (ou num prazo de segurança). `abanar` e `farejar` ficam divididos. */
function agendaJunta(el: HTMLElement) {
  if (el.dataset.junto !== undefined || el.hasAttribute('data-farejar') || el.closest('.abanar')) return;
  const letras = el.querySelectorAll('.l').length;
  if (!letras) return;
  let restantes = letras;
  const fim = () => {
    el.removeEventListener('animationend', aoFim);
    window.clearTimeout(prazo);
    junta(el);
  };
  const aoFim = (e: AnimationEvent) => {
    if ((e.target as HTMLElement).classList.contains('l') && --restantes <= 0) fim();
  };
  el.addEventListener('animationend', aoFim);
  const estilo = getComputedStyle(el);
  const passo = parseFloat(estilo.getPropertyValue('--passo')) || 20;
  const d0 = parseFloat(estilo.getPropertyValue('--d0')) || 0;
  const dur = parseFloat(estilo.getPropertyValue('--dur')) || 900;
  const prazo = window.setTimeout(fim, d0 + letras * passo + dur + 1800);
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
        const chegaram: HTMLElement[] = [];
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          entra.unobserve(el);
          if (el.hasAttribute('data-lazy') && !reduz.matches) divide(el);
          el.setAttribute('data-in', '');
          chegaram.push(el);
        }
        if (!chegaram.length) return;
        // As letras de "sair" só animam quando a lata abre; as outras marcam hora de juntar
        // no quadro seguinte, para as leituras de estilo não se misturarem com as escritas acima.
        requestAnimationFrame(() => {
          for (const el of chegaram) if (el.dataset.gesto !== 'sair') agendaJunta(el);
        });
      },
      { rootMargin: '0px 0px -6% 0px' },
    );

    // Pré-divide os textos preguiçosos bem antes de entrarem na tela, só em momento de fato ocioso
    // (sem prazo: num scroll contínuo nada roda aqui e a divisão fica para a entrada, como sempre).
    const temOcioso = 'requestIdleCallback' in window;
    const prepara = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          prepara.unobserve(el);
          if (!reduz.matches && temOcioso) requestIdleCallback(() => divide(el));
        }
      },
      { rootMargin: '1000px 0px 1000px 0px' },
    );

    const loops = new IntersectionObserver((entradas) => {
      for (const e of entradas) (e.target as HTMLElement).toggleAttribute('data-off', !e.isIntersecting);
    });

    const abre = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          el.setAttribute('data-aberta', '');
          el.querySelectorAll<HTMLElement>('[data-gesto="sair"]').forEach(agendaJunta);
          abre.unobserve(el);
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
      // Marcados antes da hidratação (primeira dobra): só falta marcar a hora de juntar.
      if (el.matches('[data-gesto][data-in]:not([data-junto])') && el.dataset.gesto !== 'sair') agendaJunta(el);
      if (el.matches('[data-lazy]:not([data-in])')) prepara.observe(el);
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

    // "De novo" (laboratório): junta, divide de novo e repete os gestos do caso.
    const deNovo = (e: Event) => {
      const caso = e.target as HTMLElement;
      const gestos = caso.querySelectorAll<HTMLElement>('[data-gesto]');
      const latas = caso.querySelectorAll<HTMLElement>('[data-abrir]');
      gestos.forEach((el) => {
        el.removeAttribute('data-in');
        if (!reduz.matches) {
          junta(el);
          divide(el);
        }
      });
      latas.forEach((el) => el.removeAttribute('data-aberta'));
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          gestos.forEach((el) => {
            el.setAttribute('data-in', '');
            if (el.dataset.gesto !== 'sair') agendaJunta(el);
          });
          latas.forEach((el) => {
            el.setAttribute('data-aberta', '');
            el.querySelectorAll<HTMLElement>('[data-gesto="sair"]').forEach(agendaJunta);
          });
        }),
      );
    };
    document.addEventListener('letras:denovo', deNovo);

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
      prepara.disconnect();
      loops.disconnect();
      abre.disconnect();
      alturas.disconnect();
      mudou.disconnect();
      document.removeEventListener('letras:denovo', deNovo);
      window.removeEventListener('pointermove', aoMover);
      window.removeEventListener('resize', aoRedimensionar);
      if (pedido) cancelAnimationFrame(pedido);
    };
  }, []);

  return null;
}
