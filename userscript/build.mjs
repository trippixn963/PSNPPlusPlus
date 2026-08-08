/**
 * PSNP++ - Build
 * ==============
 *
 * Produces the one script you install: a patched PSNP+ and PSNP++ together, at
 * `dist/psnppp.user.js`.
 *
 * PSNP++ used to be a companion that ran ALONGSIDE a stock PSNP+ and touched it
 * only through localStorage. It now ships PSNP+ itself, because PSNP+ runs in
 * its own userscript realm — an override installed correctly on the page's
 * window was simply never consulted by it, and no amount of care from outside
 * could reach the code that needed changing.
 *
 * The cost of that decision, stated plainly: PSNP+ no longer auto-updates. The
 * pinned copy in `vendor/` is what runs. Taking a new release means dropping the
 * new bundle in and rebuilding — at which point every patch either still fits or
 * fails the build by name. See `patches/apply.mjs`.
 *
 * ORDER MATTERS: PSNP+ first, exactly as when installed alone. It has a
 * document-start pass the rest of it depends on, and nothing should run before
 * a startup sequence that already works.
 *
 * ONE SANDBOX FOR BOTH. PSNP+ requires `@sandbox raw` / `@inject-into page`, so
 * PSNP++ now runs in the page too. That is a real change from how it always ran,
 * and it is also the point — sharing a realm is what makes the patched code
 * reachable at all. PSNP+ already proves `GM.*` works under raw.
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */

import { build } from 'esbuild';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyPatches } from '../patches/apply.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const version = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).version;

// The version lives in package.json and nowhere else. Tampermonkey only updates
// on an increase, so a hardcoded @version silently pins every install to an old
// build — which is why `npm run release` owns the bump.
const banner = readFileSync(resolve(root, 'userscript/banner.txt'), 'utf8')
  .replace('{{VERSION}}', version);

const loadPatches = async () => {
  const dir = resolve(root, 'patches');
  const files = (await readdir(dir))
    .filter(name => name.endsWith('.mjs') && name !== 'apply.mjs')
    .sort();
  const patches = [];
  for (const file of files) patches.push((await import(resolve(dir, file))).default);
  return patches;
};

const patches = await loadPatches();
const vendor = readFileSync(resolve(root, 'vendor/psnp-plus.user.js'), 'utf8');

// Throws by design if any patch no longer fits. A build that cannot apply every
// patch must produce nothing rather than something that mostly works.
const { source: patchedVendor, applied } = applyPatches(vendor, patches);

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

const divider = label => `\n\n/* ${'='.repeat(68)}\n   ${label}\n   ${'='.repeat(68)} */\n\n`;

const combined = [
  banner,
  divider(`PSNP+ v11.14 by HusKyCode — vendored verbatim, with ${applied.length} local patch(es): ${applied.join(', ')}`),
  // Its metadata block is stripped: a second ==UserScript== header inside the
  // file would be dead text at best and confuse a parser at worst.
  patchedVendor.replace(/^\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==\n/, ''),
  divider('PSNP++ by Trippixn'),
  psnppp
].join('');

writeFileSync(resolve(root, 'dist/psnppp.user.js'), combined);
writeFileSync(resolve(root, 'dist/psnppp.meta.js'), banner);

console.log(`Built dist/psnppp.user.js and dist/psnppp.meta.js (v${version})`);
console.log(`  patches applied: ${applied.join(', ') || '(none)'}`);
console.log(`  size: ${(combined.length / 1024).toFixed(0)}KB`);
