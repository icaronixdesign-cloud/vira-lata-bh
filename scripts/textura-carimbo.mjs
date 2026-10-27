// Gera a máscara de "carimbo gasto" das palavras gigantes (LATAS, PETISCOS, DOCES).
// Branco opaco com falhas: manchas de ruído e riscos horizontais de tinta seca.
// A imagem repete sem emenda, então pode ser usada como mask-image em qualquer tamanho.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const N = 512;

function grade(semente, px, py) {
  const g = new Float32Array(px * py);
  let s = semente >>> 0;
  for (let i = 0; i < g.length; i++) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    g[i] = s / 4294967296;
  }
  return { g, px, py };
}

// Ruído de valor periódico: a grade dá a volta em x e y.
function ruido({ g, px, py }, x, y) {
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const fx = x - x0, fy = y - y0;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const at = (i, j) => g[(((j % py) + py) % py) * px + (((i % px) + px) % px)];
  const a = at(x0, y0), b = at(x0 + 1, y0), c = at(x0, y0 + 1), d = at(x0 + 1, y0 + 1);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

const oitavas = [
  { grade: grade(11, 8, 8), peso: 0.12 },
  { grade: grade(23, 32, 32), peso: 0.28 },
  { grade: grade(37, 72, 72), peso: 0.34 },
  { grade: grade(53, 144, 144), peso: 0.26 },
];
const riscos = grade(91, 4, 190); // esticado na horizontal: vira risco de pincel seco

const buf = Buffer.alloc(N * N * 4);
for (let y = 0; y < N; y++) {
  for (let x = 0; x < N; x++) {
    let v = 0;
    for (const o of oitavas) v += o.peso * ruido(o.grade, (x * o.grade.px) / N, (y * o.grade.py) / N);
    const r = ruido(riscos, (x * riscos.px) / N, (y * riscos.py) / N);
    let alfa = 255;
    if (v > 0.645) alfa = 0;
    else if (v > 0.62) alfa = 120;
    if (r > 0.87) alfa = Math.min(alfa, 20);
    else if (r > 0.84) alfa = Math.min(alfa, 140);
    const h = (Math.imul(x, 73856093) ^ Math.imul(y, 19349663)) >>> 0;
    if (h % 1000 < 20) alfa = 0; // grãos soltos
    const i = (y * N + x) * 4;
    buf[i] = 255;
    buf[i + 1] = 255;
    buf[i + 2] = 255;
    buf[i + 3] = alfa;
  }
}

mkdirSync('public/texturas', { recursive: true });
await sharp(buf, { raw: { width: N, height: N, channels: 4 } })
  .png({ compressionLevel: 9, palette: true, colours: 8 })
  .toFile('public/texturas/carimbo.png');
console.log('public/texturas/carimbo.png');
