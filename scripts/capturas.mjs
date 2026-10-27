// Capturas de uma página rolando, com o Chrome instalado (o painel do app estrangula animações quando escondido).
// Uso (no Git Bash, prefixe com MSYS_NO_PATHCONV=1 para o "/" não virar caminho do Windows):
//   node scripts/capturas.mjs <base> <pasta> <caminho> [desk|cel] [passos] [fração da tela por passo]
//   ex.: MSYS_NO_PATHCONV=1 node scripts/capturas.mjs http://127.0.0.1:3120 .capturas / cel 8 0.9
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';

const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const [, , base = 'http://127.0.0.1:3120', pasta = '.capturas', caminho = '/', modo = 'desk', passos = '8', fracao = '0.95'] = process.argv;

mkdirSync(pasta, { recursive: true });
const celular = modo === 'cel';
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const contexto = await browser.newContext(
  celular
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
    : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
);
const page = await contexto.newPage();
const erros = [];
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning') erros.push(`${m.type()}: ${m.text().slice(0, 300)}`);
});
page.on('pageerror', (e) => erros.push(`pageerror: ${e.message}`));

await page.goto(base + caminho, { waitUntil: 'networkidle' });
await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
await page.waitForTimeout(3600);
const nome = caminho.replace(/\W+/g, '') || 'home';
await page.screenshot({ path: `${pasta}/${nome}-${modo}-0.png` });
const alto = await page.evaluate(() => innerHeight);
for (let i = 1; i <= Number(passos); i++) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(i * alto * Number(fracao)));
  await page.waitForTimeout(1700);
  await page.screenshot({ path: `${pasta}/${nome}-${modo}-${i}.png` });
}
const info = await page.evaluate(() => ({
  altura: document.documentElement.scrollHeight,
  largura: document.documentElement.scrollWidth,
  letras: document.querySelectorAll('.l').length,
  semEntrar: document.querySelectorAll('[data-gesto]:not([data-in])').length,
}));
console.log(JSON.stringify({ caminho, modo, ...info, erros }));
await browser.close();
