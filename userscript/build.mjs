/** Bundles the ESM sources into a single installable userscript. */
import { build } from 'esbuild';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const banner = readFileSync(resolve(root, 'userscript/banner.txt'), 'utf8');

// WARNING: do NOT add a `define` option here (e.g. `define: { document: ... }`).
// main.mjs guards its auto-start with `typeof document !== 'undefined'` so the
// module can be imported under Node's test runner without a `document` global.
// esbuild emits that guard verbatim into the bundle, and it evaluates true in
// the browser at `@run-at document-start` — but a `define` for `document`
// would let esbuild fold the check to a constant and could silently disable
// the entire script in production, with no build or test failure to catch it.
await build({
  entryPoints: [resolve(root, 'userscript/src/main.mjs')],
  outfile: resolve(root, 'dist/psnppp.user.js'),
  bundle: true,
  format: 'iife',
  target: 'es2022',
  banner: { js: banner },
  legalComments: 'none'
});

console.log('Built dist/psnppp.user.js');
