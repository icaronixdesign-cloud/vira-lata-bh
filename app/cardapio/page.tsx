import type { Metadata } from 'next';
import { Letras } from '@/components/Letras';
import { ACOMPANHA, ATUALIZADO, CARDAPIO, reais } from '@/content/cardapio';

export const metadata: Metadata = {
  title: 'Cardápio',
  description: 'Latas, petiscos e doces do Vira-lata, com preços: sardinha, polvo, carne de lata, bolinho de bacalhau, prego no pão, pastel de Belém e mais.',
};

const CAPA = { creme: 'c-creme', laranja: 'c-laranja', rosa: 'c-rosa' } as const;

export default function Cardapio() {
  return (
    <>
      <header className="topo-pagina c-laranja pautado">
        <div className="miolo">
          <Letras como="h1" className="t-gigante carimbo" texto="Cardápio" gesto="carimbar" passo={45} />
          <Letras
            como="p"
            className="cardapio-intro"
            texto="Nada é tradicional, tudo é inspiração: Portugal na lata, Minas no tempero."
            gesto="pular"
            atraso={700}
            passo={14}
          />
        </div>
      </header>

      <nav className="chips" aria-label="Categorias do cardápio">
        {CARDAPIO.map((c) => (
          <a key={c.id} href={`#${c.id}`} className="abanar">
            <Letras texto={c.titulo} gesto="rolar" />
            <span className="conta">{c.itens.length}</span>
          </a>
        ))}
      </nav>

      {CARDAPIO.map((c) => (
        <section key={c.id} id={c.id} className={`categoria ${CAPA[c.cor]}`} aria-labelledby={`titulo-${c.id}`}>
          <div className="capa pautado">
            <div className="miolo">
              <Letras como="h2" id={`titulo-${c.id}`} className="t-gigante carimbo" texto={c.titulo} gesto="carimbar" />
              <Letras como="p" texto={c.intro} gesto="pular" preguicoso />
            </div>
          </div>
          <div className="lista">
            <div className="miolo">
              <ul>
                {c.itens.map((item) => (
                  <li key={item.nome} className="item">
                    <Letras className="item-nome" texto={item.nome} gesto="sacudir" preguicoso />
                    <span className="item-preco">{reais(item.preco)}</span>
                    {item.descricao ? (
                      <Letras como="p" className="item-desc" texto={item.descricao} gesto="datilografar" preguicoso />
                    ) : null}
                    {item.nota ? <p className="item-nota">{item.nota}</p> : null}
                  </li>
                ))}
              </ul>
              {c.id === 'latas' ? (
                <div className="acompanha">
                  <Letras como="h3" className="t-estencil" texto={ACOMPANHA.titulo} gesto="rolar" />
                  <p>{ACOMPANHA.texto}</p>
                  <ul className="trios">
                    {ACOMPANHA.trios.map((trio) => (
                      <li key={trio}>
                        <Letras texto={trio} gesto="sacudir" preguicoso />
                        <span className="t-maquina colchete">trio</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ))}

      <p className="rodape-cardapio">
        Cardápio do soft opening, atualizado em {ATUALIZADO}. Preços em reais. Bebidas e chope: em breve por aqui.
      </p>
    </>
  );
}
