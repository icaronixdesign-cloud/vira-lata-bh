// Parede de ponta a ponta: enviar foto → aparece na fila → aprovar → aparece na grade → ficha → tirar.
// Usa o armazenamento de verdade (Vercel Blob) e apaga o teste no fim, dê certo ou não.
// Rode contra o build de produção local (como na Vercel):
//   npm run build && npm start -- --port 3121
//   node scripts/e2e-parede.mjs http://127.0.0.1:3121
// Só limpar envios de teste que tenham sobrado: node scripts/e2e-parede.mjs <base> --so-limpar
// A senha da moderação vem do .env.local (MODERACAO_SENHA); nunca é impressa.
import { mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const base = process.argv[2] ?? 'http://127.0.0.1:3120';
const soLimpar = process.argv.includes('--so-limpar');
const pasta = '.capturas/e2e';
const foto = fileURLToPath(new URL('./fixtures/foto-teste.jpg', import.meta.url));
const senha = (readFileSync('.env.local', 'utf8').match(/^MODERACAO_SENHA=(.*)$/m) || [])[1]?.trim().replace(/^"|"$/g, '');
if (!senha) throw new Error('MODERACAO_SENHA ausente no .env.local');

mkdirSync(pasta, { recursive: true });
const nome = 'Teste Claude';
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
const erros = [];
page.on('console', (m) => {
  if (m.type() === 'error') erros.push(m.text().slice(0, 200));
});
const passos = {};
const texto = () => page.evaluate(() => document.body.innerText);

/** Entra na moderação (se precisar) e tira todos os envios de teste, um por um. */
async function limpa() {
  let removidos = 0;
  for (let volta = 0; volta < 6; volta++) {
    await page.goto(`${base}/parede/moderar`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('input[name=senha], .mod-topo', { timeout: 20000 });
    if ((await page.locator('input[name=senha]').count()) > 0) {
      await page.fill('input[name=senha]', senha);
      await page.getByRole('button', { name: 'Entrar' }).click();
      await page.waitForSelector('.mod-topo', { timeout: 20000 });
    }
    const cartoes = page.locator('.mod-cartao', { hasText: /teste claude/i });
    const antes = await cartoes.count();
    if (!antes) break;
    await cartoes.first().getByRole('button', { name: /tirar da parede|recusar/i }).click();
    await page.waitForFunction(
      (n) => document.querySelectorAll('.mod-cartao').length < n || !/teste claude/i.test(document.body.innerText),
      await page.locator('.mod-cartao').count(),
      { timeout: 30000 },
    );
    removidos++;
  }
  return removidos;
}

try {
  if (soLimpar) throw new Error('só limpar');
  await page.goto(`${base}/parede#enviar`, { waitUntil: 'domcontentloaded' });
  await page.setInputFiles('.envio input[type=file]', foto);
  await page.waitForSelector('.envio-previa img', { timeout: 20000 });
  await page.getByLabel('Nome do cachorro').fill(nome);
  await page.getByLabel('Uma frase sobre ele').fill('Foto de teste, pode apagar.');
  await page.getByLabel(/Autorizo/).check();
  await page.screenshot({ path: `${pasta}/1-formulario.png` });
  await page.getByRole('button', { name: /Mandar pra parede/ }).click();
  await page.waitForSelector('.envio-ok', { timeout: 45000 });
  passos.enviou = true;

  await page.goto(`${base}/parede/moderar`, { waitUntil: 'domcontentloaded' });
  await page.fill('input[name=senha]', senha);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.waitForSelector('.mod-topo', { timeout: 20000 });
  passos.pendente = /esperando \(1\)/i.test(await texto());
  await page.locator('.mod-cartao', { hasText: /teste claude/i }).first().getByRole('button', { name: /aprovar/i }).click();
  await page.waitForFunction(() => /na parede \(1\)/i.test(document.body.innerText) && /esperando \(0\)/i.test(document.body.innerText), null, {
    timeout: 30000,
  });
  passos.aprovou = true;

  await page.goto(`${base}/parede`, { waitUntil: 'domcontentloaded' });
  const quadro = page.locator('.parede-grade .quadro', { hasText: /teste claude/i });
  await quadro.first().waitFor({ timeout: 20000 });
  passos.naGrade = true;
  await quadro.first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${pasta}/2-parede.png` });
  await quadro.first().click();
  await page.waitForSelector('dialog.ficha[open]', { timeout: 5000 });
  passos.ficha = true;
} catch (e) {
  if (!soLimpar) passos.erro = String(e).slice(0, 200);
} finally {
  try {
    passos.removidos = await limpa();
  } catch (e) {
    passos.erroLimpeza = String(e).slice(0, 200);
  }
  console.log(JSON.stringify({ passos, erros }));
  await browser.close();
}
