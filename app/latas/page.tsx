import type { Metadata } from 'next';
import { Letras } from '@/components/Letras';
import { LataVitrine } from '@/components/LataVitrine';

export const metadata: Metadata = {
  title: 'Latas',
  description: 'As sete latas do Vira-lata em 3D: gire, abra e veja o que vem dentro de cada uma.',
};

export default function Latas() {
  return (
    <>
      <header className="topo-pagina c-laranja">
        <div className="miolo">
          <Letras como="h1" className="t-gigante carimbo" texto="Latas" gesto="carimbar" passo={60} />
        </div>
      </header>
      <section className="cartao c-creme vitrine-sec" aria-label="Vitrine das latas">
        <div className="miolo">
          <LataVitrine />
        </div>
      </section>
    </>
  );
}
