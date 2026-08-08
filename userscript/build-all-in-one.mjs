/**
 * PSNP++ - All-in-one build
 * =========================
 *
 * Produces a single userscript containing a patched PSNP+ and PSNP++ together.
 *
 * Deliberately a SECOND artifact rather than a replacement. `dist/psnppp.user.js`
 * keeps working exactly as it does today against a stock PSNP+, so switching to
 * this one is reversible in about ten seconds: disable this, re-enable the real
 * PSNP+ and the normal PSNP++, and you are back where you started with no data
 * migration — both builds read and write the same `psnpp-*` keys.
 *
 * Why the two can be concatenated at all: PSNP+ is a self-contained webpack
 * IIFE that exports nothing, and PSNP++ is an esbuild IIFE that exports nothing.
 * Neither leaks a name into the shared scope, so the only thing they share is
 * the page, which they already shared as two separate userscripts.
 *
 * ORDER MATTERS: PSNP+ runs first, exactly as it does when it is installed on
 * its own. It has a document-start pass that other parts of it depend on, and
 * putting anything before it changes a startup sequence that currently works.
 *
 * ONE SANDBOX FOR BOTH. PSNP+ requires `@sandbox raw` / `@inject-into page`, so
 * the merged script runs in the page. That is a real change for PSNP++, which
 * has always run sandboxed — and it is also the point: the two halves finally
 * share a realm, which is why the remove-confirmation is reachable here at all
 * and was not from outside. PSNP+ already proves `GM.*` works under raw.
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */

import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyPatches } from '../patches/apply.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const version = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).version;

/**
 * `@connect` for every host either half reaches with GM_xmlhttpRequest.
 *
 * PSNP+ ships no `@connect` at all, which makes Tampermonkey prompt per host
 * the first time. Naming them here means the merged script does not start its
 * life by asking the user to approve things they already approved once.
 */
const CONNECT = ['trippixn.com', 'psnp-plus.huskycode.dev', 'platprices.com'];

const banner = `// ==UserScript==
// @name         PSNP++ (all-in-one)
// @namespace    psnppp.allinone.trippixn
// @version      ${version}
// @description  PSNP+ with local patches, plus PSNP++ cross-device sync, in one script
// @author       Trippixn
// @match        https://psnprofiles.com/*
// @run-at       document-start
// @inject-into  page
// @sandbox      raw
// @noframes
// @grant        GM_xmlhttpRequest
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.deleteValue
// @grant        unsafeWindow
${CONNECT.map(host => `// @connect      ${host}`).join('\n')}
// @downloadURL  https://trippixn.com/psnppp-all-in-one.user.js
// @updateURL    https://trippixn.com/psnppp-all-in-one.meta.js
// ==/UserScript==
`;

const loadPatches = async () => {
  const dir = resolve(root, 'patches');
  const files = (await readdir(dir))
    .filter(name => name.endsWith('.mjs') && name !== 'apply.mjs')
    .sort();
  const patches = [];
  for (const file of files) {
    patches.push((await import(resolve(dir, file))).default);
  }
  return patches;
};

const patches = await loadPatches();
const vendor = readFileSync(resolve(root, 'vendor/psnp-plus.user.js'), 'utf8');

// Throws by design if any patch no longer fits — see patches/apply.mjs. A build
// that cannot apply every patch must produce nothing rather than something
// that mostly works.
const { source: patchedVendor, applied } = applyPatches(vendor, patches);

// esbuild writes PSNP++ to a temporary path so the normal single-purpose build
// output is never touched by this one.
const psnpppPath = resolve(root, 'dist/.psnppp-inner.js');
await build({
  entryPoints: [resolve(root, 'userscript/src/main.mjs')],
  outfile: psnpppPath,
  bundle: true,
  format: 'iife',
  target: 'es2022',
  legalComments: 'none'
  // NO `define` — main.mjs guards its auto-start with `typeof document !==
  // "undefined"` so it can be imported in Node, and esbuild folds that to a
  // constant if `document` is defined here. The script would silently never
  // start. Same warning as the single-purpose build; same reason.
});
const psnppp = readFileSync(psnpppPath, 'utf8');

const divider = label => `\n\n/* ${'='.repeat(68)}\n   ${label}\n   ${'='.repeat(68)} */\n\n`;

const combined = [
  banner,
  divider(`PSNP+ v11.14 by HusKyCode — vendored verbatim, with ${applied.length} local patch(es): ${applied.join(', ')}`),
  patchedVendor.replace(/^\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==\n/, ''),
  divider('PSNP++ by Trippixn'),
  psnppp
].join('');

writeFileSync(resolve(root, 'dist/psnppp-all-in-one.user.js'), combined);
writeFileSync(resolve(root, 'dist/psnppp-all-in-one.meta.js'), banner);

console.log(`Built dist/psnppp-all-in-one.user.js (v${version})`);
console.log(`  patches applied: ${applied.join(', ') || '(none)'}`);
console.log(`  size: ${(combined.length / 1024).toFixed(0)}KB`);
