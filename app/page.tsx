import Link from 'next/link';
import { Horarios } from '@/components/Horarios';
import { Letras } from '@/components/Letras';
import { Prateleira } from '@/components/Prateleira';
import { Selo } from '@/components/Selo';
import { ParedeGaleria } from '@/components/ParedeGaleria';
import { CARDAPIO, FIM_DE_SEMANA, destaques, reais } from '@/content/cardapio';
import { EXEMPLOS } from '@/content/parede';
import { MODO, SITE } from '@/content/site';
import { aprovados, paraQuadro } from '@/lib/parede';

// A chamada da Parede mostra as fotos aprovadas mais recentes.
export const revalidate = 60;

// O manifesto é o post de apresentação da casa no Instagram.
const MANIFESTO = [
  'Tem bar que a gente conhece.',
  'E tem bar que a gente adota.',
  'Por isso eu gosto das latas.',
  'A gente pega uma lata, enche de carinho e de ideias',
  'e leva pra mesa pra chamar de nossa.',
  'Brasil e Portugal, de igual pra igual,',
  'sem complexos, tomando um chope numa mesa de bar.',
];

const CARTOES = [
  {
    id: 'petiscos' as const,
    cor: 'c-laranja',
    escolhidos: ['Bolinhos de bacalhau c/ pastinha de ovos', 'Prego no pão', 'Alheira, ovos escaldados e favas c/ bacon e coraçãozinho'],
  },
  {
    id: 'doces' as const,
    cor: 'c-rosa',
    escolhidos: ['Quindim fatia c/ nuvem de coco', 'Pastel de Belém c/ sorvete de baunilha', 'Baba de dinossauro'],
  },
];

export default async function Inicio() {
  const quadros = [...(await aprovados()).map(paraQuadro), ...EXEMPLOS].slice(0, 4);
  return (
    <>
      {/* 1. Abertura: o selo se monta como no destaque da casa */}
      <section className="cartao c-azul abertura" aria-labelledby="abertura-titulo">
        <div className="miolo abertura-grade">
          <div>
            <Letras
              como="h1"
              id="abertura-titulo"
              className="t-estencil"
              texto={SITE.chamada}
              gesto="pular"
              atraso={500}
              passo={34}
              farejar
            />
            <Letras
              como="p"
              className="abertura-sub"
              texto="Latas, petiscos e chope gelado da chef Bruna Martins em Lourdes, Beagá."
              gesto="pular"
              atraso={1700}
              passo={12}
            />
            <div className="acoes">
              <Link href="/cardapio" className="botao abanar">
                <Letras texto="Ver cardápio" gesto="rolar" atraso={2300} />
              </Link>
              <Link href="/visite" className="botao claro abanar">
                <Letras texto="Como chegar" gesto="rolar" atraso={2500} />
              </Link>
            </div>
            {MODO === 'pitch' ? <p className="conceito-tag">Projeto conceito · não oficial</p> : null}
          </div>
          <Selo tamanho="min(40vw, 560px, 68svh)" animado girar olhar />
        </div>
      </section>

      {/* 2. Manifesto: cada frase pula numa linha do pautado */}
      <section className="cartao c-creme manifesto" aria-labelledby="manifesto-titulo">
        <div className="miolo">
          <Letras como="h2" id="manifesto-titulo" className="t-estencil titulo" texto="Adote um bar" gesto="rolar" farejar />
          <div className="manifesto-linhas pautado">
            {MANIFESTO.map((linha, k) => (
              <Letras
                key={linha}
                como="p"
                texto={linha}
                gesto="pular"
                atraso={k * 140}
                passo={16}
                destaques={['adota', 'latas', 'Brasil', 'Portugal', 'chope']}
              />
            ))}
          </div>
          <p className="manifesto-assina">— do post de abertura do Vira-lata</p>
        </div>
      </section>

      {/* 3. A lata (2D por enquanto; o modelo 3D da lata de sardinha entra aqui) */}
      <section className="cartao c-creme pautado" aria-labelledby="lata-titulo">
        <div className="miolo lata-grade">
          <div>
            <Letras como="h2" id="lata-titulo" className="t-estencil titulo" texto="Tudo cabe numa lata" gesto="rolar" farejar />
            <Letras
              como="p"
              className="texto"
              preguicoso
              gesto="pular"
              texto="Em Portugal, sardinha e atum viram lembrança de viagem em latas ilustradas. Em Minas, a carne de lata atravessa gerações. O Vira-lata junta as duas latas na mesma mesa de bar."
            />
          </div>
          <div className="lata" data-abrir="">
            <div className="lata-fundo" />
            <div className="lata-dentro" />
            <Letras className="lata-letras t-gigante" texto="Petiscos" gesto="sair" atraso={650} />
            <div className="lata-tampa">
              <Selo tamanho="clamp(120px, 18vw, 210px)" />
              <span className="lata-anel" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Prateleira das latas: o scroll vertical move as latas na horizontal */}
      <Prateleira />

      {/* 5. Petiscos e doces em cartões, como as capas dos stories */}
      {CARTOES.map((c) => {
        const categoria = CARDAPIO.find((x) => x.id === c.id)!;
        return (
          <section key={c.id} className={`cartao ${c.cor} pautado cardapio-cartao`} aria-labelledby={`cartao-${c.id}`}>
            <div className="miolo">
              <Letras como="h2" id={`cartao-${c.id}`} className="t-gigante carimbo" texto={categoria.titulo} gesto="carimbar" />
              <Letras como="p" className="cardapio-intro" texto={categoria.intro} gesto="pular" preguicoso />
              <ul className="destaques">
                {destaques(c.id, c.escolhidos).map((item) => (
                  <li key={item.nome}>
                    <Letras texto={item.nome} gesto="sacudir" preguicoso />
                    <Letras className="preco" texto={reais(item.preco)} gesto="sacudir" />
                  </li>
                ))}
              </ul>
              <div className="acoes">
                <Link href={`/cardapio#${c.id}`} className="botao abanar">
                  <Letras texto={`Ver os ${categoria.itens.length} ${categoria.titulo.toLowerCase()}`} gesto="rolar" />
                </Link>
              </div>
            </div>
          </section>
        );
      })}

      {/* 5. Fim de semana: Portugal × Brasil */}
      <section className="cartao fds" aria-labelledby="fds-titulo">
        <h2 id="fds-titulo" className="sr">
          {FIM_DE_SEMANA.titulo}
        </h2>
        <div className="fds-grade">
          {FIM_DE_SEMANA.pratos.map((prato, k) => (
            <div key={prato.nome} className={`fds-lado pautado ${k === 0 ? 'c-azul' : 'c-laranja'}`}>
              <Letras como="p" className="fds-pais" texto={prato.lado} gesto="datilografar" />
              <Letras como="h3" className="t-gigante carimbo" texto={prato.nome} gesto="carimbar" atraso={k * 300} />
            </div>
          ))}
        </div>
        <div className="fds-selo">
          <Letras como="p" className="t-estencil" texto={FIM_DE_SEMANA.confirmado ? 'Almoço de fim de semana' : 'Fim de semana · em breve'} gesto="rolar" />
        </div>
      </section>

      {/* 6. Parede de estimação */}
      <section className="cartao c-creme pautado" aria-labelledby="parede-titulo">
        <div className="miolo">
          <Letras como="h2" id="parede-titulo" className="t-estencil titulo" texto="Parede de estimação" gesto="rolar" farejar />
          <Letras
            como="p"
            className="texto"
            preguicoso
            gesto="pular"
            texto="No bar, uma parede de porta-retratos com os cachorros da clientela. No site também: mande a foto do seu."
          />
          <ParedeGaleria quadros={quadros} />
          <div className="acoes">
            <Link href="/parede" className="botao abanar">
              <Letras texto="Ver a Parede inteira" gesto="rolar" />
            </Link>
            <Link href="/parede#enviar" className="botao claro abanar">
              <Letras texto="Coloque o seu" gesto="rolar" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. A chef */}
      <section className="cartao c-creme pautado" aria-labelledby="chef-titulo">
        <div className="miolo chef-grade">
          <div>
            <Letras como="h2" id="chef-titulo" className="t-estencil titulo" texto="Quem comanda" gesto="rolar" farejar />
            <Letras
              como="p"
              className="texto"
              preguicoso
              gesto="pular"
              texto="Bruna Martins tem mais de 15 anos de cozinha em BH. É a chef da Birosca, da brigada toda feminina que pesquisa peixes de rio mineiros, e da Gata Gorda. No Vira-lata, ela pega receitas portuguesas e reinventa tudo pro paladar da botecagem belo-horizontina."
            />
          </div>
          <blockquote className="citacao">
            <Letras como="p" texto="Nada é tradicional, tudo é inspiração." gesto="datilografar" passo={40} />
            <footer>— Bruna Martins</footer>
          </blockquote>
        </div>
      </section>

      {/* 7. Visite: horários no pautado e endereço no rosa, como os destaques */}
      <section className="cartao c-azul" aria-labelledby="visite-titulo">
        <div className="miolo">
          <Letras como="h2" id="visite-titulo" className="t-estencil titulo" texto="Vem pro bar" gesto="rolar" farejar />
          <div className="visite-grade" style={{ marginTop: 32 }}>
            <div className="painel c-creme">
              <Letras como="h3" className="t-estencil titulo" texto="Horários" gesto="rolar" />
              <Horarios />
            </div>
            <div className="painel c-rosa pautado endereco">
              <Letras
                como="address"
                className="t-maquina"
                texto={`R. Bárbara Heliodora 【${SITE.endereco.numero}】 Lourdes · ${SITE.endereco.apelido}`}
                gesto="datilografar"
              />
              <div className="mapas">
                <a className="botao" href={SITE.mapas.google} target="_blank" rel="noopener noreferrer">
                  Google Maps
                </a>
                <a className="botao" href={SITE.mapas.waze} target="_blank" rel="noopener noreferrer">
                  Waze
                </a>
                <a className="botao" href={SITE.mapas.uber} target="_blank" rel="noopener noreferrer">
                  Uber
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
