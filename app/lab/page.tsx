import type { Metadata } from 'next';
import { DeNovo } from '@/components/DeNovo';
import { type Gesto, Letras } from '@/components/Letras';
import { Selo } from '@/components/Selo';

// Laboratório interno para afinar e aprovar cada gesto antes de espalhar pelo site. Fora do menu e do sitemap.
export const metadata: Metadata = { title: 'Laboratório de gestos', robots: { index: false, follow: false } };

const CASOS: { gesto: Gesto; onde: string; texto: string; classe: string; fundo: string; farejar?: boolean }[] = [
  { gesto: 'rolar', onde: 'Selo, títulos em estêncil', texto: 'Terça à quinta 18h—0h', classe: 't-estencil', fundo: 'c-creme pautado', farejar: true },
  { gesto: 'pular', onde: 'Manifesto, frases, chamadas', texto: 'O seu mais novo bar de estimação', classe: 't-estencil', fundo: 'c-azul pautado', farejar: true },
  { gesto: 'carimbar', onde: 'Palavras gigantes', texto: 'Petiscos', classe: 't-gigante carimbo', fundo: 'c-laranja pautado' },
  { gesto: 'datilografar', onde: 'Endereço, descrições, etiquetas', texto: 'R. Bárbara Heliodora 【141】 Lourdes · Beagá', classe: 't-maquina', fundo: 'c-rosa pautado' },
  { gesto: 'sacudir', onde: 'Itens do cardápio', texto: 'Sardinha c/ molho de tomate e pimentão', classe: 't-slab', fundo: 'c-creme pautado' },
];

export default function Lab() {
  return (
    <>
      <header className="topo-pagina c-creme pautado">
        <div className="miolo">
          <Letras como="h1" className="t-gigante carimbo" texto="Gestos" gesto="carimbar" />
          <p className="texto" style={{ marginTop: 16 }}>
            Cada tipo de texto entra com um gesto do universo da casa. Passe o mouse nos títulos (farejar) e nos botões (abanar).
          </p>
        </div>
      </header>
      <div className="lab-lista">
        <section id="caso-selo" className="lab-caso c-azul">
          <header>
            <span>selo · as letras rolam até a linha e se curvam no círculo</span>
            <DeNovoSelo />
          </header>
          <Selo tamanho="min(70vw, 360px)" animado olhar />
        </section>
        {CASOS.map((c) => (
          <section key={c.gesto} id={`caso-${c.gesto}`} className={`lab-caso ${c.fundo}`}>
            <header>
              <span>
                {c.gesto} · {c.onde}
              </span>
              <DeNovo alvo={`caso-${c.gesto}`} />
            </header>
            <Letras como="p" className={`amostra ${c.classe}`} texto={c.texto} gesto={c.gesto} farejar={c.farejar} />
          </section>
        ))}
        <section id="caso-sair" className="lab-caso c-creme pautado">
          <header>
            <span>sair da lata · as letras pulam quando a tampa abre</span>
            <DeNovo alvo="caso-sair" />
          </header>
          <div className="lata" data-abrir="">
            <div className="lata-fundo" />
            <div className="lata-dentro" />
            <Letras className="lata-letras t-gigante" texto="Latas" gesto="sair" atraso={650} />
            <div className="lata-tampa">
              <Selo tamanho="clamp(110px, 16vw, 190px)" />
              <span className="lata-anel" />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

/** O selo usa uma animação própria: para repetir, recria o elemento. */
function DeNovoSelo() {
  return (
    <a className="botao vazado abanar" href="/lab#caso-selo">
      Recarregar
    </a>
  );
}
