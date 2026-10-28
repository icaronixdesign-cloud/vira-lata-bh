import type { Metadata } from 'next';
import Link from 'next/link';
import { Letras } from '@/components/Letras';
import { Selo } from '@/components/Selo';
import { SITE } from '@/content/site';

export const metadata: Metadata = {
  title: 'O bar',
  description:
    'O conceito do Vira-lata: as conservas de Portugal e a carne de lata de Minas na mesma mesa, o nome que vira do avesso o complexo de vira-lata e a chef Bruna Martins.',
};

// O manifesto completo, como a casa publicou no Instagram. Cada bloco é uma estrofe.
const MANIFESTO = [
  ['Tem bar que a gente conhece.', 'E tem bar que a gente adota.'],
  ['Por isso eu gosto das latas.', 'A gente pega uma lata, enche de carinho e de ideias', 'e leva pra mesa pra chamar de nossa.'],
  ['E dentro da lata,', 'a ideia vira conserva,', 'vira petisco, vira mistura', 'de lusofonia com butecagem tupiniquim.'],
  ['Brasil e Portugal,', 'de igual pra igual,', 'sem complexos,', 'tomando um chope', 'numa mesa de bar.'],
  ['Em Lourdes,', 'esse encontro', 'vira comida,', 'vira chope,', 'vira-lata.'],
  ['Seu bar de estimação.'],
];

export default function OBar() {
  let linha = 0;
  return (
    <>
      <header className="topo-pagina c-laranja">
        <div className="miolo">
          <Letras como="h1" className="t-gigante carimbo" texto="O bar" gesto="carimbar" passo={70} />
          <Letras
            como="p"
            className="cardapio-intro"
            texto="Brasil e Portugal, de igual pra igual, numa mesa de bar em Lourdes."
            gesto="pular"
            atraso={600}
            passo={14}
          />
        </div>
      </header>

      <section className="secao c-creme" aria-labelledby="manifesto-titulo">
        <div className="miolo manifesto">
          <Letras como="h2" id="manifesto-titulo" className="t-estencil titulo" texto="O manifesto" gesto="rolar" farejar />
          <div className="manifesto-linhas pautado">
            {MANIFESTO.map((estrofe, k) => (
              <div key={k} className="estrofe">
                {estrofe.map((verso) => (
                  <Letras
                    key={verso}
                    como="p"
                    texto={verso}
                    gesto="pular"
                    atraso={(linha++ % 5) * 120}
                    passo={14}
                    preguicoso
                    destaques={['adota', 'latas', 'lata', 'conserva', 'Brasil', 'Portugal', 'chope', 'vira-lata']}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="secao c-azul" aria-labelledby="nome-titulo">
        <div className="miolo duas-colunas">
          <Letras como="h2" id="nome-titulo" className="t-gigante carimbo" texto="O nome" gesto="carimbar" />
          <div>
            <Letras
              como="p"
              className="texto"
              preguicoso
              gesto="pular"
              texto="“Complexo de vira-lata” é a expressão que Nelson Rodrigues criou para a sensação de inferioridade de muitos brasileiros diante de outros países."
            />
            <Letras
              como="p"
              className="texto"
              preguicoso
              gesto="pular"
              texto="A chef Bruna Martins virou a expressão do avesso: em vez de copiar a cozinha portuguesa ao pé da letra, o Vira-lata põe Brasil e Portugal para conversar de igual pra igual, com a irreverência e o bom humor do boteco mineiro."
            />
          </div>
        </div>
      </section>

      <section className="secao-dupla" aria-labelledby="latas-titulo">
        <h2 id="latas-titulo" className="sr">
          Duas latas, uma mesa
        </h2>
        <div className="c-azul lado">
          <Letras como="p" className="fds-pais" texto="Portugal" gesto="datilografar" />
          <Letras como="h3" className="t-gigante carimbo" texto="Conserva" gesto="carimbar" />
          <Letras
            como="p"
            className="texto"
            preguicoso
            gesto="pular"
            texto="Sardinha, atum e outros pescados vão para latas ilustradas que viram lembrança de viagem."
          />
        </div>
        <div className="c-laranja lado">
          <Letras como="p" className="fds-pais" texto="Minas" gesto="datilografar" />
          <Letras como="h3" className="t-gigante carimbo" texto="Carne de lata" gesto="carimbar" />
          <Letras
            como="p"
            className="texto"
            preguicoso
            gesto="pular"
            texto="Há décadas, a carne de lata tem lugar de destaque na mesa mineira. No Vira-lata, as duas latas sentam juntas."
          />
        </div>
      </section>

      <section className="secao c-creme" aria-labelledby="espaco-titulo">
        <div className="miolo duas-colunas">
          <Letras como="h2" id="espaco-titulo" className="t-estencil titulo" texto="O espaço" gesto="rolar" farejar />
          <div>
            <Letras
              como="p"
              className="texto"
              preguicoso
              gesto="pular"
              texto="A inspiração junta os mercados e as tascas de Portugal com o boteco tradicional de BH: petisco generoso, chope gelado e conversa comprida."
            />
            <Letras
              como="p"
              className="texto"
              preguicoso
              gesto="pular"
              texto="E tem uma parede inteira de porta-retratos com os cachorros da clientela, que a chef recolheu numa campanha antes da abertura."
            />
            <div className="acoes">
              <Link href="/parede" className="botao abanar">
                <Letras texto="Ver a Parede" gesto="rolar" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="secao c-rosa" aria-labelledby="chef-titulo">
        <div className="miolo chef-grade">
          <div>
            <Letras como="h2" id="chef-titulo" className="t-estencil titulo" texto="Bruna Martins" gesto="rolar" farejar />
            <Letras
              como="p"
              className="texto"
              preguicoso
              gesto="pular"
              texto="Mais de 15 anos de carreira e uma das principais vozes da gastronomia mineira contemporânea. Na Birosca, comanda uma cozinha afetiva com brigada inteiramente feminina, que pesquisa ingredientes regionais, em especial os peixes de rio mineiros."
            />
            <Letras
              como="p"
              className="texto"
              preguicoso
              gesto="pular"
              texto="Também está à frente da Gata Gorda. O Florestal, no bairro Floresta, fechou em junho de 2026 depois de quatro anos, e uma couve-flor de lá virou petisco no Vira-lata."
            />
          </div>
          <blockquote className="citacao">
            <Letras como="p" texto="Nada é tradicional, tudo é inspiração." gesto="datilografar" passo={40} />
            <footer>— Bruna Martins</footer>
          </blockquote>
        </div>
      </section>

      <section className="secao c-azul" aria-labelledby="rua-titulo">
        <div className="miolo duas-colunas">
          <div>
            <Letras como="h2" id="rua-titulo" className="t-estencil titulo" texto="A rua" gesto="rolar" farejar />
            <Letras
              como="p"
              className="texto"
              preguicoso
              gesto="pular"
              texto="O bar fica numa rua com nome de poeta: Bárbara Heliodora, heroína da Inconfidência Mineira. Número 141, no coração de Lourdes."
            />
            <div className="acoes">
              <Link href="/visite" className="botao claro abanar">
                <Letras texto="Como chegar" gesto="rolar" />
              </Link>
            </div>
          </div>
          <Selo tamanho="min(70vw, 360px)" girar olhar className="o-bar-selo" />
        </div>
      </section>
      <p className="sr">{SITE.endereco.completo}</p>
    </>
  );
}
