import test from 'node:test';
import assert from 'node:assert/strict';
import { saveBackup, listBackups, restoreBackup } from '../src/backup.mjs';

/** A fake GM.* backed by a Map, so backup.mjs can be exercised in node. */
function installFakeGM() {
  const store = new Map();
  globalThis.GM = {
    async getValue(key, fallback) {
      return store.has(key) ? store.get(key) : fallback;
    },
    async setValue(key, value) {
      store.set(key, value);
    },
    async deleteValue(key) {
      store.delete(key);
    }
  };
  return store;
}

function uninstallFakeGM() {
  delete globalThis.GM;
}

test('a saved backup is retrievable by restoreBackup', async () => {
  installFakeGM();
  try {
    const lists = [{ id: 'a', games: [] }];
    const id = await saveBackup(lists, 1000);
    const restored = await restoreBackup(id);
    assert.deepEqual(restored, lists);
  } finally {
    uninstallFakeGM();
  }
});

test('the index is capped at 5 entries and evicted entries are actually deleted', async () => {
  const store = installFakeGM();
  try {
    const ids = [];
    for (let i = 0; i < 6; i++) {
      ids.push(await saveBackup([{ id: `list-${i}` }], 1000 + i));
    }
    const index = await listBackups();
    assert.equal(index.length, 5);

    // The oldest backup (first saved) should have been evicted from the index...
    const oldestId = ids[0];
    assert.ok(!index.some(entry => entry.id === oldestId));

    // ...and its stored value must actually be gone, not just dropped from the index.
    assert.equal(store.has(oldestId), false);

    // The newest 5 should still be present and retrievable.
    for (const id of ids.slice(1)) {
      assert.ok(index.some(entry => entry.id === id));
      await assert.doesNotReject(() => restoreBackup(id));
    }
  } finally {
    uninstallFakeGM();
  }
});

test('restoreBackup on an unknown id throws', async () => {
  installFakeGM();
  try {
    await assert.rejects(() => restoreBackup('psnppp.backup.nonexistent'));
  } finally {
    uninstallFakeGM();
  }
});

test('listBackups returns newest-first', async () => {
  installFakeGM();
  try {
    const id1 = await saveBackup([{ id: 'a' }], 1000);
    const id2 = await saveBackup([{ id: 'b' }], 2000);
    const id3 = await saveBackup([{ id: 'c' }], 3000);
    const index = await listBackups();
    assert.deepEqual(index.map(entry => entry.id), [id3, id2, id1]);
  } finally {
    uninstallFakeGM();
  }
});
