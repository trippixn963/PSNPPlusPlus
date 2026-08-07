import test from 'node:test';
import assert from 'node:assert/strict';
import { saveBackup, listBackups } from '../src/backup.mjs';
import { writeLists, readLists, LISTS_KEY } from '../src/lists-bridge.mjs';
import { openSettings } from '../src/main.mjs';

/**
 * main.mjs is the browser entry point and is otherwise verified in a real
 * browser during deploy (per the project's own convention — see sync-cycle.mjs
 * vs. main.mjs). openSettings is the one exception: it is the escape-hatch
 * restore path, and a review round found a real ordering bug in it (R1), so
 * it is worth pinning against fake GM/window globals the same way backup.mjs
 * and config.mjs are already tested against a fake GM.
 */

const fakeStorage = (initial = {}) => {
  const data = { ...initial };
  return {
    getItem: key => (key in data ? data[key] : null),
    setItem: (key, value) => { data[key] = String(value); },
    removeItem: key => { delete data[key]; }
  };
};

const list = (id, name, games = []) => ({
  id, name, tags: [], removeStartedGames: false, removeGames: false,
  orderBy: 'custom', direction: 'ascending', note: '', timestamp: 100, games
});

/** A fake GM.* backed by a Map, so backup.mjs can be exercised in node. */
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

/** A fake window.* with scripted prompt/confirm answers, consumed in order. */
function installFakeWindow(storage, { prompts = [], confirms = [] } = {}) {
  const alerts = [];
  let reloaded = false;
  globalThis.window = {
    localStorage: storage,
    prompt: () => (prompts.length ? prompts.shift() : null),
    confirm: () => (confirms.length ? confirms.shift() : true),
    alert: message => { alerts.push(message); },
    location: { reload: () => { reloaded = true; } }
  };
  return { alerts, wasReloaded: () => reloaded };
}
function uninstallFakeWindow() { delete globalThis.window; }

test('restoring the oldest of 5 full backup slots succeeds without evicting itself', async () => {
  installFakeGM();
  const storage = fakeStorage();
  writeLists(storage, [list('current', 'Current', [{ id: 'gX', title: 'X', platforms: {}, tags: [] }])]);

  try {
    // Fill all 5 backup.mjs slots. The oldest one — timestamp 1000 — is the
    // pre-corruption snapshot a user restoring from a full backup log is
    // most likely to want, and it's the slot at risk of being evicted by the
    // restore's own "back up current lists first" step if that step runs
    // before the restore reads the chosen entry.
    await saveBackup([list('oldest', 'Oldest')], 1000);
    for (let i = 1; i < 5; i++) {
      await saveBackup([list(`slot-${i}`, `Slot ${i}`)], 1000 + i);
    }
    const backups = await listBackups();
    assert.equal(backups.length, 5);
    // listBackups is newest-first (backup.test.mjs pins this), so the oldest
    // entry is the LAST menu row — number 5 in the 1-based prompt.
    const oldestMenuNumber = String(backups.length);
    assert.equal(backups[backups.length - 1].listCount, 1);

    const fake = installFakeWindow(storage, {
      prompts: ['2', oldestMenuNumber], // "2" = restore a backup, then pick the oldest
      confirms: [true]
    });
    try {
      await openSettings();
    } finally {
      uninstallFakeWindow();
    }

    assert.deepEqual(readLists(storage).map(l => l.id), ['oldest']);
    assert.equal(fake.alerts.some(a => /failed/i.test(a)), false, `unexpected alert(s): ${fake.alerts.join(' | ')}`);
    assert.ok(fake.wasReloaded());
  } finally {
    uninstallFakeGM();
  }
});

test('declining the restore confirmation leaves storage untouched', async () => {
  installFakeGM();
  const storage = fakeStorage();
  writeLists(storage, [list('current', 'Current')]);

  try {
    await saveBackup([list('backup-1', 'Backup One')], 1000);
    const before = storage.getItem(LISTS_KEY);

    const fake = installFakeWindow(storage, {
      prompts: ['2', '1'],
      confirms: [false] // decline the "replace your current lists?" confirm
    });
    try {
      await openSettings();
    } finally {
      uninstallFakeWindow();
    }

    assert.equal(storage.getItem(LISTS_KEY), before);
    assert.equal(fake.wasReloaded(), false);
  } finally {
    uninstallFakeGM();
  }
});
