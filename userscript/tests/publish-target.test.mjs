import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Pins WHERE a release publishes to, and keeps the four files that must agree
 * about it from drifting apart.
 *
 * On 2026-08-09 the artifacts were served out of the portfolio's document root,
 * and a full-sync deploy of the portfolio deleted them as extraneous. The
 * failure is silent — Tampermonkey reads the resulting 404 as "no update
 * available", so a release can print all green and reach nobody. See
 * "The publish guard" in sidecar/deploy/DEPLOY.md.
 */

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const read = rel => readFileSync(resolve(root, rel), 'utf8');

const releaseScript = read('scripts/release.sh');
const guardScript = read('sidecar/deploy/psnppp-guard.sh');
const nginxConf = read('sidecar/deploy/nginx-psnppp.conf');

const shellVar = (script, name) =>
  script.match(new RegExp(`^${name}="?\\$\\{[A-Z_]+:-([^}"]+)\\}"?`, 'm'))?.[1]
  ?? script.match(new RegExp(`^${name}="?([^"\\s#]+)"?`, 'm'))?.[1];

const WEBROOT = shellVar(releaseScript, 'WEBROOT');
const PRISTINE = shellVar(releaseScript, 'PRISTINE');

test('the release publishes outside any document root shared with another project', () => {
  assert.ok(WEBROOT, 'release.sh no longer defines WEBROOT');
  assert.ok(WEBROOT.startsWith('/var/www/'), `WEBROOT is ${WEBROOT}, not under /var/www/`);
  assert.equal(
    /^\/var\/www\/[^/]+\.[^/]+\/?$/.test(WEBROOT),
    false,
    `WEBROOT is ${WEBROOT}, which looks like a site's own document root — give the artifacts a directory nothing else deploys over`
  );
});

test('release.sh, the guard, and the nginx snippet agree on the web root', () => {
  // Drift here is silent in the worst way: the release publishes to one path
  // while nginx serves another, and every check that reads the live URL still
  // passes because the OLD files are still sitting where nginx is looking.
  assert.equal(shellVar(guardScript, 'WEBROOT'), WEBROOT);

  const roots = [...nginxConf.matchAll(/^\s*root\s+([^;]+);/gm)].map(m => m[1].trim());
  assert.equal(roots.length, 2, `expected two root directives in nginx-psnppp.conf, found ${roots.length}`);
  for (const r of roots) assert.equal(r, WEBROOT);
});

test('release.sh and the guard agree on the pristine copy', () => {
  // The guard restores the web root FROM this path. If release.sh refreshes a
  // different one, the guard faithfully "heals" the site back to an older
  // release and logs it as a success.
  assert.ok(PRISTINE, 'release.sh no longer defines PRISTINE');
  assert.equal(shellVar(guardScript, 'PRISTINE'), PRISTINE);
});

test('the pristine copy is not inside the web root', () => {
  // It is the recovery source. Anything that wipes the web root would take the
  // only good copy with it.
  assert.equal(PRISTINE.startsWith(`${WEBROOT}/`), false);
});

test('the publish step creates its target directories first', () => {
  // scp into a path that does not exist writes a regular FILE at that path
  // instead of failing, which would 404 every request while the release still
  // printed success.
  assert.match(releaseScript, /mkdir -p ['"]?\$PRISTINE/);
});

test('the release verifies the live URLs the build advertises', () => {
  // The public URLs are compiled into every installed copy, so they can never
  // change. If a future edit moves the files and "fixes" these to match, every
  // install already out there goes dark.
  const meta = read('dist/psnppp.meta.js');
  const advertised = [...meta.matchAll(/@(?:download|update)URL\s+(\S+)/g)].map(m => m[1]);
  assert.equal(advertised.length, 2, 'dist metadata no longer advertises both URLs');
  for (const url of advertised) {
    const path = new URL(url).pathname;
    assert.ok(
      releaseScript.includes(path),
      `release.sh never verifies ${path} — the release could publish nothing and still pass`
    );
  }
});

test('the guard compares bodies, never status codes', () => {
  // The site has an SPA catch-all that answers 200 with HTML for any unmatched
  // path, so a status-code check cannot tell "published" from "deleted". This
  // is the check that would catch someone simplifying it back to one.
  assert.match(guardScript, /==UserScript==/);
  assert.equal(/%\{http_code\}/.test(guardScript), false, 'the guard is checking status codes again');
});
