'use client';

import { usePathname } from 'next/navigation';
import { ViewTransition } from 'react';

/** A página nova entra empurrando a anterior para cima, como as telas dos stories da casa. */
export default function Template({ children }: { children: React.ReactNode }) {
  const caminho = usePathname();
  return (
    <ViewTransition key={caminho} enter="pagina-entra" exit="pagina-sai" default="none">
      {children}
    </ViewTransition>
  );
}
