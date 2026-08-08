/**
 * PSNP++ - Build
 * ==============
 *
 * Bundles `userscript/src/` into the one script you install, at
 * `dist/psnppp.user.js`. Nothing else goes in it.
 *
 * PSNP++ is a COMPANION to PSNP+, not a copy of it. It briefly shipped a
 * vendored PSNP+ and patched it at build time, which bought two things — the
 * removal of the "remove <game>?" dialog, and free rein over PSNP+'s own chrome
 * — at a price that turned out to be too high: PSNP+ stopped auto-updating, so
 * every release by HusKyCode had to be pulled in and re-patched by hand.
 *
 * PSNP+ is installed separately again and updates itself. This script only ever
 * touches it the way any other userscript could: through `localStorage`, and
 * through the page's own `window`.
 *
 * THE ONE THING THAT DEPENDS ON REACHING IT is auto-confirm.mjs, which replaces
 * `window.confirm` so the remove dialog answers itself. That works because
 * PSNP+ declares `@inject-into page` and calls a bare `confirm(...)` at click
 * time rather than capturing it at load — so it resolves against the PAGE's
 * global, which this script also has via `unsafeWindow`. Our banner keeps
 * `@sandbox raw` / `@inject-into page` for exactly that reason; changing either
 * would put us in a different realm and silently break it.
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */

import { build } from 'esbuild';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const version = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).version;

// The version lives in package.json and nowhere else. Tampermonkey only updates
// on an increase, so a hardcoded @version silently pins every install to an old
// build — which is why `npm run release` owns the bump.
const banner = readFileSync(resolve(root, 'userscript/banner.txt'), 'utf8')
  .replace('{{VERSION}}', version);


const innerPath = resolve(root, 'dist/.psnppp-inner.js');
await build({
  entryPoints: [resolve(root, 'userscript/src/main.mjs')],
  outfile: innerPath,
  bundle: true,
  format: 'iife',
  target: 'es2022',
  legalComments: 'none'
  // NO `define`. main.mjs guards its auto-start with `typeof document !==
  // "undefined"` so it can be imported in Node; defining `document` here folds
  // that to a constant and the script silently never starts in the browser.
});
const psnppp = readFileSync(innerPath, 'utf8');
rmSync(innerPath, { force: true });

const combined = banner + psnppp;

writeFileSync(resolve(root, 'dist/psnppp.user.js'), combined);
writeFileSync(resolve(root, 'dist/psnppp.meta.js'), banner);

console.log(`Built dist/psnppp.user.js and dist/psnppp.meta.js (v${version})`);
console.log(`  size: ${(combined.length / 1024).toFixed(0)}KB`);
