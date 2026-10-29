import type { Metadata, Viewport } from 'next';
import { Anton, Courier_Prime, Stardos_Stencil } from 'next/font/google';
import localFont from 'next/font/local';
import { BarraInferior } from '@/components/BarraInferior';
import { Cabecalho } from '@/components/Cabecalho';
import { CachorroDefs } from '@/components/Cachorro';
import { Interacoes } from '@/components/Interacoes';
import { Rodape } from '@/components/Rodape';
import { MODO, SITE } from '@/content/site';
import './globals.css';

// Fontes provisórias até os arquivos da marca, cada uma com um papel só (como nos stories da casa):
// estêncil (títulos), serifa variável (texto corrido e, pesada e condensada, os itens do cardápio e a
// interface), máquina de escrever (etiquetas, preços e detalhes) e a condensada carimbada (palavras gigantes).
// A serifa usa o eixo de largura (wdth): a mesma família vai do texto (100%) ao item do cardápio (62%).
// É a Roboto Serif (OFL) com os eixos cortados para a faixa usada (scripts/fonte-texto.mjs): 75 KB em vez de 147 KB.
// O site só usa a estêncil em 700. A Anton fica no preload porque é o LCP das páginas internas.
const estencil = Stardos_Stencil({ subsets: ['latin'], weight: '700', variable: '--f-estencil', display: 'swap' });
const texto = localFont({
  src: './fontes/roboto-serif-vira-lata.woff2',
  weight: '400 900',
  declarations: [{ prop: 'font-stretch', value: '62% 100%' }],
  variable: '--f-texto',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
  adjustFontFallback: 'Times New Roman',
});
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
  themeColor: '#6cc2ee',
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
      className={`${estencil.variable} ${texto.variable} ${maquina.variable} ${carimbo.variable}`}
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
        {/* As letras da primeira dobra entram já no primeiro paint, sem esperar a hidratação:
            a animação é CSS puro, só precisa do data-in (o LCP das páginas internas agradece). */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "requestAnimationFrame(()=>{for(const el of document.querySelectorAll('[data-gesto]:not([data-lazy]):not([data-in])')){const r=el.getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0)el.setAttribute('data-in','')}})",
          }}
        />
      </body>
    </html>
  );
}
