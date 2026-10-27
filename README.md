# Vira-lata · site

Proposta de site para o **Vira-lata**, bar e choperia luso-mineira da chef Bruna Martins
(Rua Bárbara Heliodora, 141, Lourdes, BH). Projeto conceito, não oficial, até a casa aprovar.

## Rodar

```bash
npm install
npm run dev      # http://127.0.0.1:3000 (launch "vira-lata-dev" usa a porta 3120)
npm run build && npm start
```

## Modo pitch × oficial

`SITE_MODE=pitch` (padrão quando a variável não existe): `noindex`, robots bloqueando tudo e o selo
"Projeto conceito". Para lançar: `SITE_MODE=live` e `NEXT_PUBLIC_SITE_URL` com o domínio final.

## Onde está cada coisa

- `content/` — cardápio (26 itens, transcritos dos destaques do Instagram em 27/10/2026), horários e dados da casa.
- `components/Letras.tsx` — toda frase entra letra a letra com um gesto: `rolar`, `pular`, `carimbar`,
  `datilografar`, `sacudir`, `sair`. Textos longos usam `preguicoso` (dividem só ao chegar na tela e voltam a
  ser texto corrido no fim). `abanar` (hover) e `farejar` (letras fogem do cursor) são interações.
- `components/Interacoes.tsx` — um único runtime: observador de entrada, loops pausados fora da tela,
  cartões empilhados, olhos do cachorro e farejar.
- `components/Selo.tsx` — o selo VIRA LATA que se monta como no destaque da casa.
- `components/cachorro-path.ts` — o cachorro vetorizado dos stories (provisório até os arquivos originais).
- `public/texturas/carimbo.png` — máscara de tinta gasta das palavras gigantes (`npm run textura` regera).
- `/lab` — laboratório para afinar e aprovar cada gesto (fora do menu e do sitemap).
- `docs/referencias/` — prints dos destaques e o vídeo da animação da casa (fora do deploy).

## Conferência

- `scripts/capturas.mjs` — capturas de uma página rolando (desktop ou celular) com o Chrome instalado.
  No Git Bash: `MSYS_NO_PATHCONV=1 node scripts/capturas.mjs http://127.0.0.1:3120 .capturas / cel 8 0.9`.
- `scripts/e2e-parede.mjs` — Parede de ponta a ponta (enviar → moderar → aprovar → grade → ficha → tirar),
  contra o build local de produção: `npm run build && npm start -- --port 3121`, depois
  `node scripts/e2e-parede.mjs http://127.0.0.1:3121`. Usa o armazenamento real e limpa tudo no fim
  (`--so-limpar` apaga sobras). A senha da moderação vem do `.env.local`.
- `docs/prompt-fable-refino-ui.md` — briefing do refinamento de UI/UX.

## Pendências da casa

Arquivos da marca (logo, fontes, ilustrações), carta de bebidas, fotos reais, política pet, reservas,
confirmação do almoço de fim de semana e domínio.
