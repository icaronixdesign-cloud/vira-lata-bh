import type { Metadata } from 'next';
import { Letras } from '@/components/Letras';
import { ParedeForm } from '@/components/ParedeForm';
import { ParedeGaleria } from '@/components/ParedeGaleria';
import { EXEMPLOS } from '@/content/parede';
import { MODO } from '@/content/site';
import { PAREDE_ATIVA, aprovados, paraQuadro } from '@/lib/parede';

// A galeria se atualiza sozinha a cada minuto (e na hora, quando a moderação aprova).
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Parede de estimação',
  description: 'No Vira-lata, uma parede inteira de porta-retratos com os cachorros da clientela. Mande a foto do seu.',
};

export default async function Parede() {
  const reais = (await aprovados()).map(paraQuadro);
  const quadros = [...reais, ...EXEMPLOS];

  return (
    <>
      <header className="topo-pagina c-rosa pautado">
        <div className="miolo">
          <Letras como="h1" className="t-gigante carimbo" texto="Parede" gesto="carimbar" />
          <Letras como="p" className="parede-sub t-estencil" texto="de estimação" gesto="rolar" atraso={600} />
          <Letras
            como="p"
            className="texto"
            texto="No bar, uma parede inteira de porta-retratos com os cachorros da clientela. Aqui também: passe o mouse para balançar, toque para ver a ficha."
            gesto="pular"
            preguicoso
          />
          <div className="acoes">
            <a className="botao abanar" href="#enviar">
              <Letras texto="Coloque o seu na parede" gesto="rolar" atraso={900} />
            </a>
          </div>
        </div>
      </header>

      <section className="parede c-creme" aria-label="Porta-retratos">
        <ParedeGaleria quadros={quadros} />
        {reais.length === 0 ? (
          <p className="parede-nota t-maquina">Os desenhos são exemplos: as fotos de verdade entram aqui depois da moderação.</p>
        ) : null}
      </section>

      <section id="enviar" className="envio-secao c-creme pautado" aria-labelledby="enviar-titulo">
        <div className="miolo">
          <Letras como="h2" id="enviar-titulo" className="t-estencil titulo" texto="Coloque seu cachorro na parede" gesto="rolar" farejar />
          <ParedeForm ativo={PAREDE_ATIVA} pitch={MODO === 'pitch'} />
        </div>
      </section>
    </>
  );
}
