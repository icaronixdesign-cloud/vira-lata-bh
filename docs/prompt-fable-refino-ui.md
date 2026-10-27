# Prompt para o Fable — refinamento de UI/UX do site Vira-lata

Você vai fazer o refinamento de UI/UX do site-proposta do **Vira-lata**, bar luso-mineiro da chef Bruna Martins em Lourdes, Belo Horizonte. Atue como designer de UI sênior e engenheiro de front-end exigente com performance. Cada decisão visual precisa melhorar a leitura, e cada animação precisa rodar fluida.

## Ponto de partida

- Código (público): https://github.com/icaronixdesign-cloud/vira-lata-bh — branch `main`
- Versão no ar, para comparar: https://vira-lata-bh.vercel.app
- Você vai trabalhar num Mac, numa cópia local do repositório. Não há acesso de escrita ao GitHub nem à Vercel, e não é para ter: o resultado sai num arquivo (veja "Entrega").
- Preparação:
  ```bash
  git clone https://github.com/icaronixdesign-cloud/vira-lata-bh.git
  cd vira-lata-bh
  git checkout -b refino-ui
  npm install
  npm run dev        # desenvolvimento
  npm run build && npm start   # versão de produção, igual à Vercel
  ```
- Stack: Next 16.3 (App Router, Turbopack), React 19.3 e TypeScript. O CSS é próprio, em `app/globals.css`, com os tokens no topo; não há Tailwind. Como é Next 16, consulte `node_modules/next/dist/docs/` antes de usar qualquer API do Next.
- Leia `README.md` antes de começar.

## O que é o site (preserve)

- **Identidade** tirada dos stories da casa (prints em `docs/referencias`):
  - cores: marrom #6E3F45, laranja #F5881F, azul #00A4FE, creme #F5E9D1, rosa #F5BBB0;
  - fontes: estêncil (Stardos Stencil) nos títulos, slab (Roboto Slab) nos itens, máquina de escrever (Courier Prime) nos detalhes;
  - palavras gigantes carimbadas (Anton + a máscara `public/texturas/carimbo.png`);
  - o selo VIRA LATA com o cachorro (`components/Selo.tsx`, `components/cachorro-path.ts`);
  - o papel pautado (classe `.pautado`).
- **Toda frase anima letra a letra.** É uma decisão do cliente; mantenha.
  - `components/Letras.tsx` tem os gestos `rolar`, `pular`, `carimbar`, `datilografar`, `sacudir` e `sair`. A opção `preguicoso` divide textos longos só quando entram na tela e os devolve a texto corrido no fim. `abanar` balança as letras no hover; `farejar` faz as letras fugirem do cursor.
  - `components/Interacoes.tsx` concentra um único IntersectionObserver, os loops pausados fora da tela, os cartões sticky empilhados e os olhos do cachorro.
  - `/lab` mostra cada gesto isolado.
- **Páginas:** `/`, `/cardapio`, `/o-bar`, `/parede` (+ `/parede/moderar`), `/visite`, `/imprensa`, `/privacidade`, `/lab`.
- **Modo proposta:** sem a variável `SITE_MODE`, o site fica em `pitch`: `noindex`, robots bloqueando tudo e o selo "Projeto conceito". Mantenha.
- **Parede de estimação:** o envio de fotos usa o Vercel Blob, e as chaves não estão no repositório. Na sua cópia, o formulário aparece como "fechado para envios"; isso é esperado.
  - Não mude a lógica de armazenamento: `lib/parede.ts`, `app/api/parede/*` e `app/parede/moderar/*`. Ela grava versões numeradas que nunca são sobrescritas, por causa do cache da CDN.
  - O visual da Parede (galeria, ficha, formulário) você pode refazer à vontade.
- **Regras do cliente:**
  - fundos claros, sem telas escuras (o azul, o laranja e o rosa da marca valem);
  - espaçamentos em múltiplos de 8 e acabamento premium;
  - no toque, a rolagem vertical nunca pode ser bloqueada: só eventos passivos, nada de `preventDefault` em toque;
  - `prefers-reduced-motion` sempre respeitado;
  - sem JavaScript, o texto continua legível;
  - a lata do conceito é **lata de sardinha** (retangular e baixa), nunca lata de bebida.
- **Conteúdo:** os fatos da casa estão em `content/*.ts`. Não invente informação.

## O que fazer

### 1. Leitura e visibilidade (prioridade)

Hoje as linhas do papel pautado passam por trás de quase todo texto e cortam as letras de parágrafos, itens do cardápio, formulário, painéis e rodapé. Resolva sem perder o pautado como assinatura da marca:

- Texto corrido e texto pequeno nunca ficam sobre uma linha. Para cada seção, escolha uma das três saídas e aplique de forma consistente:
  - a linha some atrás do bloco de texto (máscara ou fundo sólido no bloco);
  - o texto assenta *na* linha, com entrelinha igual à pauta e deslocamento calculado, como já funciona em `.manifesto-linhas`;
  - o pautado fica só nas margens e em áreas decorativas.
- Contraste AA em todo o site:
  - marrom sobre creme (~7:1) e sobre rosa (~5:1) serve para qualquer texto;
  - sobre laranja (~3,4:1) e azul (~3,2:1), só texto de 19 px ou mais, em negrito;
  - revise cada ocorrência: subtítulos, preços, etiquetas, chips, status, rodapé e todo texto pequeno em `t-maquina`.
- Escala tipográfica revista: hierarquia clara, corpo de no mínimo 18 px no celular, linhas de 45 a 70 caracteres, entrelinha confortável e nenhuma palavra sozinha na última linha dos títulos.

### 2. Seção de scroll horizontal imersiva: "Prateleira das latas"

Substitua o cartão "Latas" da home por uma prateleira em que o scroll vertical move as latas na horizontal.

- **Conteúdo, na ordem:**
  - abre com a palavra LATAS carimbada;
  - passa pelas 7 latas do cardápio (`content/cardapio.ts`), cada uma como um rótulo de conserva portuguesa, com nome, preço, uma cor da marca e um desenho simples;
  - fecha com o bloco "Acompanha" (os dois trios) e o botão para o cardápio.
- **Movimento:**
  - camadas em velocidades diferentes: a palavra gigante ao fundo, as latas no meio, pequenos elementos na frente;
  - leve inclinação conforme a velocidade do scroll;
  - as letras dos rótulos entram com os gestos que já existem;
  - indicador de progresso no estilo da chave que enrola a tampa da lata.
- **Implementação:**
  - container `position: sticky` com `transform` calculado a partir do progresso do scroll;
  - sem sequestrar a rolagem e sem pin que trave o toque;
  - se melhorar a sensação, use rolagem suave da roda do mouse (por exemplo, Lenis) só no desktop, nunca no toque.
- **Celular:** a mesma prateleira com altura proporcional e cartões maiores, ou uma faixa horizontal nativa com scroll-snap. Meça as duas e fique com a que for mais fluida.
- **Movimento reduzido:** vira uma lista horizontal com scroll-snap, sem animação.

### 3. Scroll e animações fluidos no site inteiro

Meça antes de mexer e depois de cada mudança importante. Pontos suspeitos:

- 800 a 900 letras (`.l`) ao mesmo tempo na home; a meta é ficar abaixo de 800. Use mais `preguicoso` e deixe a divisão em letras feita no servidor só onde a frase é vista inteira.
- `backdrop-filter` nas pílulas do cabeçalho, nos chips e na barra do celular durante o scroll.
- Sombras grandes nos cartões sticky.
- `mask-image` da textura nas palavras gigantes enquanto elas animam.
- Cálculo do `farejar` e dos olhos do cachorro a cada quadro.
- HTML da home com cerca de 230 KB, por causa do estilo inline em cada letra.
- Quatro famílias de fonte: faça subconjunto e preload só do que aparece na primeira dobra.
- `content-visibility` nas seções fora da tela.

Regras: anime só `transform` e `opacity`; nada de `will-change` permanente; loops pausados fora da tela.

**Metas:**
- Lighthouse celular com 90 ou mais em performance e 100 em acessibilidade, na mediana de 3 medições. Meça na versão de produção local (`npm run build && npm start`), com o antes (`main`) e o depois servidos do mesmo jeito.
- Nenhuma tarefa longa acima de 50 ms durante o scroll.
- 60 fps no desktop e sem quedas visíveis num celular médio (no Chrome, com a CPU 4× mais lenta).

### 4. Alinhamento e acabamento de UI

Revise como designer de UI:

- grade e container de 1200 px, margens laterais;
- ritmo vertical entre seções em múltiplos de 8;
- alinhamento de títulos e textos com a grade e com o pautado;
- cabeçalho: pílulas e status com a mesma altura e alinhamento óptico;
- botões: alturas, espaçamentos internos e estados de hover, foco e clique;
- raios e sombras consistentes em cartões e painéis;
- chips do cardápio, formulário e ficha da Parede, rodapé.

Confira em 360, 390, 768, 1024, 1280, 1440 e 1920 px de largura. Nenhuma página pode ter rolagem horizontal.

## Fora do escopo

- A lata de sardinha em 3D (é outra tarefa).
- Mudanças nos textos e nos fatos da casa.
- Mudanças na lógica de armazenamento da Parede.
- `git push`, deploy na Vercel e qualquer mudança no site publicado.

## Como conferir

- Capturas com Playwright e o Chrome do Mac. `scripts/capturas.mjs` rola a página e salva as capturas no desktop ou no celular. Aponte o Chrome assim:
  ```bash
  CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node scripts/capturas.mjs http://localhost:3000 .capturas / cel 8 0.9
  ```
- Não rode `scripts/e2e-parede.mjs`: ele precisa das chaves de armazenamento, que não estão no repositório.
- `npm run build` precisa terminar sem erros e sem nenhum aviso de "Dynamic server usage".

## Entrega

O resultado volta para outra máquina num arquivo. Por isso, tudo precisa estar dentro do projeto e commitado.

1. Commits pequenos na branch `refino-ui`, com mensagens claras em português.
2. `docs/refino-ui.md`, com:
   - o que mudou e por quê, seção por seção;
   - capturas antes e depois, no desktop e no celular, salvas em `docs/refino-ui/`;
   - números de Lighthouse e de quadros por segundo, antes e depois.
3. Exporte dois arquivos para a Mesa (`~/Desktop`), rodando de dentro da pasta do projeto:
   ```bash
   git bundle create ~/Desktop/vira-lata-refino-ui.bundle main..refino-ui
   git archive --format=zip -o ~/Desktop/vira-lata-refino-ui.zip refino-ui
   ```
   O bundle carrega o histórico dos commits. O zip é a cópia completa do código, para garantir.
4. No fim, me passe:
   - o caminho dos dois arquivos;
   - a lista de commits;
   - um resumo curto do que mudou e do que ficou de fora.
