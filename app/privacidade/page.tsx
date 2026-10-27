import type { Metadata } from 'next';
import { Letras } from '@/components/Letras';
import { MODO, SITE } from '@/content/site';

export const metadata: Metadata = {
  title: 'Privacidade',
  description: 'Como o site do Vira-lata trata as fotos e os dados enviados para a Parede de estimação.',
};

const TOPICOS = [
  {
    t: 'O que guardamos',
    r: 'Só o que entra na Parede de estimação: a foto que você manda, o nome do cachorro, a frase sobre ele e, se você quiser, o seu nome. Não pedimos e-mail nem telefone, e não guardamos seu endereço de IP.',
  },
  { t: 'Para quê', r: 'Para mostrar a foto na Parede do site, depois de uma moderação. Nada é vendido nem repassado.' },
  { t: 'Com que base', r: 'O seu consentimento, marcado no formulário. Você pode retirá-lo quando quiser.' },
  {
    t: 'Onde fica',
    r: 'As fotos e os dados ficam guardados no Vercel Blob, o armazenamento da Vercel, que hospeda o site. As fotos aprovadas ficam públicas na Parede.',
  },
  {
    t: 'Por quanto tempo',
    r:
      MODO === 'pitch'
        ? 'Este site é um projeto conceito, ainda não é o canal oficial do Vira-lata: as fotos enviadas servem só para demonstração e são apagadas depois da apresentação do projeto. Para pedir a remoção antes disso, fale com quem te mandou o link.'
        : `Enquanto a foto estiver na Parede. Para tirar, é só pedir pelo Instagram ${SITE.instagram.replace('https://www.instagram.com/', '@').replace(/\/$/, '')}.`,
  },
  {
    t: 'Cookies',
    r: 'O site não usa cookies de rastreamento nem de publicidade. O único cookie é o da área de moderação, usado só pela equipe que aprova as fotos.',
  },
];

export default function Privacidade() {
  return (
    <section className="topo-pagina c-creme pautado">
      <div className="miolo">
        <Letras como="h1" className="t-gigante carimbo" texto="Privacidade" gesto="carimbar" passo={45} />
        <ul className="perguntas">
          {TOPICOS.map((topico) => (
            <li key={topico.t}>
              <Letras como="h2" className="pergunta" texto={topico.t} gesto="sacudir" preguicoso />
              <Letras como="p" className="resposta t-maquina" texto={topico.r} gesto="datilografar" preguicoso />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
