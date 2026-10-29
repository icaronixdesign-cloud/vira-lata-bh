// Leva o azul forte antigo (#00A4FE) das texturas da lata 3D para o azul da casa atual (#6CC2EE):
// só os pixels azuis e saturados mudam (cinta, faixas), com a luz e a sombra do render preservadas.
// Uso: node scripts/azul-texturas.mjs  (reescreve os WebP em public/lata-3d)
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const PASTA = new URL('../public/lata-3d/', import.meta.url);
const arquivos = [
  ...readdirSync(new URL('rotulos/', PASTA)).map((f) => 'rotulos/' + f),
  ...readdirSync(PASTA).filter((f) => f.endsWith('.webp')),
];

const H0 = 201; // matiz do azul antigo
const S_FATOR = 0.79; // saturação 100 % → 79 %
const L_FATOR = 0.64; // clareia: luminosidade 50 % → 68 %

const hsl = (r, g, b) => {
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
};
const rgb = (h, s, l) => {
  const f = (n) => {
    const k = (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [f(0), f(8), f(4)];
};
const clamp = (x) => Math.min(1, Math.max(0, x));

for (const nome of arquivos) {
  const url = new URL(nome, PASTA);
  const { data, info } = await sharp(readFileSync(url)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let mudou = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
    const [h, s, l] = hsl(r, g, b);
    const w = clamp((s - 0.35) / 0.25) * clamp(1 - Math.abs(h - H0) / 22) * clamp((l - 0.08) / 0.12);
    if (w <= 0) continue;
    const [nr, ng, nb] = rgb(h, s * S_FATOR, 1 - (1 - l) * L_FATOR);
    data[i] = Math.round((r + (nr - r) * w) * 255);
    data[i + 1] = Math.round((g + (ng - g) * w) * 255);
    data[i + 2] = Math.round((b + (nb - b) * w) * 255);
    mudou++;
  }
  if (!mudou) continue;
  const buf = await sharp(data, { raw: info }).webp({ quality: 88, alphaQuality: 90 }).toBuffer();
  writeFileSync(url, buf);
  console.log(`${nome}: ${mudou} px recoloridos (${Math.round(buf.length / 1024)} KB)`);
}
