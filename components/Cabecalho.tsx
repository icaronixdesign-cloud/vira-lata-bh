'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV } from '@/content/site';
import { Letras } from './Letras';
import { Selo } from './Selo';
import { StatusChip } from './StatusChip';

export function Cabecalho() {
  const caminho = usePathname();
  return (
    <header className="cabecalho">
      <Link href="/" className="marca abanar">
        <Selo tamanho="40px" />
        <Letras texto="Vira-lata" gesto="rolar" className="marca-nome" />
      </Link>
      <nav className="nav" aria-label="Principal">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="abanar"
            aria-current={caminho.startsWith(item.href) ? 'page' : undefined}
          >
            <Letras texto={item.rotulo} gesto="rolar" atraso={200} />
          </Link>
        ))}
      </nav>
      <StatusChip className="cabecalho-status" />
    </header>
  );
}
