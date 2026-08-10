/**
 * PSNP++ - Icon Generator
 * =======================
 *
 * Renders scripts/icon.html with Playwright and exports every size the project
 * needs. CSS rather than a drawing tool so the source of truth is one
 * stylesheet using theme.mjs's own tokens — the icon cannot drift from the
 * chip's palette without someone editing the colours by hand.
 *
 * Every size is rendered at its own resolution, never downscaled from a big
 * one: a 64px export of a 512px bitmap loses the hairline bevel entirely,
 * whereas re-rendering keeps it a crisp sub-pixel line.
 *
 * Playwright is deliberately NOT a devDependency. It pulls a ~100MB browser,
 * and this runs about once a year — making `npm install` fetch it so the icon
 * can be regenerated occasionally is a bad trade for everyone who only wants to
 * run the tests. Install it when you need it:
 *
 *   npm i -D playwright && npx playwright install chromium
 *   node scripts/make-icon.mjs
 *   npm uninstall playwright
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = pathToFileURL(resolve(root, 'scripts/icon.html')).href;
const outDir = resolve(root, 'assets');

/**
 * `circle` exists for Discord, which crops an avatar to a circle regardless.
 * Letting it crop the squircle leaves four clipped corners and a plate that
 * reads as an accident; rendering the plate round means the bevel follows the
 * edge the viewer actually sees.
 */
const EXPORTS = [
  { name: 'icon-512.png', size: 512, shape: 'squircle' },
  { name: 'icon-256.png', size: 256, shape: 'squircle' },
  { name: 'icon-128.png', size: 128, shape: 'squircle' },
  { name: 'icon-64.png', size: 64, shape: 'squircle' },
  { name: 'icon-discord-512.png', size: 512, shape: 'circle' },
  // Small round exports for the in-page chip, which embeds one as a data URI.
  { name: 'icon-round-40.png', size: 40, shape: 'circle' },
  { name: 'icon-round-48.png', size: 48, shape: 'circle' }
];

const browser = await chromium.launch();
try {
  await mkdir(outDir, { recursive: true });
  for (const { name, size, shape } of EXPORTS) {
    // omitBackground keeps the corners outside the radius transparent rather
    // than white, which is what a rounded icon needs on any surface.
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    await page.goto(source);
    await page.evaluate(([px, kind]) => {
      document.documentElement.style.setProperty('--size', `${px}px`);
      document.body.classList.toggle('circle', kind === 'circle');
    }, [size, shape]);
    await page.screenshot({ path: resolve(outDir, name), omitBackground: true });
    await page.close();
    console.log(`  ${name.padEnd(24)} ${size}x${size} ${shape}`);
  }
} finally {
  await browser.close();
}
console.log(`\nWrote ${EXPORTS.length} files to assets/`);
