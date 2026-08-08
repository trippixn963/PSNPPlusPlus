import test from 'node:test';
import assert from 'node:assert/strict';
import { readCompareValues, writeCompareValues, COMPARE_KEY } from '../src/compare-bridge.mjs';
import { syncCompare, emptyCompareDoc } from '../src/compare-sync.mjs';

/** A GM stand-in backed by a Map, matching the shape the other suites install. */
const fakeGm = (initial = {}) => {
  const store = new Map(Object.entries(initial));
  return {
    store,
    async getValue(key, fallback) { return store.has(key) ? store.get(key) : fallback; },
    async setValue(key, value) { store.set(key, value); },
    async deleteValue(key) { store.delete(key); }
  };
};

const fakeStorage = (initial = {}) => {
  const map = new Map(Object.entries(initial));
  return {
    map,
    getItem: key => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => { map.set(key, String(value)); },
    removeItem: key => { map.delete(key); }
  };
};

/** A sidecar that holds one document and enforces the revision. */
const fakeClient = (doc = null, revision = 0) => {
  const state = { doc, revision };
  return {
    state,
    async getState() { return { doc: state.doc, revision: state.revision }; },
    async putState(baseRevision, next) {
      if (baseRevision !== state.revision) return { ok: false, conflict: true };
      state.doc = next;
      state.revision += 1;
      return { ok: true, revision: state.revision };
    }
  };
};

// --- the bridge -------------------------------------------------------------

test('GM is preferred over localStorage, which is the whole point of the fork', async () => {
  // A separate companion userscript has its own GM namespace and cannot see
  // this at all. Vendored, it is the same namespace PSNP+ wrote to.
  const gm = fakeGm({ [COMPARE_KEY]: '{"1234":"alice,bob"}' });
  const storage = fakeStorage({ [COMPARE_KEY]: '{"1234":"stale"}' });
  assert.deepEqual(await readCompareValues({ gm, storage }), { 1234: 'alice,bob' });
});

test('an older PSNP+ profile still in localStorage is not reported as empty', async () => {
  const gm = fakeGm();
  const storage = fakeStorage({ [COMPARE_KEY]: '{"99":"carol"}' });
  assert.deepEqual(await readCompareValues({ gm, storage }), { 99: 'carol' });
});

test('unreadable data reads as empty rather than throwing', async () => {
  for (const raw of ['not json', '[]', 'null', '"a string"', '42']) {
    const gm = fakeGm({ [COMPARE_KEY]: raw });
    assert.deepEqual(await readCompareValues({ gm, storage: fakeStorage() }), {},
      `${raw} must read as empty`);
  }
});

test('non-string values are coerced or dropped, never pushed as-is', async () => {
  // PSNP+ only ever stores the text of an input box. Anything else came from a
  // corrupted blob, and syncing it would spread that to every device.
  const gm = fakeGm({ [COMPARE_KEY]: '{"a":"ok","b":42,"c":{"nested":1},"d":null}' });
  const values = await readCompareValues({ gm, storage: fakeStorage() });
  assert.deepEqual(values, { a: 'ok', b: '42' });
});

test('a write drops the legacy localStorage copy, the way PSNP+ does', async () => {
  // Two sources of truth means the stale one wins the moment GM is cleared.
  const gm = fakeGm();
  const storage = fakeStorage({ [COMPARE_KEY]: '{"old":"value"}' });
  assert.equal(await writeCompareValues({ 1: 'alice' }, { gm, storage }), true);
  assert.equal(storage.getItem(COMPARE_KEY), null, 'legacy copy removed');
  assert.equal(await gm.getValue(COMPARE_KEY), '{"1":"alice"}');
});

test('without GM it falls back to localStorage', async () => {
  const storage = fakeStorage();
  assert.equal(await writeCompareValues({ 1: 'alice' }, { gm: undefined, storage }), true);
  assert.equal(storage.getItem(COMPARE_KEY), '{"1":"alice"}');
});

test('a failing write is reported false, not thrown', async () => {
  const gm = { setValue: async () => { throw new Error('nope'); } };
  assert.equal(await writeCompareValues({ 1: 'a' }, { gm, storage: fakeStorage() }), false);
});

// --- the cycle --------------------------------------------------------------

const run = ({ gm, storage, client, base = null, now = 1000 }) => {
  let saved = base;
  return syncCompare({
    client,
    loadBase: async () => saved,
    saveBase: async doc => { saved = doc; },
    now, gm, storage
  }).then(result => ({ result, savedBase: () => saved }));
};

test('a first sync takes the server copy rather than pushing local defaults over it', async () => {
  // The firstSync rule: a device that has never synced has no evidence it
  // changed anything, so it must not outrank a real preference already stored.
  const gm = fakeGm({ [COMPARE_KEY]: '{"1":"local-only"}' });
  const storage = fakeStorage();
  const client = fakeClient({ version: 1, settings: { 'compare.1': { value: 'server', updatedAt: 500 } } }, 3);

  const { result } = await run({ gm, storage, client });
  assert.equal(result.status, 'synced');
  assert.deepEqual(JSON.parse(await gm.getValue(COMPARE_KEY)), { 1: 'server' });
});

test('a local edit after a real base wins over an older server value', async () => {
  const gm = fakeGm({ [COMPARE_KEY]: '{"1":"alice,bob"}' });
  const storage = fakeStorage();
  const base = { version: 1, settings: { 'compare.1': { value: 'alice', updatedAt: 100 } } };
  const client = fakeClient({ version: 1, settings: { 'compare.1': { value: 'alice', updatedAt: 100 } } }, 1);

  const { result } = await run({ gm, storage, client, base, now: 900 });
  assert.equal(result.status, 'synced');
  assert.equal(client.state.doc.settings['compare.1'].value, 'alice,bob', 'the edit was pushed');
  assert.equal(client.state.doc.settings['compare.1'].updatedAt, 900, 'and stamped now');
});

test('entries from two devices are unioned, not replaced', async () => {
  const gm = fakeGm({ [COMPARE_KEY]: '{"1":"mine"}' });
  const storage = fakeStorage();
  const base = { version: 1, settings: { 'compare.1': { value: 'mine', updatedAt: 100 } } };
  const client = fakeClient({ version: 1, settings: { 'compare.2': { value: 'theirs', updatedAt: 200 } } }, 1);

  const { result } = await run({ gm, storage, client, base, now: 300 });
  assert.equal(result.changed, true);
  assert.deepEqual(JSON.parse(await gm.getValue(COMPARE_KEY)), { 1: 'mine', 2: 'theirs' });
});

test('a cycle that changes nothing reports changed: false and writes nothing', async () => {
  // Otherwise the chip would claim "Compare+ updated" on every single cycle.
  const gm = fakeGm({ [COMPARE_KEY]: '{"1":"same"}' });
  const storage = fakeStorage();
  const base = { version: 1, settings: { 'compare.1': { value: 'same', updatedAt: 100 } } };
  const client = fakeClient({ version: 1, settings: { 'compare.1': { value: 'same', updatedAt: 100 } } }, 1);

  let writes = 0;
  const counting = { ...gm, setValue: async (k, v) => { writes += 1; return gm.setValue(k, v); } };
  const { result } = await run({ gm: counting, storage, client, base, now: 999 });
  assert.equal(result.changed, false);
  assert.equal(writes, 0, 'no write at all');
});

test('a conflicting revision reports conflict and does not stamp a new base', async () => {
  const gm = fakeGm({ [COMPARE_KEY]: '{"1":"mine"}' });
  const storage = fakeStorage();
  const base = { version: 1, settings: { 'compare.1': { value: 'old', updatedAt: 100 } } };
  const client = fakeClient({ version: 1, settings: {} }, 5);
  client.putState = async () => ({ ok: false, conflict: true });

  const { result, savedBase } = await run({ gm, storage, client, base, now: 300 });
  assert.equal(result.status, 'conflict');
  assert.equal(savedBase(), base, 'the base is untouched, so the next cycle retries honestly');
});

test('an empty document is the shape the merge expects', () => {
  const doc = emptyCompareDoc();
  assert.deepEqual(doc.settings, {});
  assert.equal(typeof doc.version, 'number');
});
