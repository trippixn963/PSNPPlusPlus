import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SETTINGS_DOCUMENT, emptySettingsDoc, stampSettings, mergeSettings, toStoreValues, syncSettings
} from '../src/settings-sync.mjs';
import { SETTINGS_KEY, SCRIPT_STATE_KEY } from '../src/settings-bridge.mjs';

const fakeStorage = (initial = {}) => {
  const data = {};
  for (const [k, v] of Object.entries(initial)) data[k] = JSON.stringify(v);
  return {
    getItem: key => (key in data ? data[key] : null),
    setItem: (key, value) => { data[key] = String(value); },
    removeItem: key => { delete data[key]; },
    parsed: key => (key in data ? JSON.parse(data[key]) : null)
  };
};

const fakeServer = (doc = emptySettingsDoc(), revision = 0) => ({
  doc, revision,
  async getState() { return { revision: this.revision, updatedAt: 0, doc: this.doc }; },
  async putState(baseRevision, doc) {
    if (baseRevision !== this.revision) {
      return { ok: false, conflict: true, revision: this.revision, doc: this.doc };
    }
    this.doc = doc; this.revision += 1;
    return { ok: true, revision: this.revision };
  }
});

const run = (storage, server, base, now = 1000) => {
  let saved = base ?? emptySettingsDoc();
  return {
    promise: syncSettings({
      storage, client: server, now,
      loadBase: async () => saved, saveBase: async d => { saved = d; }
    }),
    get base() { return saved; }
  };
};

/** A base representing a device that HAS synced before — not a first sync. */
const settled = settings => ({ version: 1, settings });

test('the document key is the one the sidecar allowlists', () => {
  assert.equal(SETTINGS_DOCUMENT, 'settings');
});

// --- merge rules ------------------------------------------------------------

test('two machines changing different settings both survive', () => {
  const mine = settled({ 'psnpp-settings.a': { value: 1, updatedAt: 500 } });
  const theirs = settled({ 'psnpp-settings.b': { value: 2, updatedAt: 600 } });
  const merged = mergeSettings(mine, theirs);
  assert.equal(merged.settings['psnpp-settings.a'].value, 1);
  assert.equal(merged.settings['psnpp-settings.b'].value, 2);
});

test('the same setting changed on both resolves to the newer one', () => {
  const older = settled({ 'psnpp-settings.a': { value: 'old', updatedAt: 500 } });
  const newer = settled({ 'psnpp-settings.a': { value: 'new', updatedAt: 900 } });
  assert.equal(mergeSettings(older, newer).settings['psnpp-settings.a'].value, 'new');
  assert.equal(mergeSettings(newer, older).settings['psnpp-settings.a'].value, 'new',
    'and the same way whichever machine is asking');
});

test('an exact-timestamp tie settles identically on both machines', () => {
  // Each machine sees the other as "remote". A rule that preferred remote would
  // flip depending on who asked, and the two would trade the value forever.
  const a = settled({ 'psnpp-settings.x': { value: 'alpha', updatedAt: 700 } });
  const b = settled({ 'psnpp-settings.x': { value: 'beta', updatedAt: 700 } });
  assert.equal(
    mergeSettings(a, b).settings['psnpp-settings.x'].value,
    mergeSettings(b, a).settings['psnpp-settings.x'].value
  );
});

// --- the first-sync trap ----------------------------------------------------

test('a fresh device does not push its defaults over configured settings', () => {
  const configured = settled({ 'psnpp-settings.hideStacks': { value: true, updatedAt: 500 } });
  const fresh = stampSettings(null, { [SETTINGS_KEY]: { hideStacks: false } }, 999999);
  assert.equal(fresh.firstSync, true, 'no base means this device has never synced');
  assert.equal(fresh.settings['psnpp-settings.hideStacks'].updatedAt, 0,
    'so it cannot claim its value is new');
  const merged = mergeSettings(fresh, configured, { preferRemote: true });
  assert.equal(merged.settings['psnpp-settings.hideStacks'].value, true);
});

test('when both sides are first-sync stamps, the server still wins', () => {
  // The case the 0-stamp alone does not cover: device A first-synced and pushed
  // its 0-stamped values, then device B first-syncs. Every stamp is 0 on both
  // sides, so the timestamp comparison is a tie and only preferRemote decides
  // it. Without it, whichever value happens to serialize smaller wins — so a
  // second machine could still overwrite the first one's settings.
  const alreadyOnServer = settled({ 'psnpp-settings.hideStacks': { value: true, updatedAt: 0 } });
  const fresh = stampSettings(null, { [SETTINGS_KEY]: { hideStacks: false } }, 999999);
  const merged = mergeSettings(fresh, alreadyOnServer, { preferRemote: fresh.firstSync });
  assert.equal(merged.settings['psnpp-settings.hideStacks'].value, true);
});

test('a settled device does stamp a real edit with now', () => {
  const base = settled({ 'psnpp-settings.hideStacks': { value: true, updatedAt: 500 } });
  const edited = stampSettings(base, { [SETTINGS_KEY]: { hideStacks: false } }, 900);
  assert.equal(edited.firstSync, false);
  assert.equal(edited.settings['psnpp-settings.hideStacks'].updatedAt, 900);
});

test('an unchanged setting keeps its original timestamp, whatever its key order', () => {
  const base = settled({ 'psnpp-settings.a': { value: { x: 1, y: 2 }, updatedAt: 500 } });
  const again = stampSettings(base, { [SETTINGS_KEY]: { a: { y: 2, x: 1 } } }, 900);
  assert.equal(again.settings['psnpp-settings.a'].updatedAt, 500);
});

// --- shape round trip -------------------------------------------------------

test('toStoreValues splits the flat document back per store', () => {
  const values = toStoreValues({
    version: 1,
    settings: {
      'psnpp-settings.hideStacks': { value: true, updatedAt: 1 },
      'psnpp-scriptstate.hideLowOwners': { value: false, updatedAt: 1 }
    }
  });
  assert.deepEqual(values, {
    [SETTINGS_KEY]: { hideStacks: true },
    [SCRIPT_STATE_KEY]: { hideLowOwners: false }
  });
});

test('toStoreValues ignores a malformed entry rather than throwing', () => {
  assert.doesNotThrow(() => toStoreValues({
    settings: { 'nodot': { value: 1 }, 'psnpp-settings.ok': null, '.leading': { value: 2 } }
  }));
});

// --- the whole cycle --------------------------------------------------------

test('a setting made on one machine reaches the other', async () => {
  const server = fakeServer();
  const a = fakeStorage({ [SETTINGS_KEY]: { hideStacks: true } });
  await run(a, server, settled({ 'psnpp-settings.hideStacks': { value: false, updatedAt: 1 } }), 500).promise;

  const b = fakeStorage({ [SETTINGS_KEY]: { hideStacks: false } });
  await run(b, server, null, 2000).promise;
  assert.equal(b.parsed(SETTINGS_KEY).hideStacks, true);
});

test('the PlatPrices credential never leaves and is never overwritten', async () => {
  const server = fakeServer();
  const storage = fakeStorage({ [SETTINGS_KEY]: { platPricesApiKey: 'SECRET-abc', hideStacks: true } });
  await run(storage, server).promise;
  assert.equal(JSON.stringify(server.doc).includes('SECRET-abc'), false, 'not pushed');
  assert.equal(JSON.stringify(server.doc).includes('platPricesApiKey'), false, 'not even the field name');
  assert.equal(storage.parsed(SETTINGS_KEY).platPricesApiKey, 'SECRET-abc', 'and still here');
});

test('a conflicting push leaves the base unadvanced', async () => {
  const server = fakeServer();
  server.putState = async () => ({ ok: false, conflict: true, revision: 9, doc: emptySettingsDoc() });
  const storage = fakeStorage({ [SETTINGS_KEY]: { hideStacks: true } });
  const h = run(storage, server);
  const result = await h.promise;
  assert.equal(result.status, 'conflict');
  assert.deepEqual(h.base, emptySettingsDoc());
});
