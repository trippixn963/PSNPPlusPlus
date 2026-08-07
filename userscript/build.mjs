/**
 * PSNP++ - Build
 * ==============
 *
 * Bundles the ESM sources into a single installable userscript.
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const template = readFileSync(resolve(root, 'userscript/banner.txt'), 'utf8');
const { version } = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));

// @version comes from package.json, never from banner.txt. Tampermonkey only
// pulls an update when the served @version is HIGHER than the installed one, so
// a version hardcoded in the banner and forgotten during a release pins every
// installed copy to the old script forever — silently, with a green "up to
// date" in the dashboard and no build or test failure anywhere. Deriving it
// means bumping package.json is the single act that ships an update.
const VERSION_PLACEHOLDER = '{{VERSION}}';
if (!template.includes(VERSION_PLACEHOLDER)) {
  // Hard failure, not a warning. A banner that lost its placeholder still
  // builds a perfectly working script; it just stops being updatable, which is
  // exactly the failure this whole mechanism exists to prevent.
  throw new Error(
    `userscript/banner.txt is missing ${VERSION_PLACEHOLDER} — @version would be ` +
    'frozen and installed copies would never auto-update.'
  );
}
const banner = template.replaceAll(VERSION_PLACEHOLDER, version);

// The metadata block on its own, served at @updateURL. Tampermonkey polls that
// URL on a schedule and reads nothing but @version from it, so pointing it at
// the full ~30 KB bundle would ship the entire script on every poll just to
// compare one number. Written from the SAME resolved string that is prepended
// to the bundle, so the two can never disagree about the version — which would
// otherwise mean an update that offers itself forever or never at all.
mkdirSync(resolve(root, 'dist'), { recursive: true });
writeFileSync(resolve(root, 'dist/psnppp.meta.js'), banner);

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

console.log(`Built dist/psnppp.user.js and dist/psnppp.meta.js (v${version})`);
