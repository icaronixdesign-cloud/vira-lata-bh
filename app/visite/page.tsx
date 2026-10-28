import type { Metadata } from 'next';
import { Horarios } from '@/components/Horarios';
import { Letras } from '@/components/Letras';
import { StatusChip } from '@/components/StatusChip';
import { SITE } from '@/content/site';

export const metadata: Metadata = {
  title: 'Visite',
  description: 'Rua Bárbara Heliodora, 141, Lourdes, BH. Terça à quinta 18h–0h, sexta e sábado 12h–0h, domingo 12h–17h.',
};

const PERGUNTAS = [
  {
    p: 'Abre pra almoço?',
    r: 'Sexta, sábado e domingo a casa abre ao meio-dia. De terça a quinta, abre às 18h.',
  },
  { p: 'Abre segunda?', r: 'Não. Segunda o vira-lata descansa.' },
  { p: 'Como acompanhar as novidades?', r: 'No Instagram @viralata.bh, onde a casa posta tudo o que sai da lata.' },
];

export default function Visite() {
  return (
    <>
      <header className="topo-pagina c-azul">
        <div className="miolo">
          <Letras como="h1" className="t-gigante carimbo" texto="Visite" gesto="carimbar" passo={60} />
          <div className="acoes">
            <StatusChip />
          </div>
        </div>
      </header>

      <section className="lista c-azul" aria-label="Endereço e horários">
        <div className="miolo visite-grade">
          <div className="painel c-rosa endereco">
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
          <div className="painel c-creme">
            <Letras como="h2" className="t-estencil titulo" texto="Horários" gesto="rolar" />
            <Horarios />
          </div>
        </div>
      </section>

      <section className="topo-pagina c-creme" aria-labelledby="perguntas-titulo">
        <div className="miolo">
          <Letras como="h2" id="perguntas-titulo" className="t-estencil titulo" texto="Perguntas" gesto="rolar" farejar />
          <ul className="perguntas">
            {PERGUNTAS.map((q) => (
              <li key={q.p}>
                <Letras como="h3" className="pergunta" texto={q.p} gesto="sacudir" preguicoso />
                <Letras como="p" className="resposta" texto={q.r} gesto="datilografar" preguicoso />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
