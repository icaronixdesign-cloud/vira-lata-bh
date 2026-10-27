// Cardápio do soft opening, transcrito dos destaques do Instagram (prints em docs/referencias, 27/10/2026).
// Nomes como a casa escreve ("c/" incluído). `confirmar` marca o que precisa de conferência com a casa.

export type Item = {
  nome: string;
  preco: number;
  descricao?: string;
  nota?: string;
  confirmar?: string;
};

export type Categoria = {
  id: 'latas' | 'petiscos' | 'doces';
  titulo: string;
  cor: 'creme' | 'laranja' | 'rosa';
  intro: string;
  itens: Item[];
};

export const ATUALIZADO = '27/10/2026';

export const ACOMPANHA = {
  titulo: 'Acompanha',
  texto: 'Toda lata chega com um trio, à sua escolha:',
  trios: ['Sour cream, picles e batatas chips', 'Manteiga de anchova, rúcula e cacetinhos'],
};

export const CARDAPIO: Categoria[] = [
  {
    id: 'latas',
    titulo: 'Latas',
    cor: 'creme',
    intro: 'Servidas na lata, com um trio pra acompanhar.',
    itens: [
      { nome: 'Truta defumada no azeite e raspas de limão siciliano', preco: 30 },
      { nome: 'Sardinha c/ molho de tomate e pimentão', preco: 25 },
      { nome: 'Manjubinha curada no azeite e coalhada', preco: 25 },
      { nome: 'Polvo confit c/ vinagrete', preco: 50 },
      { nome: 'Bacalhau no azeite c/ azeitonas picadas', preco: 45 },
      { nome: 'Azeitonas confitadas', preco: 30 },
      { nome: 'Carne de lata c/ alho e cebola caramelizados', preco: 25 },
    ],
  },
  {
    id: 'petiscos',
    titulo: 'Petiscos',
    cor: 'laranja',
    intro: 'Receitas portuguesas reinventadas pra botecagem de BH. Nada é tradicional, tudo é inspiração.',
    itens: [
      { nome: 'Dupla de ostras c/ caju e tucupi', preco: 35 },
      { nome: 'Saladinha de abobrinha e bursin', preco: 40, confirmar: 'grafia: Boursin?' },
      { nome: 'Macarronese de camarão', preco: 90 },
      { nome: 'Peixe frito c/ molho tártaro', preco: 90 },
      { nome: 'Bolinhos de bacalhau c/ pastinha de ovos', preco: 40 },
      { nome: 'Prego no pão', preco: 65 },
      { nome: 'Pipoca de porco', preco: 45 },
      { nome: 'Alheira, ovos escaldados e favas c/ bacon e coraçãozinho', preco: 85 },
      { nome: 'Língua ao vinho do Porto c/ pinhão ou castanha portuguesa', preco: 75 },
      { nome: 'Azeitonas recheadas c/ queijo Minas', preco: 45 },
      { nome: 'Couve-flor do Florestal', preco: 40, nota: 'Um aceno ao Florestal, a casa da chef no bairro Floresta.' },
      { nome: 'Porção de pastel português', preco: 35 },
      { nome: 'Secreto de porco c/ cebolas e uvas', preco: 60 },
      { nome: 'Polvo à lagareiro', preco: 165 },
      { nome: 'Atum c/ feijão branco e caldo verde', preco: 95 },
      { nome: 'Bolovo de alheira c/ creme de queijo e alho', preco: 25 },
    ],
  },
  {
    id: 'doces',
    titulo: 'Doces',
    cor: 'rosa',
    intro: 'Pra fechar a conta com açúcar.',
    itens: [
      {
        nome: 'Quindim fatia c/ nuvem de coco',
        preco: 35,
        descricao: 'doce de ovos assados, servido com nuvem de coco e coco ralado',
      },
      {
        nome: 'Pastel de Belém c/ sorvete de baunilha',
        preco: 35,
        descricao: 'massa folhada envolvida em creme de ovos assados e servida c/ sorvete de baunilha',
      },
      { nome: 'Baba de dinossauro', preco: 35 },
    ],
  },
];

/** Prato do fim de semana anunciado na imprensa; fica "em breve" até a casa confirmar. */
export const FIM_DE_SEMANA = {
  confirmado: false,
  titulo: 'Almoço de fim de semana',
  pratos: [
    { lado: 'Portugal', nome: 'Bacalhoada' },
    { lado: 'Brasil', nome: 'Feijoada' },
  ],
};

export const reais = (valor: number) => `R$ ${valor}`;

export const destaques = (id: Categoria['id'], nomes: string[]) =>
  CARDAPIO.find((c) => c.id === id)!.itens.filter((i) => nomes.includes(i.nome));
