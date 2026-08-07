import test from 'node:test';
import assert from 'node:assert/strict';
import { parseVersion, isNewer, checkForUpdate } from '../src/update-check.mjs';

const META_URL = 'https://trippixn.com/psnppp.meta.js';

/** Records calls and replies with the queued responses, matching sync-client.test.mjs's fake. */
const fakeRequest = responses => {
  const calls = [];
  const fn = async options => { calls.push(options); return responses.shift(); };
  fn.calls = calls;
  return fn;
};

/** An in-memory GM-storage stand-in for loadState/saveState. */
const fakeGmState = (initial = null) => {
  let value = initial;
  return {
    loadState: async () => value,
    saveState: async next => { value = next; },
    get: () => value
  };
};

const metaBody = version => `// ==UserScript==\n// @name PSNP++\n// @version ${version}\n// ==/UserScript==\n`;

// --- parseVersion ------------------------------------------------------------

test('parseVersion extracts @version from a metadata block', () => {
  assert.equal(parseVersion(metaBody('1.3.0')), '1.3.0');
});

test('parseVersion returns null when @version is absent', () => {
  assert.equal(parseVersion('// ==UserScript==\n// @name PSNP++\n// ==/UserScript==\n'), null);
});

test('parseVersion returns null on an HTML body (SPA fallback)', () => {
  assert.equal(parseVersion('<!DOCTYPE html><html><head><title>trippixn.com</title></head></html>'), null);
});

test('parseVersion returns null on a malformed version value', () => {
  for (const bad of ['not-a-version', '1.2.3-beta', 'v1.2.0', '']) {
    assert.equal(parseVersion(metaBody(bad)), null, bad);
  }
});

test('parseVersion returns null on a non-string input rather than throwing', () => {
  for (const value of [null, undefined, 42, {}, []]) {
    assert.doesNotThrow(() => parseVersion(value));
    assert.equal(parseVersion(value), null);
  }
});

// --- isNewer -------------------------------------------------------------
//
// A naive string compare gets double-digit segments backwards: "1.10.0" <
// "1.2.0" lexicographically, even though 1.10.0 is the newer release.

test('a higher minor version with two digits beats a naive string compare', () => {
  assert.equal(isNewer('1.10.0', '1.2.0'), true);
  assert.equal(isNewer('1.2.0', '1.10.0'), false);
});

test('equal versions are not newer in either direction', () => {
  assert.equal(isNewer('1.2.0', '1.2.0'), false);
});

test('differing segment counts are padded, not misread', () => {
  assert.equal(isNewer('1.2', '1.2.0'), false);
  assert.equal(isNewer('1.2.0', '1.2'), false);
  assert.equal(isNewer('1.2.1', '1.2'), true);
  assert.equal(isNewer('1.3', '1.2.9'), true);
});

test('a higher major or patch segment is detected correctly', () => {
  assert.equal(isNewer('2.0.0', '1.9.9'), true);
  assert.equal(isNewer('1.2.4', '1.2.3'), true);
  assert.equal(isNewer('1.2.3', '1.2.4'), false);
});

test('non-numeric junk in a segment does not throw and resolves deterministically', () => {
  assert.doesNotThrow(() => isNewer('1.x.0', '1.2.0'));
  assert.doesNotThrow(() => isNewer('abc', '1.2.0'));
  assert.doesNotThrow(() => isNewer('1.2.0', null));
  assert.doesNotThrow(() => isNewer(undefined, undefined));
});

// --- checkForUpdate --------------------------------------------------------

test('a newer version on the server is reported available', async () => {
  const request = fakeRequest([{ status: 200, responseText: metaBody('1.10.0') }]);
  const { loadState, saveState } = fakeGmState();
  const result = await checkForUpdate({
    currentVersion: '1.2.0', metaUrl: META_URL, request, now: 1000, loadState, saveState
  });
  assert.deepEqual(result, { available: true, latest: '1.10.0' });
});

test('an equal version is not reported as available', async () => {
  const request = fakeRequest([{ status: 200, responseText: metaBody('1.2.0') }]);
  const { loadState, saveState } = fakeGmState();
  const result = await checkForUpdate({
    currentVersion: '1.2.0', metaUrl: META_URL, request, now: 1000, loadState, saveState
  });
  assert.deepEqual(result, { available: false, latest: '1.2.0' });
});

test('a malformed or absent @version resolves to not-available, never throws', async () => {
  const request = fakeRequest([{ status: 200, responseText: '// ==UserScript==\n// ==/UserScript==\n' }]);
  const { loadState, saveState } = fakeGmState();
  const result = await checkForUpdate({
    currentVersion: '1.2.0', metaUrl: META_URL, request, now: 1000, loadState, saveState
  });
  assert.deepEqual(result, { available: false, latest: null });
});

test('an HTML body resolves to not-available, never throws', async () => {
  const request = fakeRequest([{ status: 200, responseText: '<!DOCTYPE html><html></html>' }]);
  const { loadState, saveState } = fakeGmState();
  const result = await checkForUpdate({
    currentVersion: '1.2.0', metaUrl: META_URL, request, now: 1000, loadState, saveState
  });
  assert.deepEqual(result, { available: false, latest: null });
});

test('a non-200 status (e.g. 404) resolves to not-available, never throws', async () => {
  const request = fakeRequest([{ status: 404, responseText: 'Not Found' }]);
  const { loadState, saveState } = fakeGmState();
  const result = await checkForUpdate({
    currentVersion: '1.2.0', metaUrl: META_URL, request, now: 1000, loadState, saveState
  });
  assert.deepEqual(result, { available: false, latest: null });
});

test('a rejecting request resolves to not-available rather than rejecting', async () => {
  const request = async () => { throw new Error('Network error'); };
  const { loadState, saveState } = fakeGmState();
  await assert.doesNotReject(async () => {
    const result = await checkForUpdate({
      currentVersion: '1.2.0', metaUrl: META_URL, request, now: 1000, loadState, saveState
    });
    assert.deepEqual(result, { available: false, latest: null });
  });
});

test('a throwing (non-promise) request resolves to not-available rather than throwing', async () => {
  const request = () => { throw new Error('boom'); };
  const { loadState, saveState } = fakeGmState();
  await assert.doesNotReject(async () => {
    const result = await checkForUpdate({
      currentVersion: '1.2.0', metaUrl: META_URL, request, now: 1000, loadState, saveState
    });
    assert.deepEqual(result, { available: false, latest: null });
  });
});

test('a state that fails to load or save does not break the check', async () => {
  const request = fakeRequest([{ status: 200, responseText: metaBody('1.10.0') }]);
  const loadState = async () => { throw new Error('storage error'); };
  const saveState = async () => { throw new Error('storage error'); };
  const result = await checkForUpdate({
    currentVersion: '1.2.0', metaUrl: META_URL, request, now: 1000, loadState, saveState
  });
  assert.deepEqual(result, { available: true, latest: '1.10.0' });
});

// --- throttle: at most one check per 30 minutes -----------------------------

test('a second call inside the 30-minute window does not re-request and returns the cached verdict', async () => {
  const request = fakeRequest([{ status: 200, responseText: metaBody('1.10.0') }]);
  const state = fakeGmState();

  const first = await checkForUpdate({
    currentVersion: '1.2.0', metaUrl: META_URL, request, now: 1000,
    loadState: state.loadState, saveState: state.saveState
  });
  assert.deepEqual(first, { available: true, latest: '1.10.0' });
  assert.equal(request.calls.length, 1);

  // 29 minutes later, well inside the 30-minute throttle window.
  const second = await checkForUpdate({
    currentVersion: '1.2.0', metaUrl: META_URL, request, now: 1000 + 29 * 60 * 1000,
    loadState: state.loadState, saveState: state.saveState
  });
  assert.deepEqual(second, { available: true, latest: '1.10.0' });
  assert.equal(request.calls.length, 1, 'the throttled call must not issue a second request');
});

test('a call outside the 30-minute window re-requests', async () => {
  const request = fakeRequest([
    { status: 200, responseText: metaBody('1.10.0') },
    { status: 200, responseText: metaBody('1.11.0') }
  ]);
  const state = fakeGmState();

  await checkForUpdate({
    currentVersion: '1.2.0', metaUrl: META_URL, request, now: 1000,
    loadState: state.loadState, saveState: state.saveState
  });
  const second = await checkForUpdate({
    currentVersion: '1.2.0', metaUrl: META_URL, request, now: 1000 + 31 * 60 * 1000,
    loadState: state.loadState, saveState: state.saveState
  });

  assert.equal(request.calls.length, 2);
  assert.deepEqual(second, { available: true, latest: '1.11.0' });
});

test('a cached not-available verdict is also throttled, not re-requested', async () => {
  const request = fakeRequest([{ status: 200, responseText: metaBody('1.2.0') }]);
  const state = fakeGmState();

  await checkForUpdate({
    currentVersion: '1.2.0', metaUrl: META_URL, request, now: 1000,
    loadState: state.loadState, saveState: state.saveState
  });
  const second = await checkForUpdate({
    currentVersion: '1.2.0', metaUrl: META_URL, request, now: 1000 + 1000,
    loadState: state.loadState, saveState: state.saveState
  });

  assert.equal(request.calls.length, 1);
  assert.deepEqual(second, { available: false, latest: '1.2.0' });
});
