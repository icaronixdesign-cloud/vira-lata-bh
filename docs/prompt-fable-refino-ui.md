# Prompt para o Fable — refinamento de UI/UX do site Vira-lata

Você vai refinar a UI/UX do site-proposta do **Vira-lata**, bar luso-mineiro da chef Bruna Martins em Lourdes, BH. Trabalhe como designer de UI sênior que também é um engenheiro de front-end obcecado por performance: cada decisão visual precisa melhorar a leitura, e cada animação precisa rodar fluida.

## Projeto

- Pasta: `C:\Users\Icaronix\Documents\Claude\vira-lata-bh`
- Repositório (privado): https://github.com/icaronixdesign-cloud/vira-lata-bh — branch `main`
- No ar: https://vira-lata-bh.vercel.app (projeto Vercel `vira-lata-bh`, conta icaronixdesign-5231)
- Stack: Next 16.3 (App Router, Turbopack) + React 19.3 + TypeScript; CSS próprio em `app/globals.css` (tokens no topo), sem Tailwind. É Next 16: antes de usar qualquer API do Next, leia o guia em `node_modules/next/dist/docs/`.
- Rodar: `npm run dev` (launch `vira-lata-dev`, porta 3120). Produção local, igual à Vercel: `npm run build && npm start -- --port 3121` (launch `vira-lata-prod`).
- Leia antes de começar: `README.md` e as memórias `vira-lata-bh-site`, `web-perf-lessons`, `scroll-preview-verification`, `touch-vertical-scroll-never-blocked`, `feedback-white-8pt-phone-mockup`, `feedback-awwwards-references` e `vercel-blob-gotchas`.

## Como o site é hoje (preserve)

- Identidade tirada dos stories da casa (prints em `docs/referencias`): marrom #6E3F45, laranja #F5881F, azul #00A4FE, creme #F5E9D1, rosa #F5BBB0. Estêncil (Stardos Stencil) nos títulos, slab (Roboto Slab) nos itens, máquina de escrever (Courier Prime) nos detalhes, palavras gigantes carimbadas (Anton + máscara `public/texturas/carimbo.png`), o selo VIRA LATA com o cachorro (`components/Selo.tsx`, `components/cachorro-path.ts`) e o papel pautado (classe `.pautado`).
- **Toda frase anima letra a letra** (decisão do cliente; mantenha). `components/Letras.tsx` tem os gestos `rolar`, `pular`, `carimbar`, `datilografar`, `sacudir` e `sair`. Com `preguicoso`, textos longos se dividem só ao entrar na tela e voltam a texto corrido no fim. `abanar` faz as letras balançarem no hover e `farejar` faz elas fugirem do cursor. `components/Interacoes.tsx` concentra um único IntersectionObserver, os loops pausados fora da tela, os cartões sticky empilhados e os olhos do cachorro.
- Páginas: `/`, `/cardapio`, `/o-bar`, `/parede` (+ `/parede/moderar`), `/visite`, `/imprensa`, `/privacidade`, `/lab` (laboratório de gestos, fora do menu).
- Modo proposta (`SITE_MODE` ausente = `pitch`): `noindex`, robots bloqueando tudo, selo "Projeto conceito". Mantenha.
- **Não mude a lógica de armazenamento da Parede** (`lib/parede.ts`, `app/api/parede/*`, `app/parede/moderar/*`). Ela grava a lista em versões numeradas que nunca são sobrescritas no Vercel Blob, por causa do cache da CDN (memória `vercel-blob-gotchas`). O visual da Parede você pode refazer à vontade.
- Regras do usuário: fundos claros, sem telas escuras (azul, laranja e rosa da marca são ok). Espaçamentos em múltiplos de 8 e acabamento premium. No toque, a rolagem vertical nunca pode ser bloqueada (só eventos passivos). `prefers-reduced-motion` sempre respeitado. Sem JS, o texto continua legível. A lata do conceito é **lata de sardinha** (retangular, baixa), nunca lata de bebida.
- Conteúdo e fatos vêm de `content/*.ts`; não invente informação sobre a casa.

## O que fazer

### 1. Leitura e visibilidade (prioridade)

Hoje as linhas do papel pautado correm por trás de quase todo texto e cortam as letras de parágrafos, itens do cardápio, formulário, painéis e rodapé. Resolva sem perder o pautado como assinatura:

- Texto corrido e texto pequeno nunca ficam sobre uma linha. Para cada seção, escolha uma das três saídas e aplique de forma consistente:
  - a linha some atrás do bloco de texto (máscara ou fundo sólido no bloco);
  - o texto assenta *na* linha (entrelinha = pauta e deslocamento calculado, como já funciona em `.manifesto-linhas`);
  - o pautado fica só nas margens e áreas decorativas.
- Contraste AA em todo o site. Marrom sobre creme (~7:1) e sobre rosa (~5:1) serve para qualquer texto. Sobre laranja (~3,4:1) e azul (~3,2:1), só texto ≥ 19 px em negrito. Revise cada ocorrência: subtítulos, preços, etiquetas, chips, status, rodapé e todo `t-maquina` pequeno.
- Escala tipográfica revista: hierarquia clara, corpo ≥ 18 px no celular, medida de 45 a 70 caracteres, entrelinha confortável, nenhuma viúva nos títulos.

### 2. Seção de scroll horizontal imersiva — "Prateleira das latas"

Substitua o cartão "Latas" da home por uma prateleira em que o scroll vertical move as latas na horizontal:

- **Conteúdo, na ordem:**
  - abre com a palavra LATAS carimbada;
  - passa pelas 7 latas do cardápio (`content/cardapio.ts`), cada uma como um rótulo de conserva portuguesa, com nome, preço, uma cor da marca e um desenho simples;
  - termina no bloco "Acompanha" (os dois trios) e no botão para o cardápio.
- **Movimento:**
  - camadas em velocidades diferentes: palavra gigante ao fundo, latas no meio, pequenos elementos na frente;
  - leve inclinação conforme a velocidade do scroll;
  - letras dos rótulos entrando com os gestos que já existem;
  - indicador de progresso no estilo da chave que enrola a tampa da lata.
- **Implementação:**
  - container `position: sticky` + `transform` calculado do progresso do scroll, sem sequestrar a rolagem e sem pin que trave o toque;
  - se melhorar a sensação, use smooth scroll de roda (ex.: Lenis) só no desktop com mouse, nunca no toque.
- **Celular:** a mesma prateleira com altura proporcional e cartões maiores, ou uma faixa horizontal nativa com scroll-snap. Escolha medindo qual fica mais fluida de verdade.
- **Movimento reduzido:** vira uma lista horizontal com scroll-snap, sem animação.

### 3. Scroll e animações fluidos no site inteiro

Meça antes de mexer e depois de cada mudança importante. Pontos suspeitos:

- 800–900 letras (`.l`) ao mesmo tempo na home; a meta é menos de 800. Use mais `preguicoso` e deixe letra a letra no servidor só onde a frase é vista inteira.
- `backdrop-filter` nas pílulas do cabeçalho, nos chips e na barra do celular durante o scroll.
- Sombras grandes nos cartões sticky.
- `mask-image` da textura nas palavras gigantes enquanto animam.
- Cálculo por quadro do `farejar` e dos olhos do cachorro.
- HTML da home com ~230 KB (estilo inline por letra).
- Fontes: 4 famílias. Faça subconjunto e preload só do que aparece na primeira dobra.
- `content-visibility` nas seções fora da tela.

Regras: anime só `transform` e `opacity`; nada de `will-change` permanente; loops pausados fora da tela.

**Metas:**
- Lighthouse celular ≥ 90 em performance e 100 em acessibilidade (mediana de 3, medida na URL de preview da Vercel, não no servidor local).
- Nenhuma tarefa longa acima de 50 ms durante o scroll.
- 60 fps no desktop e sem quedas visíveis num celular médio (Chrome com CPU 4× mais lenta).

### 4. Alinhamento e acabamento de UI

Revise como designer de UI:
- grade e container de 1200, margens laterais;
- ritmo vertical entre seções (múltiplos de 8);
- alinhamento de títulos e textos com a grade e com o pautado;
- cabeçalho: pílulas e status com a mesma altura e alinhamento ótico;
- botões: alturas, paddings e estados hover, focus e active;
- raios e sombras consistentes em cartões e painéis;
- chips do cardápio, formulário da Parede, ficha do cachorro e rodapé.

Confira em 360, 390, 768, 1024, 1280, 1440 e 1920 px. Zero rolagem horizontal.

## Fora do escopo

- A lata de sardinha 3D (é outra tarefa).
- Mudanças no texto da casa.
- Mudanças no armazenamento da Parede.

## Como trabalhar e conferir

- Crie a branch `refino-ui` a partir da `main`. Faça commits pequenos, com mensagens claras em português.
- Confira visualmente com Playwright + Chrome instalado. O painel do navegador do app falseia as animações quando está escondido.
  - `scripts/capturas.mjs` captura uma página rolando, no desktop ou no celular. No Git Bash, prefixe com `MSYS_NO_PATHCONV=1`. Exemplo: `MSYS_NO_PATHCONV=1 node scripts/capturas.mjs http://127.0.0.1:3121 .capturas / cel 8 0.9`.
- Se mexer em qualquer coisa da Parede, rode `node scripts/e2e-parede.mjs http://127.0.0.1:3121` contra o build de produção local. O script envia uma foto de teste, modera, aprova, confere a grade e a ficha e apaga tudo no fim. Para só limpar sobras, use `--so-limpar`. O armazenamento é o mesmo do site publicado, então nunca deixe teste para trás.
- `npm run build` precisa terminar sem erros e sem nenhum aviso de "Dynamic server usage".

## Entrega

1. `docs/refino-ui.md`, com:
   - o que mudou e por quê;
   - capturas antes e depois, no desktop e no celular;
   - números de Lighthouse e de quadros por segundo, antes e depois.
2. Push da branch `refino-ui` e um deploy de **preview** (`npx vercel deploy --yes`). Me mande o link.
3. Merge na `main` e deploy de produção (`npx vercel deploy --prod --yes`) só depois que eu aprovar.
