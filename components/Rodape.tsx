import Link from 'next/link';
import { LINHAS_HORARIO } from '@/content/horarios';
import { MODO, SITE } from '@/content/site';
import { Letras } from './Letras';

export function Rodape() {
  return (
    <footer className="rodape pautado">
      <div className="miolo">
        <Letras como="p" className="rodape-grito t-gigante carimbo" texto="Seu bar de estimação" gesto="carimbar" passo={55} />
        <div className="rodape-grade">
          <div>
            <h2 className="t-estencil">Endereço</h2>
            <address className="t-maquina">
              {SITE.endereco.rua} <span className="colchete">{SITE.endereco.numero}</span>
              <br />
              {SITE.endereco.bairro} · {SITE.endereco.apelido}
            </address>
            <a className="link" href={SITE.mapas.google} target="_blank" rel="noopener noreferrer">
              Como chegar
            </a>
          </div>
          <div>
            <h2 className="t-estencil">Horários</h2>
            <ul className="t-maquina">
              {LINHAS_HORARIO.map((l) => (
                <li key={l.dias}>
                  {l.dias}: {l.horas}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="t-estencil">Da mesma família</h2>
            <p className="t-maquina">{SITE.familia.join(' · ')}</p>
            <a className="link" href={SITE.instagram} target="_blank" rel="noopener noreferrer">
              Late pra gente no Instagram
            </a>
          </div>
        </div>
        <div className="rodape-base t-maquina">
          <Link href="/cardapio">Cardápio</Link>
          <Link href="/o-bar">O bar</Link>
          <Link href="/parede">Parede</Link>
          <Link href="/visite">Visite</Link>
          <Link href="/imprensa">Imprensa</Link>
          <Link href="/privacidade">Privacidade</Link>
          {MODO === 'pitch' ? (
            <span className="conceito">Projeto conceito · proposta não oficial de site para o Vira-lata</span>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
