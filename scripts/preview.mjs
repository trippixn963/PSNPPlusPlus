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
 * Developer: Trippixn
 * Website:   https://trippixn.com
 * Discord:   discord.gg/syria
 */

import { chromium } from 'playwright';
const out = process.argv[2];
if (!out) {
  console.error('usage: node scripts/preview.mjs <out.png>   (with a static server on :8777)');
  process.exit(1);
}

const browser = await chromium.launch();
// Generous viewport, then shoot the CONTENT and let it decide the bounds. A
// fixed one was 380 wide and silently cropped the panel off the right edge —
// every preview taken with it was of a half-panel, which is exactly the kind of
// thing a preview exists to reveal rather than commit.
//
// reducedMotion because the chip's `.psnppp-sheen` is a 0.52s one-shot sweep and
// a screenshot lands mid-flight. Worse here than in the page: preview.html pins
// the chip to `position: static` so several can be laid out, which removes the
// containing block the sheen is absolutely positioned against — it then sizes
// itself to the whole page and washes a grey diagonal across the panel. Rather
// than time the shot, this takes the `prefers-reduced-motion` branch the sheet
// already defines, which sets the sweep to `animation: none`.
const page = await browser.newPage({
  viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 3, reducedMotion: 'reduce'
});
page.on('pageerror', e => console.log('  pageerror:', e.message));
await page.goto('http://127.0.0.1:8777/scripts/preview.html');
await page.waitForFunction(() => window.__ready === true, { timeout: 5000 });
const content = await page.$('.col');
await (content ?? page).screenshot({ path: out });
await browser.close();
console.log('rendered');
