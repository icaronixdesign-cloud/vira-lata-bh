// Parede de estimação: no bar, porta-retratos com os cachorros da clientela; no site, a mesma ideia.
// Os exemplos usam o cachorro desenhado da casa (nenhuma foto de cliente sem consentimento).

export type Cor = 'azul' | 'laranja' | 'rosa' | 'creme';
export type Moldura = 'madeira' | 'dourada' | 'preta' | 'branca';

export type Quadro = {
  id: string;
  nome: string;
  frase?: string;
  tutor?: string;
  foto?: string;
  cor: Cor;
  moldura: Moldura;
  exemplo?: boolean;
};

export const EXEMPLOS: Quadro[] = [
  { id: 'ex-sardinha', nome: 'Sardinha', frase: 'Late pra qualquer lata que abre.', cor: 'azul', moldura: 'madeira', exemplo: true },
  { id: 'ex-torresmo', nome: 'Torresmo', frase: 'Caramelo de carteirinha.', cor: 'laranja', moldura: 'dourada', exemplo: true },
  { id: 'ex-pacoca', nome: 'Paçoca', frase: 'Dorme embaixo da mesa até o último chope.', cor: 'rosa', moldura: 'preta', exemplo: true },
  { id: 'ex-quindim', nome: 'Quindim', frase: 'Amarelinho e doce, igual o nome.', cor: 'creme', moldura: 'branca', exemplo: true },
  { id: 'ex-bolinho', nome: 'Bolinho', frase: 'Corre atrás do próprio rabo desde 2019.', cor: 'laranja', moldura: 'madeira', exemplo: true },
  { id: 'ex-chourico', nome: 'Chouriço', frase: 'Comprido, baixinho e sempre com fome.', cor: 'azul', moldura: 'dourada', exemplo: true },
  { id: 'ex-pastel', nome: 'Pastel', frase: 'Late com sotaque do Porto.', cor: 'creme', moldura: 'preta', exemplo: true },
  { id: 'ex-azeitona', nome: 'Azeitona', frase: 'Pretinha, recheada de manha.', cor: 'rosa', moldura: 'branca', exemplo: true },
];

const CORES: Cor[] = ['azul', 'laranja', 'rosa', 'creme'];
const MOLDURAS: Moldura[] = ['madeira', 'dourada', 'preta', 'branca'];

/** Cor e moldura variam pela posição, para a parede ficar sortida como a do bar. */
export const estilo = (i: number) => ({ cor: CORES[i % CORES.length], moldura: MOLDURAS[(i * 3 + 1) % MOLDURAS.length] });
