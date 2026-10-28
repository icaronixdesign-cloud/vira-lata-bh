// Gera app/fontes/roboto-serif-vira-lata.woff2: a Roboto Serif (OFL) do Google Fonts, subconjunto latino,
// com os eixos cortados para a faixa que o site usa (largura 62–100 %, peso 400–900).
// Fica com metade do tamanho do arquivo do Google (≈ 77 KB contra 147 KB) e renderiza igual.
// Uso: node scripts/fonte-texto.mjs
import { writeFileSync } from 'node:fs';
import subsetFont from 'subset-font';

const CSS = 'https://fonts.googleapis.com/css2?family=Roboto+Serif:wdth,wght@50..150,100..900&display=swap';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const DESTINO = new URL('../app/fontes/roboto-serif-vira-lata.woff2', import.meta.url);

const css = await (await fetch(CSS, { headers: { 'user-agent': UA } })).text();
// O bloco "/* latin */" (não o latin-ext) traz a URL e o unicode-range do subconjunto latino.
const bloco = css.split('/* ').find((b) => b.startsWith('latin */'));
if (!bloco) throw new Error('subconjunto latino não encontrado no CSS do Google Fonts');
const url = bloco.match(/url\((https:[^)]+\.woff2)\)/)[1];
const faixa = bloco.match(/unicode-range:\s*([^;]+);/)[1];

const original = Buffer.from(await (await fetch(url)).arrayBuffer());
const caracteres = faixa
  .split(',')
  .map((s) => s.trim().replace('U+', ''))
  .flatMap((s) => {
    const [a, b = a] = s.split('-').map((h) => parseInt(h, 16));
    return Array.from({ length: b - a + 1 }, (_, k) => String.fromCodePoint(a + k));
  })
  .join('');

const cortada = await subsetFont(original, caracteres, {
  targetFormat: 'woff2',
  variationAxes: { wdth: { min: 62, max: 100, default: 100 }, wght: { min: 400, max: 900, default: 400 } },
});
writeFileSync(DESTINO, cortada);
console.log(`Roboto Serif: ${original.length} → ${cortada.length} bytes`);
