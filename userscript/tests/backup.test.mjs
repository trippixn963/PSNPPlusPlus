import test from 'node:test';
import assert from 'node:assert/strict';
import {
  saveBackup, saveDailyBackup, listBackups, restoreBackup, easternDay, MAX_BACKUPS
} from '../src/backup.mjs';

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

test('the index is capped and evicted entries are actually deleted', async () => {
  const store = installFakeGM();
  try {
    const ids = [];
    for (let i = 0; i < MAX_BACKUPS + 1; i++) {
      ids.push(await saveBackup([{ id: `list-${i}` }], 1000 + i));
    }
    const index = await listBackups();
    assert.equal(index.length, MAX_BACKUPS);

    // The oldest backup (first saved) should have been evicted from the index...
    const oldestId = ids[0];
    assert.ok(!index.some(entry => entry.id === oldestId));

    // ...and its stored value must actually be gone, not just dropped from the index.
    assert.equal(store.has(oldestId), false);

    // The newest MAX_BACKUPS should still be present and retrievable.
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

test('an index written under a larger cap collapses on the next READ', async () => {
  // The reported bug. MAX_BACKUPS was lowered from five to three, but trimming
  // only happened on save -- so a device that had not merged since kept showing
  // five rows, with no way to ever reach three except by syncing three times.
  const store = installFakeGM();
  try {
    const legacy = [];
    for (let i = 0; i < 5; i++) {
      const id = `psnppp.backup.${2000 + i}`;
      await GM.setValue(id, JSON.stringify([{ id: `l${i}` }]));
      legacy.push({ id, at: 2000 + i, listCount: 1 });
    }
    // Newest first, exactly as saveBackup would have left it under the old cap.
    legacy.reverse();
    await GM.setValue('psnppp.backups', legacy);

    const index = await listBackups();

    assert.equal(index.length, MAX_BACKUPS, 'the read applies the current cap');
    assert.deepEqual(index.map(e => e.id), legacy.slice(0, MAX_BACKUPS).map(e => e.id),
      'and keeps the newest, not an arbitrary three');
    for (const entry of legacy.slice(MAX_BACKUPS)) {
      assert.equal(store.has(entry.id), false, 'the dropped blobs are deleted, not orphaned');
    }
    assert.deepEqual(await GM.getValue('psnppp.backups', []), index,
      'and the trim is persisted, so it does not re-run on every open');
  } finally {
    uninstallFakeGM();
  }
});

test('a protected entry survives a save that would otherwise evict it', async () => {
  // At three slots, the restore flow's own safety snapshot is exactly what
  // would evict the oldest entry — which is the one a restore usually targets.
  // A restore that destroys its own source is the worst behaviour the escape
  // hatch could have.
  const store = installFakeGM();
  try {
    const ids = [];
    for (let i = 0; i < MAX_BACKUPS; i++) ids.push(await saveBackup([{ id: `l${i}` }], 1000 + i));
    const oldest = ids[0];

    await saveBackup([{ id: 'safety' }], 9000, { protect: oldest });

    const index = await listBackups();
    assert.ok(index.some(e => e.id === oldest), 'the protected entry is still indexed');
    assert.equal(store.has(oldest), true, 'and its stored value still exists');
    await assert.doesNotReject(() => restoreBackup(oldest));
    assert.equal(index.length, MAX_BACKUPS + 1, 'one over the cap, for the length of the restore');
  } finally {
    uninstallFakeGM();
  }
});

test('without protection the cap is still enforced exactly', async () => {
  const store = installFakeGM();
  try {
    const ids = [];
    for (let i = 0; i < MAX_BACKUPS + 2; i++) ids.push(await saveBackup([{ id: `l${i}` }], 1000 + i));
    const index = await listBackups();
    assert.equal(index.length, MAX_BACKUPS);
    assert.equal(store.has(ids[0]), false, 'evicted values are deleted, not orphaned');
  } finally {
    uninstallFakeGM();
  }
});


// ---------------------------------------------------------------------------
// One snapshot per Eastern day
// ---------------------------------------------------------------------------

// Deliberately expressed as UTC instants, because the whole point is that the
// Eastern DAY and the UTC day disagree for five hours out of every twenty-four.
const AUG10_8PM_ET = Date.parse('2026-08-11T00:00:00Z');  // Aug 10, 20:00 EDT
const AUG10_11PM_ET = Date.parse('2026-08-11T03:30:00Z'); // Aug 10, 23:30 EDT
const AUG11_12AM_ET = Date.parse('2026-08-11T04:30:00Z'); // Aug 11, 00:30 EDT

test('the Eastern day is the Eastern day, not the UTC day', () => {
  // 8pm Eastern is already tomorrow in UTC. Keying off UTC would roll the day
  // over at 8pm local and take a second "daily" backup the same evening.
  assert.equal(easternDay(AUG10_8PM_ET), '2026-08-10');
  assert.equal(new Date(AUG10_8PM_ET).toISOString().slice(0, 10), '2026-08-11',
    'the fixture really does straddle the UTC boundary');
});

test('the Eastern day follows DST, not a fixed offset', () => {
  // 23:30 EST in January is 04:30Z the next day; a hardcoded -4 would call the
  // January one the 16th and roll the day over half an hour early all winter.
  assert.equal(easternDay(Date.parse('2026-01-16T04:30:00Z')), '2026-01-15');
  assert.equal(easternDay(Date.parse('2026-07-16T04:30:00Z')), '2026-07-16');
});

test('a second sync on the same Eastern day does not take another backup', async () => {
  installFakeGM();
  try {
    assert.notEqual(await saveDailyBackup([{ id: 'a' }], AUG10_8PM_ET), null, 'the first one saves');
    assert.equal(await saveDailyBackup([{ id: 'b' }], AUG10_11PM_ET), null, 'the second is skipped');
    assert.equal((await listBackups()).length, 1);
  } finally {
    uninstallFakeGM();
  }
});

test('crossing midnight Eastern takes the new day\'s backup', async () => {
  installFakeGM();
  try {
    await saveDailyBackup([{ id: 'a' }], AUG10_11PM_ET);
    assert.notEqual(await saveDailyBackup([{ id: 'b' }], AUG11_12AM_ET), null, 'one hour later, new day');
    assert.equal((await listBackups()).length, 2);
  } finally {
    uninstallFakeGM();
  }
});

test('daily backups still evict the oldest at the cap', async () => {
  const store = installFakeGM();
  try {
    const day = n => Date.parse(`2026-08-${String(n).padStart(2, '0')}T16:00:00Z`);
    const ids = [];
    for (let d = 1; d <= MAX_BACKUPS + 1; d++) ids.push(await saveDailyBackup([{ id: `l${d}` }], day(d)));
    const index = await listBackups();
    assert.equal(index.length, MAX_BACKUPS);
    assert.equal(store.has(ids[0]), false, 'the oldest day is deleted, not orphaned');
  } finally {
    uninstallFakeGM();
  }
});

test('a backup holds every list in one entry', async () => {
  installFakeGM();
  try {
    const lists = [{ id: 'a', games: [1] }, { id: 'b', games: [2] }, { id: 'c', games: [3] }];
    const id = await saveDailyBackup(lists, AUG10_8PM_ET);
    assert.deepEqual(await restoreBackup(id), lists, 'restoring returns all three together');
    assert.equal((await listBackups())[0].listCount, 3, 'and the row counts all three');
  } finally {
    uninstallFakeGM();
  }
});
