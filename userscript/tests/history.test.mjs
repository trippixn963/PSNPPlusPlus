import test from 'node:test';
import assert from 'node:assert/strict';
import { recordSync, listSyncHistory, MAX_HISTORY } from '../src/history.mjs';

/** A fake GM.* backed by a Map, so history.mjs can be exercised in node. */
function installFakeGM() {
  const store = new Map();
  globalThis.GM = {
    async getValue(key, fallback) { return store.has(key) ? store.get(key) : fallback; },
    async setValue(key, value) { store.set(key, value); },
    async deleteValue(key) { store.delete(key); }
  };
  return store;
}
function uninstallFakeGM() { delete globalThis.GM; }

const delta = over => ({
  listsAdded: 0, listsRemoved: 0, gamesAdded: 0, gamesRemoved: 0, listsLinked: 0, ...over
});

test('an empty history reads as an empty array, not undefined', async () => {
  installFakeGM();
  try {
    assert.deepEqual(await listSyncHistory(), []);
  } finally {
    uninstallFakeGM();
  }
});

test('a recorded sync round-trips with its timestamp, revision and delta', async () => {
  installFakeGM();
  try {
    await recordSync({ revision: 7, delta: delta({ gamesAdded: 3 }) }, 1000);
    assert.deepEqual(await listSyncHistory(), [
      { at: 1000, revision: 7, delta: delta({ gamesAdded: 3 }) }
    ]);
  } finally {
    uninstallFakeGM();
  }
});

test('history is newest-first', async () => {
  installFakeGM();
  try {
    await recordSync({ revision: 1, delta: delta() }, 1000);
    await recordSync({ revision: 2, delta: delta() }, 2000);
    await recordSync({ revision: 3, delta: delta() }, 3000);
    assert.deepEqual((await listSyncHistory()).map(e => e.revision), [3, 2, 1]);
  } finally {
    uninstallFakeGM();
  }
});

test('history is bounded — the oldest entry is evicted past the cap', async () => {
  installFakeGM();
  try {
    assert.equal(MAX_HISTORY, 20);
    for (let i = 1; i <= MAX_HISTORY + 5; i += 1) {
      await recordSync({ revision: i, delta: delta() }, 1000 + i);
    }
    const history = await listSyncHistory();
    assert.equal(history.length, MAX_HISTORY, 'the cap must hold');
    // Newest kept, oldest gone.
    assert.equal(history[0].revision, MAX_HISTORY + 5);
    assert.equal(history[history.length - 1].revision, 6);
    assert.equal(history.some(e => e.revision <= 5), false, 'the 5 oldest must be evicted');
  } finally {
    uninstallFakeGM();
  }
});

test('a garbage history value reads as empty instead of throwing', async () => {
  // History is a nicety; sync is the product. A stored value of the wrong shape
  // must never be able to spread out of here and turn a good sync into an
  // "Offline" chip.
  const store = installFakeGM();
  try {
    for (const junk of ['not an array', 42, null, { nope: true }]) {
      store.set('psnppp.history', junk);
      assert.deepEqual(await listSyncHistory(), [], `${JSON.stringify(junk)} must read as empty`);
      await assert.doesNotReject(() => recordSync({ revision: 1, delta: delta() }, 1000));
      assert.equal((await listSyncHistory()).length, 1, 'and recording must recover it');
    }
  } finally {
    uninstallFakeGM();
  }
});
