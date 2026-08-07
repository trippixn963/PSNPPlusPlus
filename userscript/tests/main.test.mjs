import test from 'node:test';
import assert from 'node:assert/strict';
import { saveBackup, listBackups } from '../src/backup.mjs';
import { recordSync } from '../src/history.mjs';
import { writeLists, readLists, LISTS_KEY } from '../src/lists-bridge.mjs';
import { openSettings, loadBase, handleSyncNowClick, describeSyncResult, describeDelta,
  createIndicatorPainter, decorateDetail } from '../src/main.mjs';
import { emptyDoc, toDoc } from '../src/doc.mjs';
import { stampChanges } from '../src/merger.mjs';

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

/**
 * A fake window.* with scripted prompt/confirm answers, consumed in order.
 * Every prompt call is also recorded, so a test can assert on the menu text
 * itself and not only on what the answer produced.
 */
function installFakeWindow(storage, { prompts = [], confirms = [] } = {}) {
  const alerts = [];
  const promptCalls = [];
  let reloaded = false;
  globalThis.window = {
    localStorage: storage,
    prompt: (message, initial) => {
      promptCalls.push({ message, initial });
      return prompts.length ? prompts.shift() : null;
    },
    confirm: () => (confirms.length ? confirms.shift() : true),
    alert: message => { alerts.push(message); },
    location: { reload: () => { reloaded = true; } }
  };
  return { alerts, promptCalls, wasReloaded: () => reloaded };
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

// --- loadBase must never hand a shapeless document to the cycle -------------
//
// Every consumer of the base iterates `base.lists`. A base that parses but has
// no lists object ({} or {version:1}) therefore throws a raw TypeError out of
// stampChanges on every cycle, forever, and the user sees it as an "Offline"
// chip with a stack-trace message and no way to recover.

test('a base with no lists object is treated as an empty document, not a permanent TypeError', async () => {
  const store = installFakeGM();
  try {
    for (const raw of ['{}', '{"version":1}', 'null', '[]', '"nope"', '{"lists":null}']) {
      store.set('psnppp.base', raw);
      const base = await loadBase();
      assert.deepEqual(base, emptyDoc(), `${raw} must fall back to emptyDoc()`);
      // The fallback is only worth anything if it survives the thing that used
      // to throw: stampChanges reading "in base, missing from local".
      assert.doesNotThrow(() => stampChanges(base, emptyDoc(), 1000));
    }
  } finally {
    uninstallFakeGM();
  }
});

test('a well-shaped base is returned untouched', async () => {
  const store = installFakeGM();
  try {
    const doc = stampChanges(emptyDoc(), toDoc([list('A', 'Wishlist')]), 500);
    store.set('psnppp.base', JSON.stringify(doc));
    assert.deepEqual(await loadBase(), doc);
  } finally {
    uninstallFakeGM();
  }
});

// --- left-click on the chip: setup vs. sync-now -----------------------------
//
// A left-click used to always call sync(), which bails out to the same
// 'unconfigured' label with no visible change when no key is stored — a
// click that silently does nothing. handleSyncNowClick is the decision that
// replaced it: no key -> open settings; a key -> sync, unchanged.

test('with no key stored, a chip click opens settings instead of syncing', async () => {
  let openSettingsCalls = 0;
  let syncCalls = 0;
  await handleSyncNowClick({
    loadConfig: async () => ({ endpoint: 'https://example.test', key: '' }),
    openSettings: async () => { openSettingsCalls += 1; },
    sync: async () => { syncCalls += 1; }
  });
  assert.equal(openSettingsCalls, 1);
  assert.equal(syncCalls, 0);
});

test('with a key stored, a chip click syncs and does not open settings', async () => {
  let openSettingsCalls = 0;
  let syncCalls = 0;
  await handleSyncNowClick({
    loadConfig: async () => ({ endpoint: 'https://example.test', key: 'sekrit' }),
    openSettings: async () => { openSettingsCalls += 1; },
    sync: async () => { syncCalls += 1; }
  });
  assert.equal(syncCalls, 1);
  assert.equal(openSettingsCalls, 0);
});

// --- a completed sync that changed storage must say "reload" ---------------
//
// PSNP+ renders its list view from localStorage at render time; a write
// behind an already-drawn page is invisible until reload. `changed` is
// runSyncCycle's own truthful report of whether the cycle wrote, so the chip
// must say "reload" exactly when changed is true, and must not when it's
// false (the common, nothing-to-write case).

test('a sync that changed storage puts the chip in a reload-telling state', () => {
  const { state, detail } = describeSyncResult({ status: 'synced', revision: 7, changed: true });
  assert.match(state + ' ' + detail, /reload/i);
});

test('a sync that changed nothing keeps the plain synced text, no reload mention', () => {
  const { state, detail } = describeSyncResult({ status: 'synced', revision: 7, changed: false });
  assert.equal(state, 'synced');
  assert.doesNotMatch(detail, /reload/i);
});

// --- the tooltip says WHAT changed ------------------------------------------
//
// "Synced" answers a question nobody has. The merge already knows the delta,
// and the tooltip is the one place it can go without adding UI chrome — the
// chip's LABEL stays short and comes from indicator.mjs's fixed state table.

const delta = over => ({
  listsAdded: 0, listsRemoved: 0, gamesAdded: 0, gamesRemoved: 0, listsLinked: 0, ...over
});

test('the delta appears in the tooltip detail', () => {
  const { detail } = describeSyncResult({
    status: 'synced', revision: 7, changed: true,
    delta: delta({ gamesAdded: 3, gamesRemoved: 1, listsAdded: 2, listsRemoved: 1, listsLinked: 1 })
  });
  assert.match(detail, /3 games/);
  assert.match(detail, /1 game\b/);
  assert.match(detail, /2 lists/);
  assert.match(detail, /1 list\b/);
  assert.match(detail, /linked/);
  assert.match(detail, /Revision 7/);
});

test('the delta is singular or plural as the counts require', () => {
  const one = describeSyncResult({
    status: 'synced', revision: 1, changed: true, delta: delta({ gamesAdded: 1 })
  }).detail;
  assert.match(one, /\b1 game\b/);
  assert.doesNotMatch(one, /1 games/);

  const many = describeSyncResult({
    status: 'synced', revision: 1, changed: true, delta: delta({ gamesAdded: 4 })
  }).detail;
  assert.match(many, /\b4 games\b/);
});

test('counts that did not move are left out of the delta phrase entirely', () => {
  // Asserted on describeDelta rather than the whole tooltip: the tooltip's
  // trailing "reload the page to see your updated lists" legitimately contains
  // the word, and matching against it would test the sentence, not the counts.
  assert.equal(describeDelta(delta({ gamesAdded: 2 })), '+2 games');
  assert.equal(describeDelta(delta({ gamesRemoved: 1 })), '-1 game');
  assert.equal(describeDelta(delta({ listsAdded: 1, gamesAdded: 5 })), '+5 games, +1 list');
  assert.equal(describeDelta(delta({ listsLinked: 2 })), '2 lists linked');
});

test('a change with no countable delta still says something true', () => {
  // A rename or a reorder moves none of the five counters but genuinely wrote.
  // Reporting "0 games" there would be worse than saying nothing specific.
  const { detail } = describeSyncResult({
    status: 'synced', revision: 7, changed: true, delta: delta()
  });
  assert.doesNotMatch(detail, /\b0\b/);
  assert.match(detail, /Revision 7/);
});

test('a result carrying no delta at all does not produce "undefined" in the tooltip', () => {
  // Defensive: a history entry written by an older version has no delta.
  const { detail } = describeSyncResult({ status: 'synced', revision: 7, changed: true });
  assert.doesNotMatch(detail, /undefined|NaN/);
});

// --- `reload` is an affordance, not a status --------------------------------
//
// Our own writeSyncable goes through the patched setItem -> watchLists.check()
// -> onChange -> the 3s debounce -> a second, no-op cycle. That cycle reports
// changed === false, which used to repaint the chip 'synced' about three
// seconds after it said 'reload'. PSNP+'s drawn list is still stale at that
// point, so the chip stopped telling the truth AND the one-click reload the
// user was being offered silently became a sync.

test('a quiet cycle cannot repaint the chip out of the reload state', () => {
  const painted = [];
  const paint = createIndicatorPainter((state, detail) => painted.push([state, detail]));

  paint('syncing');
  paint('reload', 'Revision 3 — +1 game');
  paint('syncing');                       // the debounced second cycle starts
  paint('synced', 'Revision 3');          // ...and finds nothing to do

  assert.deepEqual(painted.map(p => p[0]), ['syncing', 'reload', 'reload', 'reload']);
  // The tooltip keeps the delta that earned the reload, not the empty later one.
  assert.equal(painted[3][1], 'Revision 3 — +1 game');
});

test('a later cycle that brings MORE changes keeps reload and updates the detail', () => {
  const painted = [];
  const paint = createIndicatorPainter((state, detail) => painted.push([state, detail]));

  paint('reload', 'Revision 3 — +1 game');
  paint('reload', 'Revision 4 — +2 lists');

  assert.deepEqual(painted[1], ['reload', 'Revision 4 — +2 lists']);
});

test('errors still show through a pending reload, and it survives them', () => {
  const painted = [];
  const paint = createIndicatorPainter((state, detail) => painted.push([state, detail]));

  paint('reload', 'Revision 3 — +1 game');
  paint('offline', 'Network error');      // must be visible, not swallowed
  paint('conflict', 'Could not settle');
  paint('synced', 'Revision 3');          // back to quiet -> reload returns

  assert.deepEqual(painted.map(p => p[0]), ['reload', 'offline', 'conflict', 'reload']);
});

test('before any reload, every state paints exactly as given', () => {
  const painted = [];
  const paint = createIndicatorPainter((state, detail) => painted.push([state, detail]));

  for (const state of ['idle', 'syncing', 'synced', 'offline', 'conflict', 'unconfigured']) {
    paint(state, `d-${state}`);
  }
  assert.deepEqual(painted.map(p => p[0]),
    ['idle', 'syncing', 'synced', 'offline', 'conflict', 'unconfigured']);
  assert.deepEqual(painted.map(p => p[1]),
    ['d-idle', 'd-syncing', 'd-synced', 'd-offline', 'd-conflict', 'd-unconfigured']);
});

// --- a grandfathered http endpoint keeps leaking the key --------------------
//
// isAllowedEndpoint is a save-time check, so an endpoint stored before it
// existed still sends X-Sync-Key in cleartext on every cycle. Warn rather than
// block: refusing to sync would break a working install to punish a setting the
// user cannot see.

test('an http endpoint is called out in the chip detail', () => {
  const detail = decorateDetail('Revision 7', 'http://trippixn.com/api/psnppp');
  assert.match(detail, /not https|unencrypted/i);
  assert.match(detail, /Revision 7/, 'the real detail must survive the warning');
});

test('an https or loopback endpoint adds no warning at all', () => {
  assert.equal(decorateDetail('Revision 7', 'https://trippixn.com/api/psnppp'), 'Revision 7');
  assert.equal(decorateDetail('Revision 7', 'http://127.0.0.1:8091/api'), 'Revision 7');
});

test('the warning still appears when there is no other detail to show', () => {
  const detail = decorateDetail('', 'http://trippixn.com/api/psnppp');
  assert.match(detail, /unencrypted/i);
  assert.doesNotMatch(detail, /^\s|undefined/);
});

// --- the settings menu exposes the history ----------------------------------

test('the settings menu offers the sync history and prints the recorded entries', async () => {
  installFakeGM();
  const storage = fakeStorage();
  writeLists(storage, [list('current', 'Current')]);
  try {
    await recordSync({ revision: 11, delta: delta({ gamesAdded: 2 }) }, 1000);
    await recordSync({ revision: 12, delta: delta({ listsRemoved: 1 }) }, 2000);

    const fake = installFakeWindow(storage, { prompts: ['3'] });
    try {
      await openSettings();
    } finally {
      uninstallFakeWindow();
    }

    // The menu itself must advertise the option, or it does not exist.
    assert.match(fake.promptCalls[0].message, /3 —/);
    assert.equal(fake.alerts.length, 1);
    const shown = fake.alerts[0];
    assert.match(shown, /12/, 'the newest revision must be listed');
    assert.match(shown, /11/, 'and the older one too');
    assert.match(shown, /2 games/);
    assert.match(shown, /1 list\b/);
    // Reading history must not touch the lists.
    assert.deepEqual(readLists(storage).map(l => l.id), ['current']);
  } finally {
    uninstallFakeGM();
  }
});

test('an empty history says so rather than showing a blank box', async () => {
  installFakeGM();
  const storage = fakeStorage();
  writeLists(storage, [list('current', 'Current')]);
  try {
    const fake = installFakeWindow(storage, { prompts: ['3'] });
    try {
      await openSettings();
    } finally {
      uninstallFakeWindow();
    }
    assert.equal(fake.alerts.length, 1);
    assert.match(fake.alerts[0], /no sync/i);
  } finally {
    uninstallFakeGM();
  }
});

test('the restore flow still works now that the menu has three options', async () => {
  // The menu's numbering is the only thing standing between "restore a backup"
  // and "show me a log", and one of them overwrites the user's lists.
  installFakeGM();
  const storage = fakeStorage();
  writeLists(storage, [list('current', 'Current')]);
  try {
    await saveBackup([list('backup-1', 'Backup One')], 1000);
    const fake = installFakeWindow(storage, { prompts: ['2', '1'], confirms: [true] });
    try {
      await openSettings();
    } finally {
      uninstallFakeWindow();
    }
    assert.deepEqual(readLists(storage).map(l => l.id), ['backup-1']);
    assert.equal(fake.alerts.some(a => /failed/i.test(a)), false, fake.alerts.join(' | '));
  } finally {
    uninstallFakeGM();
  }
});
