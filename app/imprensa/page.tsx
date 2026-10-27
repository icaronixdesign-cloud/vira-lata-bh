import type { Metadata } from 'next';
import { Letras } from '@/components/Letras';
import { SITE } from '@/content/site';

export const metadata: Metadata = {
  title: 'Imprensa',
  description: 'Release, fatos rápidos, selo e desenhos do Vira-lata, bar da chef Bruna Martins em Lourdes, BH.',
};

const RELEASE = [
  'O Vira-lata é o novo bar da chef Bruna Martins, à frente da Birosca e da Gata Gorda, em Lourdes, Belo Horizonte. A casa abriu em soft opening em outubro de 2026, na Rua Bárbara Heliodora, 141.',
  'O fio condutor são as conservas: as latas ilustradas de sardinha e atum de Portugal e a carne de lata de Minas. O nome vira do avesso o “complexo de vira-lata” de Nelson Rodrigues e põe Brasil e Portugal de igual pra igual.',
  'O cardápio é de petiscos inspirados na cozinha portuguesa e pensados para a botecagem de BH: latas servidas com trios de acompanhamento, bolinho de bacalhau, prego no pão, alheira, polvo à lagareiro e doces como pastel de Belém e quindim.',
];

const FATOS = [
  ['Chef', 'Bruna Martins (Birosca, Gata Gorda)'],
  ['Endereço', 'Rua Bárbara Heliodora, 141, Lourdes, Belo Horizonte'],
  ['Abertura', 'Soft opening em outubro de 2026'],
  ['Horários', 'Terça à quinta 18h–0h · sexta e sábado 12h–0h · domingo 12h–17h'],
  ['Cardápio', 'Latas, petiscos e doces, de R$ 25 a R$ 165'],
  ['Instagram', '@viralata.bh'],
];

const ARQUIVOS = [
  { href: '/imprensa/vira-lata-selo.png', nome: 'Selo VIRA LATA', tipo: 'PNG, fundo transparente' },
  { href: '/imprensa/vira-lata-selo-azul.png', nome: 'Selo no azul', tipo: 'PNG' },
  { href: '/imprensa/vira-lata-cachorro.svg', nome: 'Cachorro do selo', tipo: 'SVG' },
];

const MATERIAS = [
  {
    veiculo: 'O Tempo',
    titulo: 'Chef Bruna Martins anuncia o Vira-lata, novo bar de comida portuguesa e brasileira em Belo Horizonte',
    data: 'jul. 2026',
    url: 'https://www.otempo.com.br/gastronomia/2026/7/23/chef-bruna-martins-anuncia-o-vira-lata-novo-bar-de-comida-portuguesa-e-brasileira-em-belo-horizonte',
  },
  {
    veiculo: 'BHAZ',
    titulo: 'Dona do Birosca e Gata Gorda, chef Bruna Martins vai abrir restaurante de comida portuguesa em BH',
    url: 'https://bhaz.com.br/guia-bhaz/dona-do-birosca-chef-bruna-martins-vai-abrir-restaurante-comida-portuguesa-bh/',
  },
  {
    veiculo: 'Clib',
    titulo: 'Vira-lata: novo bar da chef Bruna Martins abre em BH',
    url: 'https://clib.com.br/noticias/chef-bruna-martins-anuncia-vira-lata-novo-bar-em-bh',
  },
];

export default function Imprensa() {
  return (
    <>
      <header className="topo-pagina c-creme pautado">
        <div className="miolo">
          <Letras como="h1" className="t-gigante carimbo" texto="Imprensa" gesto="carimbar" passo={70} />
          <Letras como="p" className="cardapio-intro" texto="Tudo o que você precisa para escrever sobre o Vira-lata." gesto="pular" atraso={600} passo={14} />
        </div>
      </header>

      <section className="secao c-creme" aria-labelledby="release-titulo">
        <div className="miolo duas-colunas">
          <Letras como="h2" id="release-titulo" className="t-estencil titulo" texto="Release" gesto="rolar" farejar />
          <div className="release">
            {RELEASE.map((p) => (
              <Letras key={p} como="p" className="texto" texto={p} gesto="pular" preguicoso />
            ))}
          </div>
        </div>
      </section>

      <section className="secao c-azul pautado" aria-labelledby="fatos-titulo">
        <div className="miolo">
          <Letras como="h2" id="fatos-titulo" className="t-estencil titulo" texto="Fatos rápidos" gesto="rolar" farejar />
          <dl className="fatos painel c-creme">
            {FATOS.map(([termo, valor]) => (
              <div key={termo}>
                <dt className="t-estencil">{termo}</dt>
                <Letras como="dd" className="t-maquina" texto={valor} gesto="datilografar" preguicoso />
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="secao c-rosa pautado" aria-labelledby="material-titulo">
        <div className="miolo">
          <Letras como="h2" id="material-titulo" className="t-estencil titulo" texto="Para baixar" gesto="rolar" farejar />
          <ul className="arquivos">
            {ARQUIVOS.map((a) => (
              <li key={a.href}>
                <a className="arquivo abanar" href={a.href} download>
                  <Letras texto={a.nome} gesto="sacudir" className="t-slab" />
                  <span className="t-maquina">{a.tipo}</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="t-maquina nota">Fotos oficiais do espaço e dos pratos: em breve.</p>
        </div>
      </section>

      <section className="secao c-creme pautado" aria-labelledby="materias-titulo">
        <div className="miolo">
          <Letras como="h2" id="materias-titulo" className="t-estencil titulo" texto="Na imprensa" gesto="rolar" farejar />
          <ul className="perguntas">
            {MATERIAS.map((m) => (
              <li key={m.url}>
                <p className="t-maquina">
                  {m.veiculo}
                  {m.data ? ` · ${m.data}` : ''}
                </p>
                <a className="materia" href={m.url} target="_blank" rel="noopener noreferrer">
                  <Letras texto={m.titulo} gesto="sacudir" preguicoso className="pergunta" />
                </a>
              </li>
            ))}
          </ul>
          <p className="t-maquina nota">
            Contato: pelo Instagram{' '}
            <a className="link" href={SITE.instagram} target="_blank" rel="noopener noreferrer">
              @viralata.bh
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
