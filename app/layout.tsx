import type { Metadata, Viewport } from 'next';
import { Anton, Courier_Prime, Roboto_Slab, Stardos_Stencil } from 'next/font/google';
import { BarraInferior } from '@/components/BarraInferior';
import { Cabecalho } from '@/components/Cabecalho';
import { CachorroDefs } from '@/components/Cachorro';
import { Interacoes } from '@/components/Interacoes';
import { Rodape } from '@/components/Rodape';
import { MODO, SITE } from '@/content/site';
import './globals.css';

// Fontes provisórias até os arquivos da marca: estêncil (títulos), slab (itens), máquina de escrever (detalhes)
// e uma condensada pesada para as palavras gigantes carimbadas.
const estencil = Stardos_Stencil({ subsets: ['latin'], weight: ['400', '700'], variable: '--f-estencil', display: 'swap' });
const slab = Roboto_Slab({ subsets: ['latin'], variable: '--f-slab', display: 'swap' });
const maquina = Courier_Prime({ subsets: ['latin'], weight: ['400', '700'], variable: '--f-maquina', display: 'swap' });
const carimbo = Anton({ subsets: ['latin'], weight: '400', variable: '--f-carimbo', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: 'Vira-lata · Seu bar de estimação em Lourdes, BH', template: '%s · Vira-lata' },
  description: SITE.descricao,
  robots: MODO === 'pitch' ? { index: false, follow: false } : undefined,
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Vira-lata',
    title: 'Vira-lata · Seu bar de estimação',
    description: SITE.descricao,
  },
};

export const viewport: Viewport = {
  themeColor: '#00a4fe',
  width: 'device-width',
  initialScale: 1,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BarOrPub',
  name: 'Vira-lata',
  slogan: SITE.slogan,
  description: SITE.descricao,
  url: SITE.url,
  servesCuisine: ['Portuguesa', 'Mineira', 'Petiscos'],
  priceRange: 'R$ 25–165',
  hasMenu: `${SITE.url}/cardapio`,
  sameAs: [SITE.instagram],
  address: {
    '@type': 'PostalAddress',
    streetAddress: `${SITE.endereco.rua}, ${SITE.endereco.numero}`,
    addressLocality: SITE.endereco.cidade,
    addressRegion: SITE.endereco.uf,
    addressCountry: 'BR',
  },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday'], opens: '18:00', closes: '23:59' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Friday', 'Saturday'], opens: '12:00', closes: '23:59' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Sunday', opens: '12:00', closes: '17:00' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${estencil.variable} ${slab.variable} ${maquina.variable} ${carimbo.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <a className="pular" href="#conteudo">
          Pular para o conteúdo
        </a>
        <CachorroDefs />
        <Cabecalho />
        <main id="conteudo">{children}</main>
        <Rodape />
        <BarraInferior />
        <Interacoes />
      </body>
    </html>
  );
}
