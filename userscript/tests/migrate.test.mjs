import test from 'node:test';
import assert from 'node:assert/strict';
import { migrateGmStorage, OLD_DEFAULT_ENDPOINT } from '../src/migrate.mjs';
import { DEFAULT_ENDPOINT, loadConfig } from '../src/config.mjs';
import { listBackups, restoreBackup, saveBackup, MAX_BACKUPS } from '../src/backup.mjs';
import { loadBase, start } from '../src/main.mjs';

/**
 * A fake GM.* backed by a Map.
 *
 * Deliberately the same shape as the one in backup.test.mjs/config.test.mjs, so
 * the migration is exercised through the very modules that read these keys in
 * production rather than against assertions about key names alone.
 */
function installFakeGM(initial = []) {
  const store = new Map(initial);
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

const BASE_DOC = { version: 1, lists: { 'list-1': { meta: { name: 'Wishlist' }, games: {} } } };

/** A fully populated pre-rename install: all four key families plus 3 blobs. */
function oldInstall({ endpoint = OLD_DEFAULT_ENDPOINT } = {}) {
  return [
    ['psnpsync.endpoint', endpoint],
    ['psnpsync.key', 'the-secret-key'],
    ['psnpsync.base', JSON.stringify(BASE_DOC)],
    ['psnpsync.backups', [
      { id: 'psnpsync.backup.3000', at: 3000, listCount: 3 },
      { id: 'psnpsync.backup.2000', at: 2000, listCount: 2 },
      { id: 'psnpsync.backup.1000', at: 1000, listCount: 1 }
    ]],
    ['psnpsync.backup.3000', JSON.stringify([{ id: 'c' }, { id: 'b' }, { id: 'a' }])],
    ['psnpsync.backup.2000', JSON.stringify([{ id: 'b' }, { id: 'a' }])],
    ['psnpsync.backup.1000', JSON.stringify([{ id: 'a' }])]
  ];
}

// --- Scenario 1: old keys populated -> new keys correct, old ones gone -------

test('migration moves all four key families and deletes every old name', async () => {
  const store = installFakeGM(oldInstall());
  try {
    const summary = await migrateGmStorage();
    assert.deepEqual(summary, { keys: 3, blobs: 3, endpointRewritten: true });

    // Read back through the real consumers, not by poking at key names.
    const config = await loadConfig();
    assert.equal(config.key, 'the-secret-key');
    assert.deepEqual(await loadBase(), BASE_DOC);

    // Not one psnpsync.* name may survive — a leftover is a value the user can
    // no longer reach and a second run would have to reason about.
    const leftovers = [...store.keys()].filter(k => k.startsWith('psnpsync.'));
    assert.deepEqual(leftovers, []);
  } finally {
    uninstallFakeGM();
  }
});

test('the backup index is rewritten and every blob it names survives', async () => {
  installFakeGM(oldInstall());
  try {
    await migrateGmStorage();

    const index = await listBackups();
    assert.deepEqual(
      index.map(entry => entry.id),
      ['psnppp.backup.3000', 'psnppp.backup.2000', 'psnppp.backup.1000']
    );
    // Order and the non-id fields must come through untouched: the restore menu
    // is rendered from `at` and `listCount`.
    assert.deepEqual(index.map(entry => entry.at), [3000, 2000, 1000]);
    assert.deepEqual(index.map(entry => entry.listCount), [3, 2, 1]);

    // restoreBackup must still work on EVERY entry — an index whose blobs did
    // not come across is a restore menu that lists data it cannot produce.
    assert.deepEqual(await restoreBackup(index[0].id), [{ id: 'c' }, { id: 'b' }, { id: 'a' }]);
    assert.deepEqual(await restoreBackup(index[1].id), [{ id: 'b' }, { id: 'a' }]);
    assert.deepEqual(await restoreBackup(index[2].id), [{ id: 'a' }]);
  } finally {
    uninstallFakeGM();
  }
});

test('a backup saved after the migration coexists with the migrated ones', async () => {
  installFakeGM(oldInstall());
  try {
    await migrateGmStorage();
    // The index is capped, so a new save evicts a migrated one. What must hold
    // is that every surviving entry is restorable — which proves the migrated
    // entries are shaped exactly like native ones.
    await saveBackup([{ id: 'd' }], 4000);
    await saveBackup([{ id: 'e' }], 5000);
    const index = await listBackups();
    assert.equal(index.length, MAX_BACKUPS);
    for (const entry of index) {
      await assert.doesNotReject(() => restoreBackup(entry.id));
    }
  } finally {
    uninstallFakeGM();
  }
});

// --- Scenario 2: already migrated -> untouched -------------------------------

test('a second run is a no-op and changes nothing', async () => {
  const store = installFakeGM(oldInstall());
  try {
    await migrateGmStorage();
    const after = new Map(store);

    const summary = await migrateGmStorage();
    assert.deepEqual(summary, { keys: 0, blobs: 0, endpointRewritten: false });
    assert.deepEqual([...store.entries()].sort(), [...after.entries()].sort());
  } finally {
    uninstallFakeGM();
  }
});

test('an already-migrated install with new-name values is left alone', async () => {
  const store = installFakeGM([
    ['psnppp.endpoint', 'https://my.host/api/psnppp'],
    ['psnppp.key', 'already-here'],
    ['psnppp.base', JSON.stringify(BASE_DOC)],
    ['psnppp.backups', [{ id: 'psnppp.backup.9000', at: 9000, listCount: 1 }]],
    ['psnppp.backup.9000', JSON.stringify([{ id: 'z' }])]
  ]);
  try {
    const before = new Map(store);
    const summary = await migrateGmStorage();
    assert.deepEqual(summary, { keys: 0, blobs: 0, endpointRewritten: false });
    assert.deepEqual([...store.entries()].sort(), [...before.entries()].sort());
  } finally {
    uninstallFakeGM();
  }
});

test('a new-name value wins over a stale old-name one, and the old name still goes', async () => {
  const store = installFakeGM([
    ['psnpsync.key', 'stale-old-key'],
    ['psnppp.key', 'current-key']
  ]);
  try {
    await migrateGmStorage();
    assert.equal((await loadConfig()).key, 'current-key');
    assert.equal(store.has('psnpsync.key'), false);
  } finally {
    uninstallFakeGM();
  }
});

// --- Scenario 3: fresh install -> clean no-op --------------------------------

test('a fresh install migrates nothing, writes nothing, and does not throw', async () => {
  const store = installFakeGM();
  try {
    const summary = await migrateGmStorage();
    assert.deepEqual(summary, { keys: 0, blobs: 0, endpointRewritten: false });
    // Not "no old keys" — NO keys at all. A no-op that leaves a stub behind
    // would make the next run take the already-migrated branch.
    assert.equal(store.size, 0);

    // And the install still behaves like a fresh one afterwards.
    assert.deepEqual(await loadConfig(), { endpoint: DEFAULT_ENDPOINT, key: '' });
    assert.deepEqual(await listBackups(), []);
    assert.deepEqual(await loadBase(), { version: 1, lists: {} });
  } finally {
    uninstallFakeGM();
  }
});

test('a partial old install migrates what exists without inventing the rest', async () => {
  const store = installFakeGM([['psnpsync.key', 'only-the-key']]);
  try {
    const summary = await migrateGmStorage();
    assert.deepEqual(summary, { keys: 1, blobs: 0, endpointRewritten: false });
    assert.equal((await loadConfig()).key, 'only-the-key');
    assert.equal((await loadConfig()).endpoint, DEFAULT_ENDPOINT);
    assert.deepEqual([...store.keys()], ['psnppp.key']);
  } finally {
    uninstallFakeGM();
  }
});

// --- Scenario 4: the endpoint rule ------------------------------------------

test('the old default endpoint is rewritten to the new default', async () => {
  installFakeGM([['psnpsync.endpoint', OLD_DEFAULT_ENDPOINT]]);
  try {
    await migrateGmStorage();
    assert.equal((await loadConfig()).endpoint, DEFAULT_ENDPOINT);
  } finally {
    uninstallFakeGM();
  }
});

test('the old default with a trailing slash is rewritten too', async () => {
  installFakeGM([['psnpsync.endpoint', `${OLD_DEFAULT_ENDPOINT}/`]]);
  try {
    await migrateGmStorage();
    assert.equal((await loadConfig()).endpoint, DEFAULT_ENDPOINT);
  } finally {
    uninstallFakeGM();
  }
});

test('a customised endpoint is carried over verbatim, never rewritten', async () => {
  installFakeGM([['psnpsync.endpoint', 'https://my.own.host/sync']]);
  try {
    const summary = await migrateGmStorage();
    assert.equal(summary.endpointRewritten, false);
    assert.equal((await loadConfig()).endpoint, 'https://my.own.host/sync');
  } finally {
    uninstallFakeGM();
  }
});

test('a stale old default under the NEW name is rewritten even with nothing to migrate', async () => {
  // Reachable without any migration: the endpoint was typed by hand from old
  // notes into a fresh install. It names a path that stops answering.
  installFakeGM([['psnppp.endpoint', OLD_DEFAULT_ENDPOINT]]);
  try {
    const summary = await migrateGmStorage();
    assert.deepEqual(summary, { keys: 0, blobs: 0, endpointRewritten: true });
    assert.equal((await loadConfig()).endpoint, DEFAULT_ENDPOINT);
  } finally {
    uninstallFakeGM();
  }
});

// --- Edge shapes -------------------------------------------------------------

test('an index entry whose blob is already missing keeps its rewritten id', async () => {
  installFakeGM([
    ['psnpsync.backups', [
      { id: 'psnpsync.backup.2000', at: 2000, listCount: 1 },
      { id: 'psnpsync.backup.1000', at: 1000, listCount: 1 }
    ]],
    ['psnpsync.backup.2000', JSON.stringify([{ id: 'a' }])]
    // psnpsync.backup.1000 is dangling — it was already unrestorable.
  ]);
  try {
    const summary = await migrateGmStorage();
    assert.equal(summary.blobs, 1);
    const index = await listBackups();
    assert.deepEqual(index.map(e => e.id), ['psnppp.backup.2000', 'psnppp.backup.1000']);
    await assert.doesNotReject(() => restoreBackup('psnppp.backup.2000'));
    // Unchanged behaviour for the entry that was already broken: it throws,
    // exactly as it did before the rename, rather than vanishing from the menu.
    await assert.rejects(() => restoreBackup('psnppp.backup.1000'));
  } finally {
    uninstallFakeGM();
  }
});

test('a malformed backup index does not throw and does not lose the other keys', async () => {
  const store = installFakeGM([
    ['psnpsync.key', 'k'],
    ['psnpsync.backups', 'not-an-array']
  ]);
  try {
    const summary = await migrateGmStorage();
    assert.equal(summary.blobs, 0);
    assert.equal((await loadConfig()).key, 'k');
    // The unusable index is left where it is rather than copied forward: it
    // would make listBackups return a string, which openSettings would render
    // as a menu of characters.
    assert.equal(store.get('psnpsync.backups'), 'not-an-array');
  } finally {
    uninstallFakeGM();
  }
});

test('an index entry with a foreign id is passed through untouched', async () => {
  installFakeGM([
    ['psnpsync.backups', [{ id: 'somebody.elses.backup.1', at: 1, listCount: 1 }]],
    ['somebody.elses.backup.1', JSON.stringify([{ id: 'a' }])]
  ]);
  try {
    const summary = await migrateGmStorage();
    assert.equal(summary.blobs, 0);
    assert.deepEqual((await listBackups()).map(e => e.id), ['somebody.elses.backup.1']);
    await assert.doesNotReject(() => restoreBackup('somebody.elses.backup.1'));
  } finally {
    uninstallFakeGM();
  }
});

// --- The wiring: start() must run the migration before anything reads storage -

/**
 * Enough of a browser for start() to get through one pass.
 *
 * Deliberately executed rather than asserted about by reading main.mjs's text:
 * a migration that is correct but never called is indistinguishable from no
 * migration at all, and that is precisely the failure this test exists to
 * catch. The timers are stubbed because watchLists installs a 2s setInterval
 * that start() gives no handle to — left real, it would hold the test runner's
 * event loop open forever.
 */
function installFakeBrowser(storage) {
  const el = () => {
    const node = {
      id: '', className: '', title: '', textContent: '', style: { cssText: '' },
      children: [], attrs: new Map(), addEventListener() {}
    };
    node.appendChild = child => { node.children.push(child); };
    node.setAttribute = (name, value) => { node.attrs.set(name, String(value)); };
    node.getAttribute = name => (node.attrs.has(name) ? node.attrs.get(name) : null);
    return node;
  };
  const attached = [];
  const styles = [];
  globalThis.document = {
    readyState: 'complete',
    visibilityState: 'visible',
    // The widget's scoped stylesheet goes here. Without a head it would fall
    // back to body and turn up in `attached` alongside the chip, which is what
    // every assertion below is counting.
    head: { appendChild: node => { styles.push(node); } },
    body: { appendChild: node => { attached.push(node); } },
    createElement: el,
    addEventListener() {}
  };
  globalThis.window = {
    localStorage: storage,
    addEventListener() {},
    prompt: () => null,
    confirm: () => false,
    alert() {},
    location: { reload() {} }
  };
  const realSetInterval = globalThis.setInterval;
  const realSetTimeout = globalThis.setTimeout;
  globalThis.setInterval = () => 0;
  globalThis.setTimeout = () => 0;
  const restore = () => {
    globalThis.setInterval = realSetInterval;
    globalThis.setTimeout = realSetTimeout;
    delete globalThis.document;
    delete globalThis.window;
  };
  restore.attached = attached;
  return restore;
}

test('start() migrates GM storage before it reads any of it', async () => {
  const store = installFakeGM(oldInstall());
  const storage = {
    getItem: () => null,
    setItem() {},
    removeItem() {}
  };
  const restore = installFakeBrowser(storage);
  try {
    // GM_xmlhttpRequest is absent, so the sync attempt start() fires at the end
    // fails and lands on the "offline" chip. That is fine and is the point:
    // start() must not reject, and the migration must already have happened by
    // then regardless of what the network did.
    await start();

    assert.deepEqual([...store.keys()].filter(k => k.startsWith('psnpsync.')), []);
    assert.equal((await loadConfig()).key, 'the-secret-key');
    assert.equal((await loadConfig()).endpoint, DEFAULT_ENDPOINT);
    assert.deepEqual(await loadBase(), BASE_DOC);
    assert.deepEqual(
      (await listBackups()).map(e => e.id),
      ['psnppp.backup.3000', 'psnppp.backup.2000', 'psnppp.backup.1000']
    );
    await assert.doesNotReject(() => restoreBackup('psnppp.backup.1000'));

    // PROTECTED BEHAVIOUR: sync() must never reject. It is called
    // fire-and-forget from the chip's click handler, the visibilitychange
    // listener and the end of start(), so a rejection becomes an unhandled
    // promise rejection and the chip sticks on "Syncing…" forever. Here
    // GM_xmlhttpRequest does not exist, so the request layer throws a
    // ReferenceError from inside sync() — and start() above still resolved.
    // The chip must have landed on a terminal state carrying the failure,
    // not been left mid-sync.
    const chip = restore.attached[0];
    assert.ok(chip, 'the status chip was never attached');
    // By class, not by index: the chip carries a tier rail and the sheen
    // alongside its label now, and an index would silently start asserting on
    // whichever decoration happened to be first.
    const label = chip.children.find(child => child.className === 'psnppp-label').textContent;
    assert.equal(label, 'Offline', `chip should have settled on Offline, got "${label}"`);
    // The detail branch of the title only renders when setState was given the
    // error text, so this pins that the failure reached the chip rather than
    // escaping as an unhandled rejection.
    assert.match(chip.title, /^PSNP\+\+ — .+\nClick to sync now/s);
  } finally {
    restore();
    uninstallFakeGM();
  }
});

test('start() still brings up the chip when the migration throws', async () => {
  // The migration is best-effort: GM storage that rejects mid-way must not cost
  // the user the status chip, the settings menu, and with it the restore menu.
  installFakeGM(oldInstall());
  let reads = 0;
  const realGetValue = globalThis.GM.getValue;
  globalThis.GM.getValue = async (key, fallback) => {
    reads += 1;
    if (reads === 2) throw new Error('storage exploded');
    return realGetValue(key, fallback);
  };
  let appended = 0;
  const storage = { getItem: () => null, setItem() {}, removeItem() {} };
  const restore = installFakeBrowser(storage);
  globalThis.document.body.appendChild = () => { appended += 1; };
  try {
    await assert.doesNotReject(() => start());
    assert.equal(appended, 1, 'the chip must still be attached');
  } finally {
    restore();
    uninstallFakeGM();
  }
});
