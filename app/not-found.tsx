import Link from 'next/link';
import { Cachorro } from '@/components/Cachorro';
import { Letras } from '@/components/Letras';

export default function NaoEncontrada() {
  return (
    <section className="sumiu c-laranja pautado">
      <div>
        <Cachorro olhar className="sumiu-cachorro" />
        <Letras como="h1" className="t-estencil titulo" texto="Essa página fugiu de casa" gesto="pular" farejar />
        <Letras como="p" className="texto" texto="Mas o bar continua no mesmo lugar." gesto="datilografar" atraso={900} />
        <div className="acoes" style={{ justifyContent: 'center' }}>
          <Link href="/" className="botao abanar">
            <Letras texto="Voltar pro início" gesto="rolar" />
          </Link>
        </div>
      </div>
    </section>
  );
}
