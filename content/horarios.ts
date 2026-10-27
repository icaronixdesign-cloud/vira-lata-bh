// Horários do destaque "Horários" (27/10/2026). Minutos desde 0h; 1440 = meia-noite.
// Índice do dia: 0 = domingo … 6 = sábado.

export type Faixa = { abre: number; fecha: number };

const h = (horas: number) => horas * 60;

export const HORARIOS: Record<number, Faixa | null> = {
  0: { abre: h(12), fecha: h(17) },
  1: null,
  2: { abre: h(18), fecha: h(24) },
  3: { abre: h(18), fecha: h(24) },
  4: { abre: h(18), fecha: h(24) },
  5: { abre: h(12), fecha: h(24) },
  6: { abre: h(12), fecha: h(24) },
};

export const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'] as const;

/** Linhas como a casa escreve no story, com os dias de cada linha para marcar "hoje". */
export const LINHAS_HORARIO = [
  { dias: 'Terça à quinta', horas: '18h—0h', indices: [2, 3, 4] },
  { dias: 'Sexta e sábado', horas: '12h—0h', indices: [5, 6] },
  { dias: 'Domingo', horas: '12h—17h', indices: [0] },
  { dias: 'Segunda', horas: 'Fechado', indices: [1] },
] as const;
