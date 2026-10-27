'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { MENU, SITE } from '@/content/site';
import { Letras } from './Letras';

/** Atalhos fixos no celular e no tablet, com um menu de tela cheia para as outras páginas. */
export function BarraInferior() {
  const menu = useRef<HTMLDialogElement>(null);
  const caminho = usePathname();
  const [vez, setVez] = useState(0);

  useEffect(() => {
    menu.current?.close();
  }, [caminho]);

  const abre = () => {
    setVez((v) => v + 1); // remonta a lista para as letras rolarem de novo a cada abertura
    menu.current?.showModal();
  };

  return (
    <>
      <nav className="barra" aria-label="Atalhos">
        <Link href="/cardapio" className="abanar">
          Cardápio
        </Link>
        <a href={SITE.mapas.google} target="_blank" rel="noopener noreferrer">
          Como chegar
        </a>
        <button type="button" onClick={abre} aria-haspopup="dialog">
          Menu
        </button>
      </nav>
      <dialog ref={menu} className="menu c-laranja" aria-label="Menu">
        <form method="dialog" className="menu-fechar">
          <button className="botao claro">Fechar</button>
        </form>
        <ul key={vez} className="pautado">
          {MENU.map((item, i) => (
            <li key={item.href}>
              <Link href={item.href} className="abanar" aria-current={caminho === item.href ? 'page' : undefined}>
                <Letras texto={item.rotulo} gesto="rolar" atraso={i * 70} className="t-estencil" />
              </Link>
            </li>
          ))}
        </ul>
        <a className="link" href={SITE.instagram} target="_blank" rel="noopener noreferrer">
          @viralata.bh no Instagram
        </a>
      </dialog>
    </>
  );
}
