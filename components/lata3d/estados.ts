// Estados da lata 3D: 0 = a lata da casa (seção "Tudo cabe numa lata"); 1–7 = as latas da prateleira, na ordem
// do cardápio. Fonte: vira-lata-assets/lata-3d (GLB, rótulos e posters em public/lata-3d).

export type Estado = {
  id: string;
  /** cinta em public/lata-3d/rotulos/ (a casa usa a cinta que vem no GLB) */
  rotulo: string | null;
  /** nós `conteudo_*` do GLB que ficam visíveis */
  conteudo: string[];
  liquido: keyof typeof LIQUIDOS;
};

/** cor sRGB (null = o azeite do GLB), opacidade, rugosidade e nível em mm a partir do fundo */
export const LIQUIDOS = {
  azeite: { cor: null, alfa: 0.38, rug: 0.04, nivel: 8.2 },
  verde: { cor: '#b9a640', alfa: 0.46, rug: 0.05, nivel: 8.8 },
  tomate: { cor: '#a8301c', alfa: 0.86, rug: 0.12, nivel: 9.0 },
  banha: { cor: '#efe6d0', alfa: 0.93, rug: 0.42, nivel: 7.6 },
} as const satisfies Record<string, { cor: string | null; alfa: number; rug: number; nivel: number }>;

export const ESTADOS: Estado[] = [
  { id: 'casa', rotulo: null, conteudo: ['conteudo_sardinhas'], liquido: 'azeite' },
  { id: 'truta', rotulo: 'rotulo-1.webp', conteudo: ['conteudo_truta'], liquido: 'azeite' },
  { id: 'sardinha', rotulo: 'rotulo-2.webp', conteudo: ['conteudo_sardinhas', 'conteudo_pimentao'], liquido: 'tomate' },
  { id: 'manjubinha', rotulo: 'rotulo-3.webp', conteudo: ['conteudo_manjubinha'], liquido: 'azeite' },
  { id: 'polvo', rotulo: 'rotulo-4.webp', conteudo: ['conteudo_polvo'], liquido: 'azeite' },
  { id: 'bacalhau', rotulo: 'rotulo-5.webp', conteudo: ['conteudo_bacalhau'], liquido: 'azeite' },
  { id: 'azeitonas', rotulo: 'rotulo-6.webp', conteudo: ['conteudo_azeitonas'], liquido: 'verde' },
  { id: 'carne', rotulo: 'rotulo-7.webp', conteudo: ['conteudo_carne'], liquido: 'banha' },
];

/** Estado do trilho da prateleira, publicado pela Prateleira e lido pela lata 3D. */
export const trilho = {
  /** lata sob a lata 3D, contínuo: 1 = cartão 1 centrado sob ela … 7 = último cartão (0 = a casa, um passo antes) */
  f: 1,
  /** inclinação do trilho pela velocidade (graus), a mesma dos cartões */
  inclina: 0,
};
const ouvintes = new Set<() => void>();
export const avisaTrilho = () => ouvintes.forEach((f) => f());
export const ouveTrilho = (f: () => void) => {
  ouvintes.add(f);
  return () => {
    ouvintes.delete(f);
  };
};
