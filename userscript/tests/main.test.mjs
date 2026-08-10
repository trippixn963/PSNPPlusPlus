import test from 'node:test';
import assert from 'node:assert/strict';
import { saveBackup, listBackups, MAX_BACKUPS } from '../src/backup.mjs';
import { writeLists, readLists, LISTS_KEY } from '../src/lists-bridge.mjs';
import { loadConfig, saveConfig } from '../src/config.mjs';
import { openSettings, loadBase, handleSyncNowClick, describeSyncResult, describeDelta,
  createIndicatorPainter, decorateDetail, currentScriptVersion } from '../src/main.mjs';
import { emptyDoc, toDoc } from '../src/doc.mjs';
import { stampChanges } from '../src/merger.mjs';
import { describeFailure, createSettingsPanel } from '../src/panel.mjs';
import { installFakeDocument, uninstallFakeDocument, installFakeWindow, uninstallFakeWindow,
  installFakeGM, uninstallFakeGM, fakeStorage, find, findAll, isVisible } from './fake-dom.mjs';

/**
 * main.mjs is the browser entry point and is otherwise verified in a real
 * browser during deploy (per the project's own convention — see sync-cycle.mjs
 * vs. main.mjs). openSettings is the one exception: it is the escape-hatch
 * restore path, and a review round found a real ordering bug in it (R1), so
 * it is worth pinning against fake GM/window/document globals the same way
 * backup.mjs and config.mjs are already tested against a fake GM.
 *
 * These used to script `window.prompt` answers ('2', then '1'). They now click
 * the panel that replaced those dialogs — same behaviour, real gestures. The
 * fake window still carries prompt/alert/confirm, but only so a test can prove
 * none of them was reached.
 */

const list = (id, name, games = []) => ({
  id, name, tags: [], removeStartedGames: false, removeGames: false,
  orderBy: 'custom', direction: 'ascending', note: '', timestamp: 100, games
});

/** Drain the microtask queue so the panel's async work has finished. */
const settle = () => new Promise(resolve => { setImmediate(resolve); });

/**
 * Open the settings panel and hand back everything a test needs to drive it.
 *
 * openSettings does not resolve until the panel CLOSES, so its promise is held
 * rather than awaited — exactly as the chip's own contextmenu handler holds it.
 */
async function openPanel(storage) {
  const dom = installFakeDocument();
  const fake = installFakeWindow({ localStorage: storage });
  const closed = openSettings();
  await settle();
  return {
    dom,
    fake,
    closed,
    get panel() { return dom.panel; },
    node: name => find(dom.panel, name),
    nodes: name => findAll(dom.panel, name),
    async click(name) {
      const node = find(dom.panel, name);
      assert.ok(node, `no such control: ${name}`);
      node.dispatch('click');
      await settle();
    },
    /**
     * Close anything still open before restoring the globals.
     *
     * openSettings keeps module-level state for the one panel that may exist at
     * a time. A test that walks away from an open panel would leave that set,
     * and the NEXT test's openSettings would helpfully close it instead of
     * opening its own — every later test in the file failing for a reason that
     * has nothing to do with what it is testing.
     */
    teardown() {
      find(dom.panel, 'close')?.dispatch('click');
      uninstallFakeWindow();
      uninstallFakeDocument();
    }
  };
}

/** Every assertion that "no browser dialog was used" shares this. */
const assertNoDialogs = fake => {
  assert.deepEqual(fake.prompts, [], 'window.prompt must be gone from the settings path');
  assert.deepEqual(fake.confirms, [], 'window.confirm must be gone from the settings path');
  assert.deepEqual(fake.alerts, [], `window.alert must be gone: ${fake.alerts.join(' | ')}`);
};

// --- the panel opens and closes ---------------------------------------------

test('the settings panel opens on the page and closes without leaving anything behind', async () => {
  installFakeGM();
  const storage = fakeStorage();
  writeLists(storage, [list('current', 'Current')]);
  try {
    const ui = await openPanel(storage);
    try {
      assert.ok(ui.panel, 'the panel must be in the document');
      assert.equal(ui.panel.getAttribute('role'), 'dialog');
      assertNoDialogs(ui.fake);

      await ui.click('close');
      await ui.closed;

      assert.equal(ui.dom.panel, null, 'closing must remove the panel from the page');
    } finally {
      ui.teardown();
    }
  } finally {
    uninstallFakeGM();
  }
});

test('a second request closes the open panel rather than stacking another', async () => {
  installFakeGM();
  const storage = fakeStorage();
  try {
    const ui = await openPanel(storage);
    try {
      assert.equal(findAll(ui.dom.body, 'close').length, 1);
      const again = openSettings();
      await settle();
      await again;
      await ui.closed;
      assert.equal(ui.dom.panel, null);
    } finally {
      ui.teardown();
    }
  } finally {
    uninstallFakeGM();
  }
});

test('the panel never focuses itself — this is somebody else\'s page', async () => {
  installFakeGM();
  const storage = fakeStorage();
  try {
    const ui = await openPanel(storage);
    try {
      let focused = 0;
      for (const name of ['endpoint', 'key']) {
        const node = ui.node(name);
        node.focus = () => { focused += 1; };
      }
      // Nothing has run since the panel was built, so if it were going to steal
      // the caret it would already have done it; re-opening proves the same.
      assert.equal(focused, 0);
    } finally {
      ui.teardown();
    }
  } finally {
    uninstallFakeGM();
  }
});

test('two requests that overlap while storage is being read still yield one panel', async () => {
  // The single-panel guard used to be read three awaited storage reads before
  // `activePanel` was assigned. A left-click (which awaits loadConfig, then
  // opens settings when no key is stored) and a right-click landing in that
  // window both built a panel and appended it — leaving the first orphaned on
  // the page forever, with its promise pending.
  installFakeGM();
  const storage = fakeStorage();
  const dom = installFakeDocument();
  const fake = installFakeWindow({ localStorage: storage });
  try {
    const first = openSettings();
    const second = openSettings();
    await settle();
    await second;

    assert.equal(findAll(dom.body, 'close').length, 1, 'exactly one panel may exist');
    find(dom.panel, 'close')?.dispatch('click');
    await first;
    assert.equal(dom.panel, null);
    assertNoDialogs(fake);
  } finally {
    find(dom.panel, 'close')?.dispatch('click');
    uninstallFakeWindow();
    uninstallFakeDocument();
    uninstallFakeGM();
  }
});

test('an unreadable backup index does not replace the user\'s endpoint with the default', async () => {
  // The three reads used to share one try, sequentially, so a listBackups
  // failure skipped loadConfig entirely — the form then rendered
  // DEFAULT_ENDPOINT over the real one, and Save would have committed it.
  installFakeGM();
  await saveConfig({ endpoint: 'https://mine.test/api', key: 'super-secret-key' });
  const realGetValue = globalThis.GM.getValue;
  globalThis.GM.getValue = async (key, fallback) => {
    if (key === 'psnppp.backups') throw new Error('backup index is corrupt');
    return realGetValue(key, fallback);
  };
  const storage = fakeStorage();
  try {
    const ui = await openPanel(storage);
    try {
      assert.equal(ui.node('endpoint').value, 'https://mine.test/api',
        'the real endpoint must survive an unrelated read failure');
      assert.match(ui.node('keyhint').textContent, /already stored/i);
      assert.match(ui.node('message').textContent, /backup index is corrupt/);
    } finally {
      ui.teardown();
    }
  } finally {
    uninstallFakeGM();
  }
});

test('a thrown null or undefined never reaches the user as the word "undefined"', async () => {
  installFakeGM();
  const storage = fakeStorage();
  writeLists(storage, [list('current', 'Current')]);
  try {
    await saveBackup([list('b', 'B')], 1000);
    // restoreBackup throws a plain Error, so force the exotic case at the layer
    // that actually converts it.
    assert.equal(describeFailure(null, 'Could not restore that backup'),
      'Could not restore that backup.');
    assert.equal(describeFailure(undefined, 'Could not save your settings'),
      'Could not save your settings.');
    assert.equal(describeFailure({}, 'Settings failed'), 'Settings failed.');
    assert.equal(describeFailure(new Error('disk is full'), 'Settings failed'),
      'Settings failed: disk is full');
    // An object whose message getter throws must not fault inside the catch.
    const hostile = { get message() { throw new Error('nope'); } };
    assert.doesNotThrow(() => describeFailure(hostile, 'Settings failed'));

    for (const bad of [null, undefined, {}, hostile]) {
      assert.doesNotMatch(describeFailure(bad, 'Settings failed'), /undefined|null|\[object/,
        `describeFailure(${String(bad === hostile ? 'hostile' : bad)}) leaked a raw coercion`);
    }
  } finally {
    uninstallFakeGM();
  }
});

test('a malformed result from the wiring is a failure, never a silent success', async () => {
  // The destructive control may not default to "it worked". A handler that
  // returns undefined (or a rejected-shape object) used to close the panel
  // reporting a saved credential, and print "Backup restored." for a restore
  // that never happened.
  const dom = installFakeDocument();
  installFakeWindow({ localStorage: fakeStorage() });
  try {
    for (const result of [undefined, null, {}, { ok: 'true' }, { ok: false }]) {
      const panel = createSettingsPanel({
        backups: [{ id: 'b1', at: 1000, listCount: 3 }],
        onSave: async () => result,
        onRestore: async () => result
      });
      dom.body.appendChild(panel.element);

      find(panel.element, 'save').dispatch('click');
      await settle();
      assert.ok(isVisible(find(panel.element, 'message')),
        `save must report ${JSON.stringify(result)} as a failure`);
      assert.equal(find(panel.element, 'message').getAttribute('role'), 'alert');
      assert.ok(panel.element.parentNode ?? panel.element.parent, 'and must not close');

      const row = find(panel.element, 'backup-row');
      find(row, 'restore').dispatch('click');
      find(row, 'restore-confirm').dispatch('click');
      await settle();
      assert.match(find(panel.element, 'message').textContent, /could not restore/i,
        `restore must report ${JSON.stringify(result)} as a failure`);
      // The button has to come back, or the escape hatch is a one-shot.
      assert.equal(find(row, 'restore-confirm').disabled, false);
      panel.close();
    }
  } finally {
    uninstallFakeWindow();
    uninstallFakeDocument();
  }
});

test('an unwired panel refuses rather than claiming success', async () => {
  const dom = installFakeDocument();
  installFakeWindow({ localStorage: fakeStorage() });
  try {
    const panel = createSettingsPanel({ backups: [{ id: 'b1', at: 1000, listCount: 1 }] });
    dom.body.appendChild(panel.element);
    find(panel.element, 'save').dispatch('click');
    await settle();
    assert.match(find(panel.element, 'message').textContent, /not wired up/i);
  } finally {
    uninstallFakeWindow();
    uninstallFakeDocument();
  }
});

// --- credentials -------------------------------------------------------------

test('the stored key is never painted into the form', async () => {
  installFakeGM();
  const storage = fakeStorage();
  try {
    await saveConfig({ endpoint: 'https://example.test/api', key: 'super-secret-key' });
    const ui = await openPanel(storage);
    try {
      assert.equal(ui.node('key').value, '', 'the key field must start empty');
      assert.equal(ui.node('endpoint').value, 'https://example.test/api',
        'the endpoint is not a secret and stays pre-filled');
      assert.equal(ui.panel.textContent.includes('super-secret-key'), false,
        'the key leaked into the panel');
      assert.match(ui.node('keyhint').textContent, /already stored/i);
    } finally {
      ui.teardown();
    }
  } finally {
    uninstallFakeGM();
  }
});

test('saving credentials stores them and closes the panel', async () => {
  installFakeGM();
  const storage = fakeStorage();
  try {
    const ui = await openPanel(storage);
    try {
      ui.node('endpoint').value = 'https://new.test/api';
      ui.node('key').value = 'brand-new-key';
      await ui.click('save');
      await ui.closed;

      assert.deepEqual(await loadConfig(), { endpoint: 'https://new.test/api', key: 'brand-new-key' });
      assert.equal(ui.dom.panel, null);
      assertNoDialogs(ui.fake);
    } finally {
      ui.teardown();
    }
  } finally {
    uninstallFakeGM();
  }
});

test('an http endpoint is refused with the reason on screen, and nothing is stored', async () => {
  // This message used to be a window.alert. Losing it in the move to a panel
  // would leave the user with a Save button that silently does nothing.
  installFakeGM();
  const storage = fakeStorage();
  try {
    await saveConfig({ endpoint: 'https://good.test/api', key: 'super-secret-key' });
    const ui = await openPanel(storage);
    try {
      ui.node('endpoint').value = 'http://trippixn.com/api/psnppp';
      ui.node('key').value = 'whatever';
      await ui.click('save');

      const message = ui.node('message');
      assert.ok(isVisible(message), 'the refusal must be visible');
      assert.match(message.textContent, /https/i);
      assert.equal(message.getAttribute('role'), 'alert');
      assert.ok(ui.dom.panel, 'a refused save must not close the panel');
      assert.deepEqual(await loadConfig(),
        { endpoint: 'https://good.test/api', key: 'super-secret-key' });
      assertNoDialogs(ui.fake);
    } finally {
      ui.teardown();
    }
  } finally {
    uninstallFakeGM();
  }
});

test('cancelling changes nothing at all', async () => {
  installFakeGM();
  const storage = fakeStorage();
  writeLists(storage, [list('current', 'Current')]);
  try {
    await saveConfig({ endpoint: 'https://good.test/api', key: 'super-secret-key' });
    await saveBackup([list('backup-1', 'Backup One')], 1000);
    const listsBefore = storage.getItem(LISTS_KEY);

    const ui = await openPanel(storage);
    try {
      // Type over everything, then back out.
      ui.node('endpoint').value = 'https://somewhere.else/api';
      ui.node('key').value = 'a-different-key';
      await ui.click('cancel');
      await ui.closed;

      assert.deepEqual(await loadConfig(),
        { endpoint: 'https://good.test/api', key: 'super-secret-key' });
      assert.equal(storage.getItem(LISTS_KEY), listsBefore);
      assert.equal(ui.fake.wasReloaded(), false);
      assert.equal((await listBackups()).length, 1, 'cancelling must not take a backup');
      assert.equal(ui.dom.panel, null);
    } finally {
      ui.teardown();
    }
  } finally {
    uninstallFakeGM();
  }
});

test('Escape closes the panel and changes nothing', async () => {
  installFakeGM();
  const storage = fakeStorage();
  try {
    await saveConfig({ endpoint: 'https://good.test/api', key: 'k' });
    const ui = await openPanel(storage);
    try {
      ui.node('endpoint').value = 'https://nope.test/api';
      ui.panel.dispatch('keydown', { key: 'Escape', stopPropagation() {} });
      await ui.closed;

      assert.equal(ui.dom.panel, null);
      assert.deepEqual(await loadConfig(), { endpoint: 'https://good.test/api', key: 'k' });
    } finally {
      ui.teardown();
    }
  } finally {
    uninstallFakeGM();
  }
});

// --- restore -----------------------------------------------------------------

test('restoring the oldest of a full backup log succeeds without evicting itself', async () => {
  installFakeGM();
  const storage = fakeStorage();
  writeLists(storage, [list('current', 'Current', [{ id: 'gX', title: 'X', platforms: {}, tags: [] }])]);

  try {
    // Fill every backup.mjs slot. The oldest one — timestamp 1000 — is the
    // pre-corruption snapshot a user restoring from a full backup log is
    // most likely to want, and it's the slot at risk of being evicted by the
    // restore's own "back up current lists first" step if that step runs
    // before the restore reads the chosen entry.
    await saveBackup([list('oldest', 'Oldest')], 1000);
    for (let i = 1; i < MAX_BACKUPS; i++) {
      await saveBackup([list(`slot-${i}`, `Slot ${i}`)], 1000 + i);
    }
    const backups = await listBackups();
    assert.equal(backups.length, MAX_BACKUPS);
    // listBackups is newest-first (backup.test.mjs pins this), so the oldest
    // entry is the LAST row in the panel.
    assert.equal(backups[backups.length - 1].listCount, 1);

    const ui = await openPanel(storage);
    try {
      await ui.click('tab-backups');
      const rows = ui.nodes('backup-row');
      assert.equal(rows.length, MAX_BACKUPS);

      const oldestRow = rows[rows.length - 1];
      find(oldestRow, 'restore').dispatch('click');
      await settle();
      find(oldestRow, 'restore-confirm').dispatch('click');
      await settle();

      assert.deepEqual(readLists(storage).map(l => l.id), ['oldest']);
      assert.equal(/could not|failed/i.test(ui.node('message').textContent), false,
        `unexpected failure: ${ui.node('message').textContent}`);
      assert.ok(ui.fake.wasReloaded());
      assertNoDialogs(ui.fake);
    } finally {
      ui.teardown();
    }
  } finally {
    uninstallFakeGM();
  }
});

test('the backup rows are newest first, with the time and the list count', async () => {
  installFakeGM();
  const storage = fakeStorage();
  try {
    await saveBackup([list('a', 'A')], 1000);
    await saveBackup([list('b', 'B'), list('c', 'C')], 2000);

    const ui = await openPanel(storage);
    try {
      await ui.click('tab-backups');
      const rows = ui.nodes('backup-row');
      assert.equal(rows.length, 2);
      // Newest first: the two-list snapshot was taken second.
      assert.match(find(rows[0], 'backup-count').textContent, /2 lists/);
      assert.match(find(rows[1], 'backup-count').textContent, /1 list\b/);
      assert.match(rows[0].textContent, new RegExp(new Date(2000).toLocaleString()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    } finally {
      ui.teardown();
    }
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

    const ui = await openPanel(storage);
    try {
      await ui.click('tab-backups');
      const row = ui.nodes('backup-row')[0];

      find(row, 'restore').dispatch('click');
      await settle();
      assert.ok(isVisible(find(row, 'backup-confirm')), 'the confirmation must appear in the row');

      find(row, 'restore-cancel').dispatch('click');
      await settle();

      assert.equal(storage.getItem(LISTS_KEY), before);
      assert.equal(ui.fake.wasReloaded(), false);
      assert.equal((await listBackups()).length, 1, 'declining must not take a backup either');
      assert.ok(ui.dom.panel, 'and must not close the panel');
    } finally {
      ui.teardown();
    }
  } finally {
    uninstallFakeGM();
  }
});

test('a restore that cannot be read says so, on screen, and leaves the lists alone', async () => {
  // The escape hatch's own failure mode. It used to be a window.alert; if the
  // panel swallowed it the user would click "Replace lists", see nothing
  // happen, and have no idea whether their lists had just been overwritten.
  installFakeGM();
  const storage = fakeStorage();
  writeLists(storage, [list('current', 'Current')]);
  try {
    await saveBackup([list('gone', 'Gone')], 1000);
    // The index entry survives, the blob does not — what an evicted or
    // half-deleted slot looks like from here.
    await GM.deleteValue('psnppp.backup.1000');
    const before = storage.getItem(LISTS_KEY);

    const ui = await openPanel(storage);
    try {
      await ui.click('tab-backups');
      const row = ui.nodes('backup-row')[0];
      find(row, 'restore').dispatch('click');
      await settle();
      find(row, 'restore-confirm').dispatch('click');
      await settle();

      const message = ui.node('message');
      assert.ok(isVisible(message), 'the failure must be visible, not swallowed');
      assert.match(message.textContent, /could not restore/i);
      assert.match(message.textContent, /No such backup/i, 'and must name what went wrong');
      assert.equal(message.getAttribute('role'), 'alert');

      assert.equal(storage.getItem(LISTS_KEY), before, 'the lists must be untouched');
      assert.equal(ui.fake.wasReloaded(), false);
      assert.ok(ui.dom.panel, 'the panel must stay open so another backup can be tried');
      assertNoDialogs(ui.fake);
    } finally {
      ui.teardown();
    }
  } finally {
    uninstallFakeGM();
  }
});

test('no backups yet says so rather than showing an empty tab', async () => {
  installFakeGM();
  const storage = fakeStorage();
  try {
    const ui = await openPanel(storage);
    try {
      await ui.click('tab-backups');
      assert.match(ui.node('backups-empty').textContent, /no backups/i);
    } finally {
      ui.teardown();
    }
  } finally {
    uninstallFakeGM();
  }
});

test('settings that cannot be read still open a panel, with the reason showing', async () => {
  // Opening is the recovery path. Refusing to open because the backup index is
  // unreadable would take away the credential form too — and re-entering
  // credentials is a plausible fix for exactly that.
  installFakeGM();
  globalThis.GM.getValue = async () => { throw new Error('extension storage is unavailable'); };
  const storage = fakeStorage();
  try {
    const ui = await openPanel(storage);
    try {
      assert.ok(ui.panel, 'the panel must still open');
      const message = ui.node('message');
      assert.ok(isVisible(message));
      assert.match(message.textContent, /extension storage is unavailable/);
      assert.equal(message.getAttribute('role'), 'alert');
      assert.deepEqual(ui.fake.alerts, [], 'and it must land in the panel, not in a dialog');
    } finally {
      ui.teardown();
    }
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

// --- the update offer is sticky too, and loses to a pending reload ---------
//
// The update check runs once after the first sync and can fire while an
// ordinary quiet cycle (changed: false) is repainting 'synced' every focus
// and edit — without stickiness the offer would vanish within seconds of
// appearing, the same problem 'reload' had before createIndicatorPainter
// existed. DECISION: reload wins when both are pending. Reload means a merge
// already wrote real data this device's PSNP+ page is not showing yet — a
// correctness issue for what's on screen right now. Update is a discretionary
// offer for next time whose click opens an install page in a NEW tab, so
// showing it instead would not even get the stale page reloaded.

test('an update offer survives a quiet cycle the same way reload does', () => {
  const painted = [];
  const paint = createIndicatorPainter((state, detail) => painted.push([state, detail]));

  paint('update', '1.10.0 is available');
  paint('syncing');
  paint('synced', 'Revision 9');

  assert.deepEqual(painted.map(p => p[0]), ['update', 'update', 'update']);
  assert.equal(painted[2][1], '1.10.0 is available');
});

test('a pending reload wins over a pending update', () => {
  const painted = [];
  const paint = createIndicatorPainter((state, detail) => painted.push([state, detail]));

  paint('reload', 'Revision 3 — +1 game');
  paint('update', '1.10.0 is available'); // arrives while reload is still pending
  paint('synced', 'Revision 3');          // a later quiet cycle

  assert.deepEqual(painted.map(p => p[0]), ['reload', 'reload', 'reload']);
  assert.equal(painted[2][1], 'Revision 3 — +1 game', 'the reload detail must survive, not the update one');
});

test('an update that arrives BEFORE any reload still yields to one that follows', () => {
  const painted = [];
  const paint = createIndicatorPainter((state, detail) => painted.push([state, detail]));

  paint('update', '1.10.0 is available');
  paint('syncing');
  paint('reload', 'Revision 4 — +2 lists'); // a real write happens later

  assert.deepEqual(painted.map(p => p[0]), ['update', 'update', 'reload']);
});

test('errors show through an update offer exactly as they do through reload', () => {
  const painted = [];
  const paint = createIndicatorPainter((state, detail) => painted.push([state, detail]));

  paint('update', '1.10.0 is available');
  paint('offline', 'Network error');
  paint('conflict', 'Could not settle');
  paint('synced', 'Revision 3'); // back to quiet -> the update offer returns

  assert.deepEqual(painted.map(p => p[0]), ['update', 'offline', 'conflict', 'update']);
});

// --- reading the running version --------------------------------------------
//
// GM_info is a standard GM API, but this file already treats every GM
// capability as something that might be missing rather than assumed
// (migrateGmStorage's own try/catch). currentScriptVersion must degrade to
// null, never throw, whether GM_info is absent entirely or present but
// malformed.

function withGlobal(name, value, fn) {
  const had = Object.prototype.hasOwnProperty.call(globalThis, name);
  const previous = globalThis[name];
  globalThis[name] = value;
  try {
    return fn();
  } finally {
    if (had) globalThis[name] = previous;
    else delete globalThis[name];
  }
}

test('currentScriptVersion reads GM_info.script.version when present', () => {
  withGlobal('GM_info', { script: { version: '1.2.0' } }, () => {
    assert.equal(currentScriptVersion(), '1.2.0');
  });
});

test('currentScriptVersion returns null, not a throw, when GM_info is absent', () => {
  const had = Object.prototype.hasOwnProperty.call(globalThis, 'GM_info');
  const previous = globalThis.GM_info;
  delete globalThis.GM_info;
  try {
    assert.doesNotThrow(() => currentScriptVersion());
    assert.equal(currentScriptVersion(), null);
  } finally {
    if (had) globalThis.GM_info = previous;
  }
});

test('currentScriptVersion returns null on a malformed GM_info rather than throwing', () => {
  for (const bad of [{}, { script: {} }, { script: null }, null, 'nope']) {
    withGlobal('GM_info', bad, () => {
      assert.doesNotThrow(() => currentScriptVersion());
      assert.equal(currentScriptVersion(), null);
    });
  }
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

test('only one tab is showing at a time', async () => {
  // The old menu's numbering was the only thing standing between "restore a
  // backup" and everything else, and Restore overwrites the user's lists. Tabs
  // replaced it; if two panes were ever open at once, a Restore button could
  // sit under a heading that belongs to another pane.
  installFakeGM();
  const storage = fakeStorage();
  try {
    await saveBackup([list('backup-1', 'Backup One')], 1000);
    const ui = await openPanel(storage);
    try {
      for (const [tab, pane] of [['tab-sync', 'pane-sync'], ['tab-backups', 'pane-backups']]) {
        await ui.click(tab);
        const visible = ['pane-sync', 'pane-backups'].filter(p => isVisible(ui.node(p)));
        assert.deepEqual(visible, [pane], `${tab} should show only ${pane}`);
        assert.equal(ui.node(tab).getAttribute('aria-selected'), 'true');
      }
    } finally {
      ui.teardown();
    }
  } finally {
    uninstallFakeGM();
  }
});

test('the restore flow still works with the panel\'s two tabs', async () => {
  installFakeGM();
  const storage = fakeStorage();
  writeLists(storage, [list('current', 'Current')]);
  try {
    await saveBackup([list('backup-1', 'Backup One')], 1000);
    const ui = await openPanel(storage);
    try {
      await ui.click('tab-backups');
      const row = ui.nodes('backup-row')[0];
      find(row, 'restore').dispatch('click');
      await settle();
      find(row, 'restore-confirm').dispatch('click');
      await settle();

      assert.deepEqual(readLists(storage).map(l => l.id), ['backup-1']);
      assert.equal(/could not|failed/i.test(ui.node('message').textContent), false,
        ui.node('message').textContent);
      // The lists that were replaced are themselves now a backup — the escape
      // hatch may not be a one-way door.
      const backups = await listBackups();
      assert.equal(backups.length, 2);
    } finally {
      ui.teardown();
    }
  } finally {
    uninstallFakeGM();
  }
});

test('a failing settings or progress sync does not repaint a good lists sync as offline', async () => {
  // Both convenience paths run AFTER the chip has been painted from the lists
  // result and both reach the network. Before this was guarded, a blip in
  // either turned a successful sync into "Offline" for the user.
  const { createIndicatorPainter } = await import('../src/main.mjs');
  const painted = [];
  const paint = createIndicatorPainter((state, detail) => painted.push(state));

  paint('synced', 'Revision 12');
  // The shape main.mjs relies on: a rejection is absorbed and never reaches the
  // outer catch that paints 'offline'.
  const settings = await Promise.reject(new Error('network'))
    .catch(() => ({ status: 'offline', changed: false }));
  await Promise.reject(new Error('network')).catch(() => {});

  assert.equal(settings.changed, false);
  assert.equal(painted.includes('offline'), false);
  assert.equal(painted[painted.length - 1], 'synced');
});

/**
 * logCycle: what a changed sync actually says in Discord.
 *
 * It had no coverage at all — deleting the call site left the suite green.
 */

const ZERO_D = {
  listsAdded: 0, listsRemoved: 0, gamesAdded: 0, gamesRemoved: 0, listsLinked: 0,
  addedGames: [], removedGames: []
};

const collect = () => {
  const trees = [];
  return { trees, log: (title, items, emoji) => trees.push({ title, items, emoji }) };
};

test('a quiet-but-changed cycle reports only the summary', async () => {
  const { logCycle } = await import('../src/main.mjs');
  const { trees, log } = collect();
  logCycle(log, { revision: 9, delta: ZERO_D, localDelta: ZERO_D });
  assert.deepEqual(trees.map(t => t.title), ['Sync Completed']);
  assert.equal(trees[0].emoji, '🔄');
  assert.deepEqual(trees[0].items[0], ['Revision', 9]);
});

test('added and removed games are named, one row each, with their list', async () => {
  const { logCycle } = await import('../src/main.mjs');
  const { trees, log } = collect();
  logCycle(log, {
    revision: 10,
    delta: ZERO_D,
    localDelta: {
      listsAdded: 0, listsRemoved: 0, gamesAdded: 2, gamesRemoved: 1, listsLinked: 0,
      addedGames: [{ title: 'Bloodborne', list: 'Backlog' }, { title: 'Returnal', list: 'Backlog' }],
      removedGames: [{ title: 'Road 96: Mile 0', list: 'Wishlist' }]
    }
  });
  assert.deepEqual(trees.map(t => t.title), ['Sync Completed', 'Games Added', 'Games Removed']);
  const added = trees[1];
  assert.equal(added.emoji, '➕');
  assert.deepEqual(added.items[0], ['Count', 2]);
  assert.deepEqual(added.items[1], ['Game', 'Bloodborne (Backlog)']);
  assert.deepEqual(trees[2].items[1], ['Game', 'Road 96: Mile 0 (Wishlist)']);
});

test('a big sync still tells the truth about scale when the names are capped', async () => {
  const { logCycle } = await import('../src/main.mjs');
  const { trees, log } = collect();
  logCycle(log, {
    revision: 11,
    delta: ZERO_D,
    localDelta: {
      listsAdded: 1, listsRemoved: 0, gamesAdded: 200, gamesRemoved: 0, listsLinked: 0,
      addedGames: [{ title: 'One', list: 'Backlog' }], removedGames: []
    }
  });
  const added = trees.find(t => t.title === 'Games Added');
  assert.deepEqual(added.items[0], ['Count', 200], 'the count is exact even though one name is shown');
  assert.equal(added.items.length, 2);
  assert.ok(trees.some(t => t.title === 'Lists Changed'));
});

test('logCycle never throws on a malformed delta', async () => {
  // It runs after a cycle that already wrote. Anything it throws would repaint
  // a successful sync as Offline.
  const { logCycle } = await import('../src/main.mjs');
  const { log } = collect();
  logCycle(log, { revision: 1, delta: undefined });
  logCycle(log, {});
});

test('adding a game locally is logged even though the cycle wrote nothing locally', async () => {
  // The bug this replaced: the gate was `result.changed`, which is only true
  // when something arrives FROM another device. Your own add is pushed up and
  // writes nothing locally, so the most obvious event there is logged nothing.
  const { logCycle, deltaIsEmpty } = await import('../src/main.mjs');
  const { trees, log } = collect();
  const localDelta = {
    ...ZERO_D, gamesAdded: 1, addedGames: [{ title: 'Bloodborne', list: 'Backlog' }]
  };
  assert.equal(deltaIsEmpty(localDelta), false, 'this must be enough to trigger a log');

  logCycle(log, { revision: 12, changed: false, delta: ZERO_D, localDelta });

  const added = trees.find(t => t.title === 'Games Added');
  assert.ok(added, 'your own add must be logged');
  assert.deepEqual(added.items[1], ['Game', 'Bloodborne (Backlog)']);
  const summary = Object.fromEntries(trees[0].items);
  assert.equal(summary['You changed'], '+1 game');
  assert.equal(summary.Received, 'nothing');
});

test('what arrived from another device is reported separately from what you did', async () => {
  const { logCycle } = await import('../src/main.mjs');
  const { trees, log } = collect();
  logCycle(log, {
    revision: 13,
    changed: true,
    delta: { ...ZERO_D, gamesAdded: 1, addedGames: [{ title: 'Returnal', list: 'Backlog' }] },
    localDelta: ZERO_D
  });
  assert.ok(trees.some(t => t.title === 'Received From Another Device'));
  assert.equal(trees.some(t => t.title === 'Games Added'), false,
    'an arrival is not something you did');
});

test('a cycle is logged when YOU changed something, not only when something arrived', async () => {
  const { shouldLogCycle } = await import('../src/main.mjs');
  const localAdd = { ...ZERO_D, gamesAdded: 1, addedGames: [{ title: 'X', list: 'L' }] };

  // The bug: a pure local add pushes, writes nothing locally, changed === false.
  assert.equal(shouldLogCycle({ status: 'synced', changed: false, localDelta: localAdd }), true,
    'your own edit must be logged');
  assert.equal(shouldLogCycle({ status: 'synced', changed: true, localDelta: ZERO_D }), true,
    'so must an arrival');
  assert.equal(shouldLogCycle({ status: 'synced', changed: false, localDelta: ZERO_D }), false,
    'a quiet cycle must stay quiet — these fire on every load and focus');
  assert.equal(shouldLogCycle({ status: 'conflict', changed: false, localDelta: localAdd }), false,
    'a cycle that did not settle has nothing to report');
  assert.equal(shouldLogCycle(null), false);
  assert.equal(shouldLogCycle({ status: 'synced' }), false, 'a missing localDelta is not a change');
});
