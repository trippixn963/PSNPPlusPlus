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
 * Nothing left in this build reaches into PSNP+'s own realm. There was one
 * attempt — an override of `window.confirm` that answered the "remove <game>?"
 * dialog — and it could not work: PSNP+ runs in Tampermonkey's own
 * `userscript.html` realm, not the page's, so a `confirm` we replace anywhere
 * is never the one it calls. It has been removed rather than left in place
 * pretending. The banner still declares `@sandbox raw` / `@inject-into page`,
 * which is now only about running at `document-start`. Nothing left in the
 * script needs to reach PSNP+'s CODE — but the realm still matters to
 * watchLists: our `Storage.prototype.setItem` patch only sees writes made in
 * OUR realm, so PSNP+'s own writes are caught by the 2s poll, not the patch.
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
