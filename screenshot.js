const chromium = require('chromium-cli');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8085/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'app-screenshot.png', fullPage: true });
  console.log('Screenshot salvo: app-screenshot.png');
  await browser.close();
})().catch(e => {
  console.error('Erro ao tirar screenshot:', e.message);
  process.exit(1);
});
