import Link from 'next/link';
import { SITE } from '@/content/site';

/** Atalhos fixos no celular: o que quem chega pelo Instagram mais procura. */
export function BarraInferior() {
  return (
    <nav className="barra" aria-label="Atalhos">
      <Link href="/cardapio" className="abanar">
        Cardápio
      </Link>
      <a href={SITE.mapas.google} target="_blank" rel="noopener noreferrer">
        Como chegar
      </a>
      <a href={SITE.instagram} target="_blank" rel="noopener noreferrer">
        Instagram
      </a>
    </nav>
  );
}
