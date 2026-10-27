'use client';

import { useEffect } from 'react';
import { ESTADOS, ouveTrilho, trilho } from './lata3d/estados';
import type { Palco } from './lata3d/palco3d';

/**
 * A lata 3D da home (sem nada visível de React: só um canvas que a coreografia encaixa no lugar certo).
 *
 * 1. "Tudo cabe numa lata": a lata fica na vaga da direita, fechada, sobre o poster; enquanto a seção fica parada
 *    (o `.lata-respiro` dá o curso), o scroll abre a lata. Nunca é autoplay: tudo é scrub.
 * 2. Passagem: a prateleira sobe por cima; a lata desce em arco até a vaga da prateleira e, no caminho,
 *    fecha, gira trocando a cinta da casa pela da lata 1 e abre com a truta.
 * 3. Prateleira: o trilho anda na horizontal como antes; a lata da vez é o cartão sob ela (Prateleira publica `trilho.f`).
 *    Perto da divisa entre dois cartões ela fecha, gira com um pulinho e troca cinta, recheio e líquido.
 *
 * Desempenho: um requestAnimationFrame que para quando tudo assenta, leituras de layout antes das escritas,
 * WebGL só desenha quando algo mudou e o canvas está na tela; o canvas mora dentro da seção que está na tela
 * (rola junto, sem atraso de quadro) e só fica fixo na passagem. three.js + GLB chegam por import dinâmico
 * quando a seção se aproxima. Sem WebGL ou com "reduzir movimento", ficam os posters.
 */
export function LataCena() {
  useEffect(() => {
    const raiz = document.documentElement;
    const secao = document.getElementById('lata-sec');
    const respiro = document.querySelector<HTMLElement>('.lata-respiro');
    const vagaSecao = document.querySelector<HTMLElement>('[data-vaga="secao"]');
    const pista = document.querySelector<HTMLElement>('.prateleira');
    const palco = pista?.querySelector<HTMLElement>('.prateleira-palco');
    const vagaPrat = pista?.querySelector<HTMLElement>('[data-vaga="prateleira"]');
    if (!secao || !respiro || !vagaSecao || !pista || !palco || !vagaPrat) return;
    const cartoes = [...pista.querySelectorAll<HTMLElement>('.rotulo')];
    const N = cartoes.length;

    const reduz = matchMedia('(prefers-reduced-motion: reduce)');
    const mouse = matchMedia('(hover: hover) and (pointer: fine)');
    if (reduz.matches) return;

    const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
    const suave = (a: number, b: number, x: number) => {
      const t = clamp((x - a) / (b - a));
      return t * t * (3 - 2 * t);
    };
    const emInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const RAD = Math.PI / 180;
    // estado da lata em window.__lata (verificação): sempre em dev; em produção só com ?depurar na URL
    const depurar = process.env.NODE_ENV !== 'production' || location.search.includes('depurar');

    // lata da vez: perto da divisa entre duas latas fica fechada; no meio do cartão fica aberta
    const estadoDaLata = (f: number) => {
      f = clamp(f, 0, N);
      const i = Math.min(N - 1, Math.floor(f));
      const frac = f - i;
      const d = Math.abs(frac - 0.5);
      const w = suave(0.38, 0.62, frac);
      return {
        abre: suave(0.14, 0.34, d),
        A: i,
        B: i + 1,
        mix: w,
        conteudo: frac < 0.5 ? i : i + 1,
        giro: emInOut(w) * Math.PI * 2,
        salto: Math.sin(Math.PI * w) * 0.009,
      };
    };

    let canvas: HTMLCanvasElement | null = null;
    let palco3d: Palco | null = null;
    let vivo = true;
    let H = innerHeight;
    let canvasW = 0;
    let canvasH = 0;
    const pos = { pai: null as HTMLElement | null, x: 0, y: 0 };
    const est = { a: 0, aAlvo: 0, px: 0, py: 0, pxAlvo: 0, pyAlvo: 0 };
    let ultimo = 0;
    let pedido = 0;
    let focoAtual = -1;

    const acorda = () => {
      if (!pedido) pedido = requestAnimationFrame(quadro);
    };

    const dimensiona = () => {
      if (!canvas || !palco3d) return;
      const wmax = Math.max(vagaSecao.offsetWidth, vagaPrat.offsetWidth);
      canvasW = Math.ceil(wmax * 1.6);
      canvasH = Math.ceil(wmax * 0.75 * 1.8);
      const pr = Math.min(devicePixelRatio || 1, mouse.matches ? 2 : 1.5);
      const prFinal = Math.min(pr, Math.sqrt(2.8e6 / (canvasW * canvasH)));
      canvas.style.width = `${canvasW}px`;
      canvas.style.height = `${canvasH}px`;
      palco3d.tamanho(canvasW, canvasH, prFinal);
      pos.pai = null;
    };

    const encaixa = (pai: HTMLElement | null, x: number, y: number) => {
      if (!canvas) return;
      const alvo = pai ?? document.body;
      if (canvas.parentElement !== alvo) {
        alvo.append(canvas);
        canvas.style.position = pai ? 'absolute' : 'fixed';
      }
      if (pos.pai !== alvo || Math.abs(pos.x - x) > 0.25 || Math.abs(pos.y - y) > 0.25) {
        canvas.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        pos.pai = alvo;
        pos.x = x;
        pos.y = y;
      }
    };

    function quadro(agora: number) {
      pedido = 0;
      const dt = ultimo ? Math.min(0.05, (agora - ultimo) / 1000) : 1 / 60;
      ultimo = agora;

      // leituras (todas antes de qualquer escrita)
      const rs = vagaSecao!.getBoundingClientRect();
      const rr = respiro!.getBoundingClientRect();
      const rp = pista!.getBoundingClientRect();
      const rpal = palco!.getBoundingClientRect();
      const rv = vagaPrat!.getBoundingClientRect();
      const rsec = secao!.getBoundingClientRect();

      // alvos e suavização (independente da taxa de quadros)
      est.aAlvo = rr.height > 0 ? suave(0.06, 0.82, (H - rr.top) / rr.height) : 1;
      const k = (taxa: number) => 1 - Math.exp(-taxa * dt);
      est.a += (est.aAlvo - est.a) * k(9);
      est.px += (est.pxAlvo - est.px) * k(6);
      est.py += (est.pyAlvo - est.py) * k(6);
      const c = clamp(1 - rp.top / H);

      // da casa (0) até a lata sob a lata 3D enquanto a prateleira sobe; depois, a lata do trilho
      const f = trilho.f * suave(0.15, 0.9, c);
      const L = estadoDaLata(f);
      const t = Math.min(est.a, L.abre);

      const foco = L.mix < 0.5 ? L.A : L.B;
      if (foco !== focoAtual) {
        cartoes[focoAtual - 1]?.removeAttribute('data-foco');
        cartoes[foco - 1]?.setAttribute('data-foco', '');
        focoAtual = foco;
      }

      if (canvas && palco3d) {
        const cx3 = rs.left + rs.width / 2;
        const cy3 = rs.top + rs.height / 2;
        const cxP = rv.left + rv.width / 2;
        const cyP = rv.top + rv.height / 2;
        const arcoMax = Math.min(H * 0.18, 170);
        let vaga: number;
        let cy: number;
        if (c <= 0) {
          vaga = rs.width;
          cy = cy3;
          encaixa(secao, cx3 - rsec.left - canvasW / 2, cy3 - rsec.top - canvasH / 2);
        } else if (c < 1) {
          const e = emInOut(c);
          // caminho em arco para baixo: desce sobre a prateleira que sobe, sem passar por cima do título
          cy = lerp(cy3, cyP - rpal.top, e) + Math.sin(Math.PI * e) * arcoMax;
          vaga = lerp(rs.width, rv.width, e);
          encaixa(null, lerp(cx3, cxP, e) - canvasW / 2, cy - canvasH / 2);
        } else {
          vaga = rv.width;
          cy = cyP;
          encaixa(palco!, cxP - rpal.left - canvasW / 2, cyP - rpal.top - canvasH / 2);
        }
        if (cy + canvasH / 2 > 0 && cy - canvasH / 2 < H) {
          palco3d.aplica({
            t, A: L.A, B: L.B, mix: L.mix, conteudo: L.conteudo,
            giro: L.giro, salto: L.salto,
            rolagem: -trilho.inclina * RAD * 0.6,
            elev: (30.17 + 7.5 * suave(0, 1, est.a) + est.py * 3) * RAD,
            azim: (-26.57 + est.px * 5) * RAD,
            vaga,
          });
        }
        if (depurar) {
          (window as unknown as { __lata: unknown }).__lata = { pronto: true, c, f, t, a: est.a, off: trilho.f, conteudo: L.conteudo, mix: L.mix, info: palco3d.info() };
        }
      }

      const parado = Math.abs(est.aAlvo - est.a) < 1e-4 && Math.abs(est.pxAlvo - est.px) < 1e-3 && Math.abs(est.pyAlvo - est.py) < 1e-3;
      if (!parado) acorda();
      else ultimo = 0;
    }

    // 3D sob demanda
    const liga3D = async () => {
      if (canvas) return;
      canvas = document.createElement('canvas');
      canvas.className = 'lata-palco';
      canvas.setAttribute('aria-hidden', 'true');
      try {
        const { criaPalco } = await import('./lata3d/palco3d');
        const p = await criaPalco({ canvas, base: '/lata-3d/', estados: ESTADOS, toque: !mouse.matches });
        if (!vivo) {
          p.libera();
          return;
        }
        palco3d = p;
        dimensiona();
        acorda();
        requestAnimationFrame(() => requestAnimationFrame(() => raiz.classList.add('lata-3d-pronta')));
        const ocioso = window.requestIdleCallback ?? ((fn: () => void) => window.setTimeout(fn, 200));
        ocioso(() => void p.carregaRotulos().then(acorda));
      } catch (e) {
        console.warn('lata 3D indisponível, ficam os posters:', e);
        canvas?.remove();
        canvas = null;
        palco3d = null;
      }
    };
    const perto = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          perto.disconnect();
          void liga3D();
        }
      },
      { rootMargin: '150% 0px' },
    );
    perto.observe(secao);

    const aoRedimensionar = () => {
      H = innerHeight;
      dimensiona();
      acorda();
    };
    const aoMover = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      est.pxAlvo = (e.clientX / innerWidth) * 2 - 1;
      est.pyAlvo = (e.clientY / innerHeight) * 2 - 1;
      acorda();
    };
    const tamanhos = new ResizeObserver(aoRedimensionar);
    tamanhos.observe(vagaSecao);
    tamanhos.observe(vagaPrat);
    addEventListener('scroll', acorda, { passive: true });
    addEventListener('resize', aoRedimensionar);
    addEventListener('pointermove', aoMover, { passive: true });
    const largaTrilho = ouveTrilho(acorda);
    acorda();

    return () => {
      vivo = false;
      perto.disconnect();
      tamanhos.disconnect();
      removeEventListener('scroll', acorda);
      removeEventListener('resize', aoRedimensionar);
      removeEventListener('pointermove', aoMover);
      largaTrilho();
      if (pedido) cancelAnimationFrame(pedido);
      palco3d?.libera();
      canvas?.remove();
      raiz.classList.remove('lata-3d-pronta');
      cartoes.forEach((c) => c.removeAttribute('data-foco'));
    };
  }, []);

  return null;
}
