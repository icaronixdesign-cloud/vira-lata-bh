import type { Metadata } from 'next';
import { autorizado } from '@/lib/moderacao';
import { PAREDE_ATIVA, listaDaParede, type Envio } from '@/lib/parede';
import { aprovarEnvio, entrar, removerEnvio, sair } from './acoes';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const metadata: Metadata = { title: 'Moderação da Parede', robots: { index: false, follow: false } };

const data = (iso: string) =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' }).format(new Date(iso));

function Cartao({ envio, aprovado }: { envio: Envio; aprovado?: boolean }) {
  return (
    <li className="mod-cartao">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={envio.foto} alt={`Foto enviada de ${envio.nome}`} decoding="async" />
      <div>
        <p className="pergunta">{envio.nome}</p>
        {envio.frase ? <p className="t-maquina">“{envio.frase}”</p> : null}
        <p className="t-maquina mod-meta">
          {envio.tutor ? `Família: ${envio.tutor} · ` : ''}enviado em {data(envio.criado)}
        </p>
        <div className="mod-acoes">
          {!aprovado ? (
            <form action={aprovarEnvio}>
              <input type="hidden" name="id" value={envio.id} />
              <button className="botao">Aprovar</button>
            </form>
          ) : null}
          <form action={removerEnvio}>
            <input type="hidden" name="id" value={envio.id} />
            <button className="botao vazado">{aprovado ? 'Tirar da parede' : 'Recusar'}</button>
          </form>
        </div>
      </div>
    </li>
  );
}

export default async function Moderar({ searchParams }: { searchParams: Promise<{ erro?: string; aviso?: string }> }) {
  const { erro, aviso } = await searchParams;

  if (!(await autorizado())) {
    return (
      <section className="topo-pagina c-creme moderar">
        <div className="miolo">
          <h1 className="t-estencil titulo">Moderação da Parede</h1>
          <form action={entrar} className="moderar-entrar">
            <label className="campo">
              <span className="t-estencil">Senha</span>
              <input type="password" name="senha" required autoComplete="current-password" />
            </label>
            <button className="botao">Entrar</button>
            {erro ? (
              <p className="envio-msg" role="alert">
                Senha errada.
              </p>
            ) : null}
          </form>
        </div>
      </section>
    );
  }

  const { pendentes: fila, aprovados: naParede } = await listaDaParede('gravar');

  return (
    <section className="topo-pagina c-creme moderar">
      <div className="miolo">
        <div className="mod-topo">
          <h1 className="t-estencil titulo">Moderação da Parede</h1>
          <form action={sair}>
            <button className="botao vazado">Sair</button>
          </form>
        </div>
        {!PAREDE_ATIVA ? <p className="envio-aviso t-maquina">Armazenamento não configurado (BLOB_READ_WRITE_TOKEN).</p> : null}
        {aviso ? (
          <p className="envio-aviso t-maquina" role="alert">
            O armazenamento demorou a responder e nada mudou. Tente de novo.
          </p>
        ) : null}

        <h2 className="t-estencil mod-titulo">Esperando ({fila.length})</h2>
        {fila.length ? (
          <ul className="mod-lista">
            {fila.map((e) => (
              <Cartao key={e.id} envio={e} />
            ))}
          </ul>
        ) : (
          <p className="t-maquina">Nenhum envio esperando.</p>
        )}

        <h2 className="t-estencil mod-titulo">Na parede ({naParede.length})</h2>
        {naParede.length ? (
          <ul className="mod-lista">
            {naParede.map((e) => (
              <Cartao key={e.id} envio={e} aprovado />
            ))}
          </ul>
        ) : (
          <p className="t-maquina">Nenhuma foto aprovada ainda.</p>
        )}
      </div>
    </section>
  );
}
