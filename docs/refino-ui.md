# Refino de UI/UX · branch `refino-ui`

Refinamento visual e de performance do site-proposta do Vira-lata, feito em cima da `main`
(commit `8a901d8`). Tudo medido na versão de produção local (`npm run build && npm start`),
com o antes (`main`) e o depois servidos do mesmo jeito, na mesma máquina.

As capturas estão em `docs/refino-ui/antes/` e `docs/refino-ui/depois/` (home, cardápio,
parede, visite e o bar, no desktop e no celular, feitas com `scripts/capturas.mjs`).

---

## 1. Leitura e visibilidade

**Problema:** as linhas do papel pautado passavam por trás de quase todo texto e cortavam
as letras de parágrafos, itens do cardápio, formulário, painéis e rodapé. No laranja e no
azul, texto pequeno em marrom ficava abaixo do contraste AA (3,4:1 e 3,2:1) — na `main`,
o Lighthouse do `/cardapio` já acusava a nota de item em 17 px sobre laranja (3,42:1).

**O que mudou (cada seção usa uma das três saídas do briefing, de forma consistente):**

- **A linha some atrás do bloco** — texto corrido e texto pequeno apagam a pauta atrás
  de si com o fundo da própria seção (`--fundo` em cada classe `c-*` + um halo de 12 px).
  Vale para `.texto`, intros, títulos em estêncil, listas de destaques e perguntas,
  release, formulário da Parede, rodapé, nomes dos quadros e etiquetas. A pauta segue
  viva nas margens e áreas decorativas.
- **O texto assenta na linha** — manifesto (como já era), **horários** (cada linha ocupa
  uma pauta inteira e a régua do papel é a divisória, com a pauta na própria lista
  deslocada até a base das letras) e os links do **menu de tela cheia** (um por linha).
- **Pauta atrás, de propósito** — só nas palavras gigantes carimbadas (`.carimbo`), onde
  a textura de tinta gasta faz as linhas parecerem parte do carimbo.

**Contraste AA em todo o site:**

- No azul e no laranja, a tinta desce para o marrom escuro `#4B262B`: **4,8:1** no azul e
  **5,2:1** no laranja — AA para texto de qualquer tamanho, sem exceção por tamanho.
- As palavras carimbadas seguem no marrom da marca (gigantes, passam no AA de texto grande).
- Marrom sobre creme (7,1:1) e sobre rosa (5,1:1) seguem valendo para tudo.
- Acessibilidade do Lighthouse: home 100 (como antes); `/cardapio` subiu de **96 → 100**.

**Escala tipográfica:**

- Corpo nunca abaixo de 18 px no celular (`.texto` 19–23 px; descrições de item 17 → 18 px;
  rodapé 17 → 18 px); etiquetas e metadados subiram para 13–16 px.
- Linhas de texto corrido entre 45 e 70 caracteres (`.texto` 40ch → 52ch; respostas 60ch).
- `text-wrap: balance` nos títulos: nenhuma palavra sozinha na última linha.
- Título das páginas internas cabe em telas estreitas (piso 56 px/18vw — "Privacidade"
  inteira num 360).

## 2. Prateleira das latas

O cartão "Latas" da home virou a seção imersiva `components/Prateleira.tsx`:

- **Conteúdo na ordem do briefing:** abre com LATAS carimbada + a intro da categoria,
  passa pelas 7 latas de `content/cardapio.ts` — cada uma um rótulo de conserva
  portuguesa (lata retangular e baixa, moldura dupla, nome, preço em colchetes, uma cor
  da marca e um desenho de traço simples: truta, sardinhas, cardume, polvo, bacalhau,
  azeitonas e a lata de carne) — e fecha com o bloco Acompanha (os dois trios) e o botão
  para o cardápio.
- **Movimento:** palco `position: sticky` e trilho com `transform` calculado do progresso
  do scroll (rolagem vertical nativa — sem preventDefault, só eventos passivos, nada de
  pin que trave o toque). Três camadas: palavra-fantasma ao fundo (0,35×), latas (1×) e
  fagulhas na frente (1,25×). Os rótulos inclinam até 3,5° conforme a velocidade. As
  letras entram com os gestos existentes (`carimbar`, `sacudir`, `rolar`).
- **Indicador:** a chave de lata no rodapé do palco gira 540° e enrola a "tampa"
  (barra `scaleX`) conforme o progresso.
- **Roda do mouse:** deslize suave via lerp (fator 0,16) **só com ponteiro fino** — sem
  Lenis, sem biblioteca; no toque o mapeamento é 1:1.
- **Celular:** medidas as duas variantes no Chrome com CPU 4× mais lenta —
  faixa nativa com scroll-snap: **23–25 fps e 5–6 tarefas longas**;
  prateleira imersiva: **16 fps e 109 tarefas longas**. Ficou a faixa nativa no toque
  (o modo imersivo exige `hover + pointer: fine`).
- **Movimento reduzido e sem JS:** o padrão do CSS já é a faixa horizontal com
  scroll-snap, sem animação; o modo imersivo só liga por cima disso.

## 3. Scroll e animações fluidos

Medido antes e depois de cada mudança (`Lighthouse` + contadores de fps/tarefas longas
via Playwright/CDP; números completos na seção 5).

- **Letras vivas:** toda frase dividida volta a ser **texto corrido** quando a última
  letra assenta — não só os `preguicoso`. Só `abanar` e `farejar` ficam divididos (precisam
  das letras no hover). O marca-texto `.k` sobrevive à junção palavra a palavra, e o
  `/lab` ("De novo") re-divide sob demanda. Na home: eram **874 letras fixas**; agora
  pico de ~735 no carregamento e **250–480 em regime** (conforme as frases assentam).
- **HTML da home:** 233 KB → **187 KB** (manifesto virou `preguicoso` com suporte a
  `data-destaques` no `divide()`, e os gestos `rolar`/`pular` dispensam o `--r` por letra).
- **Primeira dobra sem esperar o React:** um script inline marca `data-in` nos textos
  já divididos que estão na primeira dobra — a animação é CSS puro, então o herói anima
  junto com o selo em vez de esperar a hidratação.
- **backdrop-filter:** removido das pílulas do cabeçalho, dos chips e da barra do celular
  (o vidro a 94% de opacidade dá o mesmo efeito sem desfoque por quadro). Ficou só no
  backdrop da ficha, que é estático.
- **Máscara do carimbo:** durante a animação a textura vai para **cada letra**
  (camadas pequenas, a textura acompanha o movimento); no texto corrido volta ao bloco.
- **Sombras dos cartões sticky** reduzidas (blur 48 → 32 px, deslocamento menor).
- **content-visibility: auto** nas seções das páginas internas (`.secao`, `.categoria`,
  `.envio-secao`, `.parede`) — a home não usa porque os cartões são sticky.
- **Fontes:** Stardos Stencil só no peso 700 (o 400 não era usado — um woff2 a menos);
  Anton mantida no preload por ser o LCP das páginas internas.
- **Pré-divisão ociosa:** textos `preguicoso` a até 1000 px da tela dividem em
  `requestIdleCallback` (sem prazo — num scroll contínuo nada roda ali e a divisão fica
  para a entrada, como antes).
- Loops continuam pausados fora da tela; só `transform` e `opacity` animam; sem
  `will-change` permanente.

## 4. Alinhamento e acabamento

- Pílulas do cabeçalho (marca, navegação, status) com a **mesma altura de 56 px**.
- Botões com estado de clique (afundam e encolhem a sombra), além do hover e do foco.
- **Raio único de 24 px** (token `--raio`) em painéis, citações, fichas, arquivos e
  moderação; o rótulo de lata mantém raio próprio (é uma lata), e as pílulas seguem 999.
- Ritmo em múltiplos de 8: itens 16 px, perguntas 24 px, respiro de 16 px entre título e
  texto (por causa do halo de 12 px que apaga a pauta).
- Barra do celular sem quebra de rótulo; etiqueta "hoje" dos horários fora do texto.
- Conferido em 360, 390, 768, 1024, 1280, 1440 e 1920 px: **nenhuma página tem rolagem
  horizontal** (verificado com scroll programático: `scrollX` permanece 0 em todas).

## 5. Números

Build de produção local, mesma máquina (container Linux; os valores absolutos são mais
baixos que num hardware real, mas antes/depois foram medidos do mesmo jeito).

### Lighthouse celular (mediana de 3 medições)

| Página | Antes (`main`) | Depois (`refino-ui`) |
| --- | --- | --- |
| Home — performance | **86** (76 · 86 · 95) | **93** (89 · 93 · 94) |
| Home — acessibilidade | **100** | **100** |
| /cardapio — performance | **86** (80 · 86 · 87) | **88** (88 · 88 · 89) |
| /cardapio — acessibilidade | **96** (contraste AA reprovado) | **100** |

Métricas da home (mediana): FCP 1,28 s → 1,03 s · LCP 3,63 s → 2,96 s ·
TBT 130 ms → 149 ms · Speed Index 4,45 s → 1,65 s · CLS 0 → 0,007.
No /cardapio o TBT caiu de 329 ms → 186 ms. Observação: o LCP destas páginas é a palavra
gigante animada — o valor inclui o fim da entrada letra a letra, que é decisão do cliente.

### Letras e HTML

| Medida | Antes | Depois |
| --- | --- | --- |
| Letras `.l` vivas na home | 874 (fixas) | pico ~735 no load; 250–480 em regime |
| Letras `.l` vivas em /o-bar | 987 (fixas) | 592 no fim do passeio, caindo conforme junta |
| Letras `.l` em /cardapio · /visite · /parede | 322 · 211 · 165 (fixas) | 157 · 80 · 131 no fim do passeio |
| HTML da home | 233 KB | 187 KB |
| Marca-texto do manifesto | — | preservado após a junção (5 palavras) |

### Scroll (Chrome headless, rolagem sintética de ~7.500 px/s)

| Cenário | Antes | Depois |
| --- | --- | --- |
| Home, desktop 1× — fps médio / p95 / tarefas longas | 31 fps / 67 ms / 1 | **33 fps / 50 ms / 0** |
| Home, celular CPU 4× — fps / tarefas longas | 20 fps / 46 (página de 10.083 px) | 20 fps / 47 (página de 13.244 px, +31%) |
| /cardapio, celular CPU 4× | — (não medido no antes) | 20 fps / 29 |
| Faixa da prateleira, celular CPU 4× (fling horizontal) | — | **23 fps / 5 tarefas longas** |
| /privacidade, celular CPU 4× (referência sem letras/sticky) | — | 29 fps / 2 |

Leitura honesta: no desktop o passeio inteiro ficou **sem nenhuma tarefa longa**. No
celular com CPU 4× e rolagem contínua de estresse, as tarefas longas (50–100 ms) continuam
aparecendo na entrada das letras — é o custo do "toda frase anima letra a letra" somado ao
empilhamento sticky; a comparação justa é por pixel rolado (página 31% maior com o mesmo
total). A referência da /privacidade mostra que fora das entradas de letras o site roda limpo.

## 6. Decisões e pendências

- **Faixa nativa no toque** (medida, não opinião): 23 fps/5 TL contra 16 fps/109 TL do
  modo imersivo no celular.
- **Lenis não entrou**: o lerp próprio de ~20 linhas dá o deslize da roda sem dependência
  nova e desliga sozinho no toque.
- **Abertura mais ágil**: título aos 250 ms, subtítulo 1,1 s, botões 1,6–1,75 s (era
  0,5/1,7/2,3/2,5 s) — mesma coreografia, metade da espera; carimbo dos títulos de topo
  um pouco mais rápido (passo 45–70 ms).
- **/cardapio ficou em 88** na mediana (meta era 90): o que falta é o LCP da palavra
  carimbada animada; dá para ganhar o resto encurtando a animação do herói interno ou
  deixando a primeira dobra interna sem divisão de letras — não fiz porque mexe na regra
  "toda frase anima letra a letra".
- **Fora do escopo, não tocado:** lata de sardinha 3D, textos e fatos da casa, lógica de
  armazenamento da Parede (`lib/parede.ts`, `app/api/parede/*`, moderação), deploy.
