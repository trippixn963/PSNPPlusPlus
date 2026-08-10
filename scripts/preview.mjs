/**
 * PSNP++ - Design Preview
 * =======================
 *
 * Screenshots the REAL chip and panel — the actual modules, in a real browser,
 * with the real theme CSS — so a visual change can be looked at before it ships
 * rather than described.
 *
 * Served over HTTP, never opened as a file: a page loaded from file:// cannot
 * import ES modules, so the panel would never build and the shot would be of an
 * empty box.
 *
 * Playwright is deliberately not a devDependency (see make-icon.mjs):
 *
 *   npm i -D playwright && npx playwright install chromium
 *   python3 -m http.server 8777 --bind 127.0.0.1 &
 *   node scripts/preview.mjs out.png
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */

import { chromium } from 'playwright';
const out = process.argv[2];
if (!out) {
  console.error('usage: node scripts/preview.mjs <out.png>   (with a static server on :8777)');
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 720, height: 640 }, deviceScaleFactor: 3 });
page.on('pageerror', e => console.log('  pageerror:', e.message));
await page.goto('http://127.0.0.1:8777/scripts/preview.html');
await page.waitForFunction(() => window.__ready === true, { timeout: 5000 });
await page.screenshot({ path: out });
await browser.close();
console.log('rendered');
