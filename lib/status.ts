import { DIAS, HORARIOS } from '@/content/horarios';

export type Status = { aberto: boolean; texto: string; curto: string };

const SEMANA = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Dia da semana e minuto do dia em Belo Horizonte, seja qual for o fuso de quem visita. */
export function agoraEmBH(data = new Date()) {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(data);
  const valor = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? '0';
  return { dia: SEMANA.indexOf(valor('weekday')), minuto: Number(valor('hour')) * 60 + Number(valor('minute')) };
}

export function hora(minuto: number) {
  const h = Math.floor(minuto / 60) % 24;
  const m = minuto % 60;
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

export function status(data = new Date()): Status {
  const { dia, minuto } = agoraEmBH(data);
  const hoje = HORARIOS[dia];
  if (hoje && minuto >= hoje.abre && minuto < hoje.fecha) {
    const falta = hoje.fecha - minuto;
    return {
      aberto: true,
      texto: `Aberto agora · até ${hora(hoje.fecha)}`,
      curto: falta <= 60 ? 'Fecha já já' : 'Aberto agora',
    };
  }
  if (hoje && minuto < hoje.abre) {
    return { aberto: false, texto: `Fechado · abre hoje às ${hora(hoje.abre)}`, curto: `Abre às ${hora(hoje.abre)}` };
  }
  for (let k = 1; k <= 7; k++) {
    const proximo = (dia + k) % 7;
    const faixa = HORARIOS[proximo];
    if (faixa) {
      const quando = k === 1 ? 'amanhã' : DIAS[proximo];
      return { aberto: false, texto: `Fechado · abre ${quando} às ${hora(faixa.abre)}`, curto: `Abre ${quando}` };
    }
  }
  return { aberto: false, texto: 'Fechado', curto: 'Fechado' };
}
