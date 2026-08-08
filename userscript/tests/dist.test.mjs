import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Pins the committed build artifacts, because dist/ is what actually runs.
 *
 * The source is covered everywhere else; none of that helps if the metadata
 * block is wrong. A stale @version means Tampermonkey never offers the update
 * and every installed copy stays on the old script — silently, showing "up to
 * date". A missing @connect or @grant means the script installs and then fails
 * on its first request. Both are invisible to every other test in this suite,
 * and both are only observable in the built file.
 */

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const read = rel => readFileSync(resolve(root, rel), 'utf8');

const pkg = JSON.parse(read('package.json'));
const bundle = read('dist/psnppp.user.js');
const meta = read('dist/psnppp.meta.js');
const bannerTemplate = read('userscript/banner.txt');

const META_START = '// ==UserScript==';
const META_END = '// ==/UserScript==';

test('banner.txt still derives @version rather than hardcoding one', () => {
  // This is the mechanism, not a style preference: a literal version in
  // banner.txt builds a working script that can never update itself.
  assert.match(bannerTemplate, /@version\s+\{\{VERSION\}\}/);
});

test('both artifacts carry package.json\'s version, and no placeholder leaked', () => {
  for (const [name, text] of [['bundle', bundle], ['meta', meta]]) {
    assert.match(text, new RegExp(`@version\\s+${pkg.version.replace(/\./g, '\\.')}\\b`), name);
    assert.equal(text.includes('{{VERSION}}'), false, `${name} still has the placeholder`);
  }
});

test('the meta file is the metadata block and nothing else', () => {
  // Serving the whole ~28 KB bundle at @updateURL would ship the entire script
  // on every poll just to read one number.
  assert.ok(meta.startsWith(META_START));
  assert.equal(meta.trimEnd().endsWith(META_END), true);
  assert.ok(meta.length < 1024, `meta.js is ${meta.length} bytes — it should be the header alone`);
  assert.equal(meta.includes('esbuild'), false);
  assert.equal(meta.includes('function'), false);
});

test('the bundle\'s metadata block is byte-identical to the meta file', () => {
  // Tampermonkey compares the @version it polled from @updateURL against the
  // one in the file it then downloads. If those two ever disagree, the update
  // either offers itself forever or never at all.
  const end = bundle.indexOf(META_END) + META_END.length;
  assert.ok(end > META_END.length, 'bundle has no metadata block');
  assert.equal(bundle.slice(0, end), meta.slice(0, meta.indexOf(META_END) + META_END.length));
});

test('the update and download URLs are present and point at the new slug', () => {
  for (const text of [bundle, meta]) {
    assert.match(text, /@downloadURL\s+https:\/\/trippixn\.com\/psnppp\.user\.js/);
    assert.match(text, /@updateURL\s+https:\/\/trippixn\.com\/psnppp\.meta\.js/);
  }
});

test('every runtime-critical directive survives the build', () => {
  // Each of these is load-bearing at runtime and none of them is exercised by
  // any other test: without @connect the cross-origin request is blocked,
  // without a @grant the GM.* call is undefined, without document-start the
  // setItem patch installs after PSNP+ has already written.
  const required = [
    /@run-at\s+document-start/,
    /@noframes/,
    /@connect\s+trippixn\.com/,
    /@grant\s+GM_xmlhttpRequest/,
    /@grant\s+GM\.getValue/,
    /@grant\s+GM\.setValue/,
    /@grant\s+GM\.deleteValue/,
    // Tampermonkey hands unsafeWindow out without a grant, but Violentmonkey
    // and Greasemonkey require one — and without it `typeof unsafeWindow` is
    // 'undefined', main.mjs's confirmTarget silently falls back to the sandbox
    // window, and the remove-prompt override is installed where PSNP+ (which
    // runs @inject-into page) will never see it.
    /@grant\s+unsafeWindow/,
    /@match\s+https:\/\/psnprofiles\.com\/\*/,
    /@name\s+PSNP\+\+/,
    /@namespace\s+psnppp\.trippixn/
  ];
  for (const pattern of required) {
    assert.match(meta, pattern);
    assert.match(bundle, pattern);
  }
});

test('the auto-start guard is emitted verbatim, not folded to a constant', () => {
  // An esbuild `define` for `document` would constant-fold this away and the
  // script would silently never start, with no build or test failure. This is
  // the check that would catch it.
  assert.match(bundle, /typeof document !== "undefined"/);
});

test('the built bundle uses only the new storage names', () => {
  // The two old-name constants below are the migration's own inputs and must
  // be present; anything else on the old prefix would be a missed rename.
  const oldNames = bundle.match(/psnpsync[\w.]*|psnp-sync[\w.-]*/g) ?? [];
  assert.deepEqual([...new Set(oldNames)].sort(), ['psnp-sync', 'psnpsync.']);
});
