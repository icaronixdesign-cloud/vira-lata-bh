'use client';

import { upload } from '@vercel/blob/client';
import { useEffect, useRef, useState } from 'react';
import { Letras } from './Letras';
import { QuadroArte } from './ParedeGaleria';

type Estado = 'pronto' | 'enviando' | 'ok' | 'erro';

/** Reduz a foto no próprio navegador (até 1200 px, WebP) antes de mandar: envio rápido e leve. */
async function reduz(arquivo: File): Promise<Blob> {
  const bitmap = await createImageBitmap(arquivo, { imageOrientation: 'from-image' });
  const k = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * k);
  canvas.height = Math.round(bitmap.height * k);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const comoBlob = (tipo: string, q: number) => new Promise<Blob | null>((ok) => canvas.toBlob(ok, tipo, q));
  const webp = await comoBlob('image/webp', 0.82);
  if (webp && webp.type === 'image/webp') return webp;
  const jpg = await comoBlob('image/jpeg', 0.86);
  if (!jpg) throw new Error('foto');
  return jpg;
}

const slug = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'cachorro';

export function ParedeForm({ ativo, pitch }: { ativo: boolean; pitch: boolean }) {
  const [foto, setFoto] = useState<Blob | null>(null);
  const [previa, setPrevia] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [frase, setFrase] = useState('');
  const [tutor, setTutor] = useState('');
  const [aceite, setAceite] = useState(false);
  const [estado, setEstado] = useState<Estado>('pronto');
  const [mensagem, setMensagem] = useState('');
  const isca = useRef<HTMLInputElement>(null);

  useEffect(
    () => () => {
      if (previa) URL.revokeObjectURL(previa);
    },
    [previa],
  );

  async function escolhe(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    setMensagem('');
    if (!arquivo.type.startsWith('image/')) {
      setMensagem('Escolha uma foto (JPG, PNG ou WebP).');
      return;
    }
    try {
      const reduzida = await reduz(arquivo);
      setFoto(reduzida);
      setPrevia(URL.createObjectURL(reduzida));
    } catch {
      setMensagem('Não conseguimos abrir essa foto. Tente uma JPG ou PNG.');
    }
  }

  async function envia(e: React.FormEvent) {
    e.preventDefault();
    if (!foto || !nome.trim() || !aceite) {
      setMensagem(!foto ? 'Falta a foto.' : !nome.trim() ? 'Falta o nome do cachorro.' : 'Falta marcar a autorização.');
      return;
    }
    setEstado('enviando');
    setMensagem('');
    try {
      const extensao = foto.type === 'image/webp' ? 'webp' : 'jpg';
      const blob = await upload(`parede/fotos/${slug(nome)}.${extensao}`, foto, {
        access: 'public',
        handleUploadUrl: '/api/parede/upload',
        contentType: foto.type,
      });
      const resposta = await fetch('/api/parede/envios', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ nome, frase, tutor, consentimento: aceite, foto: blob.url, site: isca.current?.value ?? '' }),
      });
      const dados = (await resposta.json().catch(() => ({}))) as { error?: string };
      if (!resposta.ok) throw new Error(dados.error ?? 'Não deu certo agora. Tente de novo.');
      setEstado('ok');
    } catch (erro) {
      setEstado('erro');
      setMensagem((erro as Error).message || 'Não deu certo agora. Tente de novo.');
    }
  }

  function recomeca() {
    setFoto(null);
    setPrevia(null);
    setNome('');
    setFrase('');
    setTutor('');
    setAceite(false);
    setEstado('pronto');
  }

  if (estado === 'ok') {
    return (
      <div className="envio-ok">
        <Letras como="p" className="t-estencil titulo" texto="Recebido! Au au." gesto="pular" />
        <p className="texto">A foto passa por uma olhadinha antes de entrar na parede.</p>
        <button type="button" className="botao vazado" onClick={recomeca}>
          Mandar outro cachorro
        </button>
      </div>
    );
  }

  return (
    <form className="envio" onSubmit={envia} noValidate>
      {pitch ? (
        <p className="envio-aviso t-maquina">
          Demonstração · projeto conceito: a foto fica guardada só para teste e não vai para a parede do bar.
        </p>
      ) : null}
      {!ativo ? <p className="envio-aviso t-maquina">Os envios estão fechados por enquanto.</p> : null}
      <div className="envio-grade">
        <div className="envio-campos">
          <label className="foto-alvo">
            <input type="file" accept="image/*" onChange={escolhe} className="sr" disabled={!ativo} />
            <span className="t-estencil">{previa ? 'Trocar a foto' : 'Escolher a foto'}</span>
            <span className="t-maquina">JPG, PNG ou WebP. A gente reduz antes de mandar.</span>
          </label>
          <label className="campo">
            <span className="t-estencil">Nome do cachorro</span>
            <input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={40} required autoComplete="off" />
          </label>
          <label className="campo">
            <span className="t-estencil">Uma frase sobre ele</span>
            <input value={frase} onChange={(e) => setFrase(e.target.value)} maxLength={120} placeholder="opcional" autoComplete="off" />
          </label>
          <label className="campo">
            <span className="t-estencil">Seu nome</span>
            <input value={tutor} onChange={(e) => setTutor(e.target.value)} maxLength={60} placeholder="opcional, aparece na ficha" autoComplete="name" />
          </label>
          <input ref={isca} name="site" tabIndex={-1} autoComplete="off" className="isca" aria-hidden="true" />
          <label className="aceite">
            <input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} />
            <span>
              Autorizo mostrar esta foto, o nome do meu cachorro e o meu nome (se preenchi) na Parede do site. Posso pedir
              para tirar quando quiser (veja a <a href="/privacidade">privacidade</a>).
            </span>
          </label>
          <button className="botao abanar" disabled={!ativo || estado === 'enviando'}>
            {estado === 'enviando' ? 'Mandando…' : <Letras texto="Mandar pra parede" gesto="rolar" />}
          </button>
          <p className="envio-msg" role="status" aria-live="polite">
            {mensagem}
          </p>
        </div>
        <figure className="envio-previa">
          <div className="quadro moldura-madeira">
            <QuadroArte q={{ nome, foto: previa ?? undefined, cor: 'azul', moldura: 'madeira' }} alt="Prévia da sua foto" />
            <span className="quadro-nome">{nome.trim() || 'Seu cachorro'}</span>
          </div>
          <figcaption className="t-maquina">Assim ele fica na parede.</figcaption>
        </figure>
      </div>
    </form>
  );
}
