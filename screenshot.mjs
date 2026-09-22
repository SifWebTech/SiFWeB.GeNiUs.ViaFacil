import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1024, height: 1366 } });

try {
  await page.goto('http://localhost:8085/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'app-screenshot.png' });
  console.log('✅ Screenshot capturado: app-screenshot.png');
} catch (error) {
  console.error('❌ Erro:', error.message);
} finally {
  await browser.close();
}
