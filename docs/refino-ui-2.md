# Refino de UI · rodada 2 (branch `refino-ui-2`)

Feito em cima do que está no ar (`origin/main`, `13deca8`). Comparativos em `docs/refino-ui-2/`.

## Diagnóstico: por que parecia amador

Os stories da casa (`docs/referencias`) têm um sistema impresso muito claro: cor chapada de ponta a ponta,
estêncil nos títulos, serifa pesada e condensada nos itens, máquina de escrever nos detalhes, fios finos
entre os itens e nenhuma sombra. O site tinha se afastado disso:

- **Pauta de caderno atrás de tudo**, com "halos" apagando as linhas atrás de cada bloco de texto: retângulos
  visíveis em todas as seções.
- **Sombras borradas** em pílulas, botões, cartões, painéis e na borda de cada seção (aspecto lamacento,
  pouca nitidez), e pílulas creme sumindo sobre fundo creme.
- **Roboto Slab** em peso 600–800 no texto corrido (pesado e genérico) e estêncil em 15–18 px na navegação
  e nos botões (os cortes do estêncil viram ruído nesse tamanho).
- **Dois marrons lado a lado** (título do herói em um, selo em outro) e texto com opacidade.
- Espaçamentos fluidos (vw) fora da régua de 8, entrelinhas soltas (1,5 · 1,55 · 1,4…).
- Selo do cabeçalho girando sem parar em 44 px (texto girando tremula).
- Bugs: etiqueta "hoje" em cima de "Terça", título do rodapé com linhas encostando, cabeçalho da prateleira
  2 margens mais largo que a tela (texto cortado à direita no celular e em 1024–1280 px).

## O sistema

**Tipos (um papel por família):**

| Papel | Família | Uso |
| --- | --- | --- |
| Títulos | Stardos Stencil 700 | só de 28 px para cima, sempre no marrom da marca |
| Palavras gigantes | Anton + máscara de carimbo | capas de categoria e rodapé |
| Texto e itens | **Roboto Serif variável** (eixo de largura) | texto 400 · 100 %; apoio 500; itens do cardápio 900 · 62 % (a serifa condensada dos stories); interface 800 · 72 % |
| Detalhes | Courier Prime | etiquetas 12 px caixa-alta espaçada, preços, descrições |

Escala: H1 48→120 · H2 40→88 · H3 28→40 · item 22→34 · apoio 20→24/32 · corpo 18/28 (17 no celular) ·
menor 15/24 · etiqueta 12/16. A Roboto Serif é servida localmente com os eixos cortados para a faixa usada
(`scripts/fonte-texto.mjs`): 75 KB em vez de 147 KB do Google.

**Cor:** marrom da marca (`#6E3F45`) para títulos, selo e palavras gigantes; tinta (`#4B262B`) para texto,
fios e botões (AA em todos os fundos da casa). Sem opacidade em texto.

**Régua de 8:** tokens `--e1`…`--e16` (8 a 128), margens em degraus (80 · 64 · 40 · 24 px), seções 144 · 128 · 96,
controles de 40/48/56 px, entrelinhas fixas em múltiplos de 4/8.

**Forma:** nada de sombra borrada. O que flutua (cabeçalho, barra do celular, chips, cartões) ganha contorno
de 1,5 px em tinta, como etiqueta; a borda de cada seção que sobe ganha um fio de tinta. Raios 8 · 16 · 24 · 32.
O cartão da vez na prateleira sobe com uma sombra dura de estampa.

**Pauta:** só onde o texto assenta nela (manifesto, horários, menu). No manifesto o deslocamento é calculado
do corpo da fonte, para a linha cair 2 px abaixo da linha de base em qualquer largura.

## Números (build de produção local, mesma máquina)

- **Régua:** auditoria automática de margens, paddings, gaps e alturas de controle em 7 páginas × 3 larguras
  (1440, 1024, 390): nenhum valor fora da régua, exceto a geometria do selo e o recuo calculado do trilho.
- **Largura:** nenhuma rolagem horizontal nem elemento cortado em 360, 390, 768, 1024, 1280, 1440 e 1920 px.
- **Console:** sem erros (os avisos de hidratação do `data-in` antecipado foram silenciados onde é esperado).
- **Lighthouse celular (mediana de 3)**, antes (`origin/main`) → depois:

| Página | Performance | LCP | TBT | CLS | Acessibilidade |
| --- | --- | --- | --- | --- | --- |
| Home | 64 → 63 | 3,4 → 3,5 s | ~2,0 → ~1,9 s | 0,007 → 0,002 | 100 → 100 |
| /cardapio | 93 → 91 | 3,2 → 3,5 s | 30 → 30 ms | 0,007 → 0,002 | 100 → 100 |

O TBT alto da home já existia: vem da lata 3D (three.js), não deste refino. A perda de 2 pontos no cardápio é o
custo da fonte variável com eixo de largura (75 KB, pré-carregada; sem preload o FCP piorava de 0,9 para 1,4 s).

## Pendências

- No celular, a lata 3D passa por cima do texto "Servidas na lata" no trajeto entre a seção da lata e a
  prateleira (já acontecia antes; pede ajuste na coreografia da `LataCena`).
- TBT da home (~1,9 s no celular simulado): adiar a inicialização do three.js até a lata se aproximar da tela.
