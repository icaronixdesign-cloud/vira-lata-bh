// Dados da casa. Endereço, horários e cardápio vêm dos destaques do Instagram (27/10/2026).

/** `pitch`: proposta ainda não aprovada pela casa (noindex + selo "Projeto conceito"). `live`: site oficial. */
export const MODO: 'pitch' | 'live' = process.env.SITE_MODE === 'live' ? 'live' : 'pitch';

const enderecoCompleto = 'Rua Bárbara Heliodora, 141 - Lourdes, Belo Horizonte - MG';

export const SITE = {
  nome: 'Vira-lata',
  slogan: 'Seu bar de estimação',
  chamada: 'O seu mais novo bar de estimação',
  descricao:
    'Bar e choperia luso-mineira da chef Bruna Martins em Lourdes, BH: latas, petiscos e chope gelado. Brasil e Portugal de igual pra igual.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vira-lata-bh.vercel.app',
  endereco: {
    rua: 'Rua Bárbara Heliodora',
    numero: '141',
    bairro: 'Lourdes',
    cidade: 'Belo Horizonte',
    uf: 'MG',
    apelido: 'Beagá',
    completo: enderecoCompleto,
  },
  instagram: 'https://www.instagram.com/viralata.bh/',
  instagramChef: 'https://www.instagram.com/brunamartins.cozinha/',
  familia: ['Birosca', 'Gata Gorda'],
  mapas: {
    google: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Vira-lata, ${enderecoCompleto}`)}`,
    waze: `https://waze.com/ul?q=${encodeURIComponent(enderecoCompleto)}&navigate=yes`,
    uber: `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff%5Bformatted_address%5D=${encodeURIComponent(enderecoCompleto)}`,
  },
} as const;

export const NAV = [
  { href: '/cardapio', rotulo: 'Cardápio' },
  { href: '/visite', rotulo: 'Visite' },
] as const;
