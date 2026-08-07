import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyDoc, toDoc } from '../src/doc.mjs';
import { stampChanges } from '../src/merger.mjs';
import { readLists, writeLists, LISTS_KEY } from '../src/lists-bridge.mjs';
import { runSyncCycle } from '../src/sync-cycle.mjs';

const fakeStorage = (initial = {}) => {
  const data = { ...initial };
  return {
    getItem: key => (key in data ? data[key] : null),
    setItem: (key, value) => { data[key] = String(value); },
    removeItem: key => { delete data[key]; }
  };
};

const list = (id, name, games = [], over = {}) => ({
  id, name, tags: [], removeStartedGames: false, removeGames: false,
  orderBy: 'custom', direction: 'ascending', note: '', timestamp: 100, games, ...over
});
const game = id => ({ id, title: `Game ${id}`, platforms: { ps5: true }, tags: [] });
const gameTitled = (id, title) => ({ id, title, platforms: { ps5: true }, tags: [] });

/** Server stub holding one document. */
const fakeServer = (doc = emptyDoc(), revision = 0) => ({
  doc, revision,
  async getState() { return { revision: this.revision, updatedAt: 0, doc: this.doc }; },
  async putState(baseRevision, doc) {
    if (baseRevision !== this.revision) {
      return { ok: false, conflict: true, revision: this.revision, doc: this.doc };
    }
    this.doc = doc;
    this.revision += 1;
    return { ok: true, revision: this.revision };
  }
});

const harness = (storage, client, base = emptyDoc()) => {
  let saved = base;
  const backups = [];
  return {
    args: {
      storage, client,
      loadBase: async () => saved,
      saveBase: async doc => { saved = doc; },
      saveBackup: async lists => { backups.push(lists); },
      confirmAdoptions: async () => true,
      now: 1000
    },
    get base() { return saved; },
    backups
  };
};

test('first sync pushes local lists to an empty server', async () => {
  const storage = fakeStorage();
  writeLists(storage, [list('A', 'Wishlist', [game('g1')])]);
  const server = fakeServer();
  const h = harness(storage, server);

  const result = await runSyncCycle(h.args);
  assert.equal(result.status, 'synced');
  assert.equal(server.revision, 1);
  assert.deepEqual(Object.keys(server.doc.lists), ['A']);
});

test('a remote-only game lands in localStorage', async () => {
  const storage = fakeStorage();
  writeLists(storage, [list('A', 'Wishlist', [game('g1')])]);
  const server = fakeServer(stampChanges(emptyDoc(), toDoc([list('A', 'Wishlist', [game('g1'), game('g2')])]), 500), 1);

  await runSyncCycle(harness(storage, server).args);
  const games = readLists(storage)[0].games.map(g => g.id).sort();
  assert.deepEqual(games, ['g1', 'g2']);
});

test('remote lists in localStorage are never sent or disturbed', async () => {
  const storage = fakeStorage();
  writeLists(storage, [list('A', 'Wishlist'), list('R', 'Remote', [], { url: 'https://x/y.json' })]);
  const server = fakeServer();

  await runSyncCycle(harness(storage, server).args);
  assert.deepEqual(Object.keys(server.doc.lists), ['A']);
  const after = readLists(storage);
  assert.equal(after.find(l => l.id === 'R').url, 'https://x/y.json');
});

test('a same-named list adopts the server id on first sync', async () => {
  const storage = fakeStorage();
  writeLists(storage, [list('local-1', 'Wishlist', [game('g1')])]);
  const server = fakeServer(stampChanges(emptyDoc(), toDoc([list('remote-1', 'Wishlist', [game('g2')])]), 500), 1);

  await runSyncCycle(harness(storage, server).args);
  const after = readLists(storage);
  assert.deepEqual(after.map(l => l.id), ['remote-1']);
  assert.deepEqual(after[0].games.map(g => g.id).sort(), ['g1', 'g2']);
});

test('declining adoption leaves both lists separate', async () => {
  const storage = fakeStorage();
  writeLists(storage, [list('local-1', 'Wishlist')]);
  const server = fakeServer(stampChanges(emptyDoc(), toDoc([list('remote-1', 'Wishlist')]), 500), 1);
  const h = harness(storage, server);
  h.args.confirmAdoptions = async () => false;

  await runSyncCycle(h.args);
  assert.deepEqual(readLists(storage).map(l => l.id).sort(), ['local-1', 'remote-1']);
});

test('adoption reaches localStorage even when the content is identical', async () => {
  const storage = fakeStorage();
  writeLists(storage, [list('local-1', 'Wishlist', [game('g1')])]);
  const server = fakeServer(stampChanges(emptyDoc(), toDoc([list('remote-1', 'Wishlist', [game('g1')])]), 500), 1);

  await runSyncCycle(harness(storage, server).args);
  assert.deepEqual(readLists(storage).map(l => l.id), ['remote-1']);
});

test('a 409 is resolved by re-merging and retrying', async () => {
  const storage = fakeStorage();
  writeLists(storage, [list('A', 'Wishlist', [game('g1')])]);
  const server = fakeServer();
  const h = harness(storage, server);

  let firstCall = true;
  const realPut = server.putState.bind(server);
  server.putState = async (baseRevision, doc) => {
    if (firstCall) {
      // Someone else wrote between our pull and our push.
      firstCall = false;
      server.doc = stampChanges(emptyDoc(), toDoc([list('B', 'Backlog', [game('g9')])]), 400);
      server.revision = 5;
      return { ok: false, conflict: true, revision: 5, doc: server.doc };
    }
    return realPut(baseRevision, doc);
  };

  const result = await runSyncCycle(h.args);
  assert.equal(result.status, 'synced');
  assert.deepEqual(Object.keys(server.doc.lists).sort(), ['A', 'B']);
});

test('exhausting the retries reports a conflict without writing', async () => {
  const storage = fakeStorage();
  writeLists(storage, [list('A', 'Wishlist')]);
  const server = fakeServer();
  server.putState = async () => ({ ok: false, conflict: true, revision: 99, doc: emptyDoc() });

  const result = await runSyncCycle({ ...harness(storage, server).args, maxAttempts: 3 });
  assert.equal(result.status, 'conflict');
});

test('a backup is taken before the lists are rewritten', async () => {
  const storage = fakeStorage();
  writeLists(storage, [list('A', 'Wishlist', [game('g1')])]);
  const server = fakeServer(stampChanges(emptyDoc(), toDoc([list('A', 'Wishlist', [game('g1'), game('g2')])]), 500), 1);
  const h = harness(storage, server);

  await runSyncCycle(h.args);
  assert.equal(h.backups.length, 1);
  assert.deepEqual(h.backups[0][0].games.map(g => g.id), ['g1']);
});

test('an unchanged sync writes no backup', async () => {
  const storage = fakeStorage();
  writeLists(storage, [list('A', 'Wishlist', [game('g1')])]);
  const server = fakeServer();
  const h = harness(storage, server);

  await runSyncCycle(h.args);
  const before = h.backups.length;
  await runSyncCycle({ ...h.args, loadBase: async () => h.base });
  assert.equal(h.backups.length, before);
});

test('the base is advanced to the merged document', async () => {
  const storage = fakeStorage();
  writeLists(storage, [list('A', 'Wishlist', [game('g1')])]);
  const server = fakeServer();
  const h = harness(storage, server);

  await runSyncCycle(h.args);
  assert.deepEqual(Object.keys(h.base.lists), ['A']);
});

// --- Fix round 1: C1, C2, I1, I2 -------------------------------------------

test('a list converted to remote (📡) locally is not tombstoned or deleted from the server', async () => {
  const storage = fakeStorage();
  // A prior sync already settled list R onto the server, unmodified.
  const priorLocal = [list('R', 'Wishlist', [game('g1')])];
  const base = toDoc(priorLocal);
  const server = fakeServer(base, 1);
  const h = harness(storage, server, base);

  // The user opens PSNP+'s edit-list dialog and adds a URL: `updateList`
  // assigns `url` onto the EXISTING row, keeping the same id. R is now a
  // 📡 remote list on this device only.
  writeLists(storage, [list('R', 'Wishlist', [game('g1')], { url: 'https://x/y.json' })]);

  const result = await runSyncCycle(h.args);
  assert.equal(result.status, 'synced');
  // R must still exist on the server, alive, with its game intact — not
  // tombstoned just because this device stopped syncing it.
  assert.deepEqual(Object.keys(server.doc.lists), ['R']);
  assert.equal(server.doc.lists.R.deletedAt, null);
  assert.deepEqual(Object.keys(server.doc.lists.R.games), ['g1']);
});

test('a 409 retry re-merges against the fresh remote copy, not a stale re-stamp of the first attempt', async () => {
  const storage = fakeStorage();
  const baseLocal = [list('A', 'Wishlist', [gameTitled('g1', 'Old')])];
  const base = stampChanges(emptyDoc(), toDoc(baseLocal), 100);
  writeLists(storage, baseLocal); // local is unchanged from base

  const r0 = stampChanges(emptyDoc(), toDoc([list('A', 'Wishlist', [gameTitled('g1', 'R0-title')])]), 500);
  const server = fakeServer(r0, 1);
  const h = harness(storage, server, base);

  let firstCall = true;
  const realPut = server.putState.bind(server);
  server.putState = async (baseRevision, doc) => {
    if (firstCall) {
      firstCall = false;
      // Someone else's edit lands on the server between our pull and our push.
      server.doc = stampChanges(emptyDoc(), toDoc([list('A', 'Wishlist', [gameTitled('g1', 'R1-title')])]), 700);
      server.revision = 7;
      return { ok: false, conflict: true, revision: 7, doc: server.doc };
    }
    return realPut(baseRevision, doc);
  };

  const result = await runSyncCycle(h.args);
  assert.equal(result.status, 'synced');
  // A clean single-pass merge of unchanged-local against R1 picks R1's title —
  // not the R0 value the first (rejected) attempt would have re-stamped with
  // a fresh `now` and made look newer than R1's real 700.
  assert.equal(server.doc.lists.A.games.g1.title, 'R1-title');
  assert.equal(readLists(storage)[0].games[0].title, 'R1-title');
});

test('exhausted retries leave storage byte-identical and take no backups', async () => {
  const storage = fakeStorage();
  writeLists(storage, [list('A', 'Wishlist')]);
  const before = storage.getItem(LISTS_KEY);
  // The server holds a second list (B) this device has never seen, so every
  // attempt's merge genuinely differs from what is on disk — not a no-op.
  const server = fakeServer(toDoc([list('B', 'Backlog', [game('g9')])]), 1);
  server.putState = async () => ({ ok: false, conflict: true, revision: 1, doc: server.doc });
  const h = harness(storage, server);

  const result = await runSyncCycle({ ...h.args, maxAttempts: 3 });
  assert.equal(result.status, 'conflict');
  assert.equal(storage.getItem(LISTS_KEY), before);
  assert.equal(h.backups.length, 0);
});

test('changed truthfully reports whether storage bytes actually changed', async () => {
  const scenarios = [
    () => {
      const storage = fakeStorage();
      writeLists(storage, [list('A', 'Wishlist', [game('g1')])]);
      return { storage, args: harness(storage, fakeServer()).args };
    },
    () => {
      const storage = fakeStorage();
      writeLists(storage, [list('A', 'Wishlist', [game('g1')])]);
      const server = fakeServer(stampChanges(emptyDoc(), toDoc([list('A', 'Wishlist', [game('g1'), game('g2')])]), 500), 1);
      return { storage, args: harness(storage, server).args };
    },
    () => {
      const storage = fakeStorage();
      writeLists(storage, [list('A', 'Wishlist')]);
      const server = fakeServer(toDoc([list('B', 'Backlog', [game('g9')])]), 1);
      server.putState = async () => ({ ok: false, conflict: true, revision: 1, doc: server.doc });
      return { storage, args: { ...harness(storage, server).args, maxAttempts: 3 } };
    }
  ];

  for (const build of scenarios) {
    const { storage, args } = build();
    const before = storage.getItem(LISTS_KEY);
    const result = await runSyncCycle(args);
    const after = storage.getItem(LISTS_KEY);
    assert.equal(result.changed, before !== after,
      `changed=${result.changed} but storage ${before === after ? 'did not' : 'did'} change`);
  }
});

test('a confirmed adoption survives a 409 retry instead of being duplicated', async () => {
  const storage = fakeStorage();
  writeLists(storage, [list('local-1', 'Wishlist', [game('g1')])]);
  const server = fakeServer(stampChanges(emptyDoc(), toDoc([list('remote-1', 'Wishlist', [game('g2')])]), 500), 1);
  const h = harness(storage, server);

  let firstCall = true;
  const realPut = server.putState.bind(server);
  server.putState = async (baseRevision, doc) => {
    if (firstCall) {
      firstCall = false;
      // A transient conflict unrelated to this list's content — the server's
      // copy of remote-1 doesn't even change, only the revision does.
      server.doc = stampChanges(emptyDoc(), toDoc([list('remote-1', 'Wishlist', [game('g2')])]), 500);
      server.revision = 2;
      return { ok: false, conflict: true, revision: 2, doc: server.doc };
    }
    return realPut(baseRevision, doc);
  };

  const result = await runSyncCycle(h.args);
  assert.equal(result.status, 'synced');
  // The user already confirmed "link them" on attempt 1 — a 409 retry must not
  // silently revert to two separate "Wishlist" lists.
  assert.deepEqual(readLists(storage).map(l => l.id), ['remote-1']);
  assert.deepEqual(Object.keys(server.doc.lists), ['remote-1']);
  assert.deepEqual(readLists(storage)[0].games.map(g => g.id).sort(), ['g1', 'g2']);
});

// --- Fix round 3: one storage snapshot per attempt --------------------------
//
// `confirmAdoptions` is a blocking `window.confirm` in the browser: it can sit
// open for minutes while a second psnprofiles.com tab edits the same lists.
// Both tests below simulate that by having `confirmAdoptions` mutate storage
// before it returns.

test('a list that becomes 📡 while the adoption confirm is open is not tombstoned', async () => {
  const storage = fakeStorage();
  writeLists(storage, [list('F', 'Frozen', [game('g1')]), list('local-1', 'Wishlist')]);
  // F was already settled by an earlier sync (it is in base and on the server).
  const base = toDoc([list('F', 'Frozen', [game('g1')])]);
  const server = fakeServer(
    stampChanges(emptyDoc(), toDoc([list('F', 'Frozen', [game('g1')]), list('remote-1', 'Wishlist')]), 500),
    1
  );
  // "Wishlist" exists on both sides under different ids, so an adoption is
  // proposed and the confirm is actually reached.
  const h = harness(storage, server, base);
  h.args.confirmAdoptions = async () => {
    // Second tab, while the confirm is open: PSNP+'s edit-list dialog assigns
    // `url` onto F's existing row, so F becomes a 📡 remote list.
    writeLists(storage, [
      list('F', 'Frozen', [game('g1')], { url: 'https://x/y.json' }),
      list('local-1', 'Wishlist')
    ]);
    return true;
  };

  const result = await runSyncCycle(h.args);
  assert.equal(result.status, 'synced');
  // Freezing a list on one device must never delete it everywhere else.
  assert.equal(server.doc.lists.F.deletedAt, null);
  assert.deepEqual(Object.keys(server.doc.lists.F.games), ['g1']);
  assert.equal(readLists(storage).find(l => l.id === 'F').url, 'https://x/y.json');
});

test('a list that stops being 📡 while the adoption confirm is open survives locally', async () => {
  const storage = fakeStorage();
  writeLists(storage, [
    list('F', 'Frozen', [game('g1')], { url: 'https://x/y.json' }),
    list('local-1', 'Wishlist')
  ]);
  const server = fakeServer(stampChanges(emptyDoc(), toDoc([list('remote-1', 'Wishlist')]), 500), 1);
  const h = harness(storage, server);
  h.args.confirmAdoptions = async () => {
    // Second tab, while the confirm is open: the user clears F's url, so F is a
    // normal syncable list again.
    writeLists(storage, [list('F', 'Frozen', [game('g1')]), list('local-1', 'Wishlist')]);
    return true;
  };

  const result = await runSyncCycle(h.args);
  assert.equal(result.status, 'synced');
  assert.ok(readLists(storage).some(l => l.id === 'F'), 'F must not vanish from localStorage');

  // ...and the next cycle must not read "in base, missing from local" and
  // tombstone it server-wide either.
  const second = await runSyncCycle(h.args);
  assert.equal(second.status, 'synced');
  assert.equal(server.doc.lists.F?.deletedAt ?? null, null);
  assert.ok(readLists(storage).some(l => l.id === 'F'));
});

test('a storage write landing during the push is not overwritten by the stale merge', async () => {
  const storage = fakeStorage();
  writeLists(storage, [
    list('F', 'Frozen', [game('g1')], { url: 'https://x/y.json' }),
    list('A', 'Wishlist')
  ]);
  // The server holds a list this device has never seen, so the merge is a
  // genuine change to storage and the write path is actually reached.
  const server = fakeServer(toDoc([list('B', 'Backlog', [game('g9')])]), 1);
  const h = harness(storage, server);

  const realPut = server.putState.bind(server);
  server.putState = async (baseRevision, doc) => {
    // Second tab clears F's url while our push is in flight — after the
    // snapshot this attempt's merge was computed from.
    writeLists(storage, [list('F', 'Frozen', [game('g1')]), list('A', 'Wishlist')]);
    return realPut(baseRevision, doc);
  };

  const result = await runSyncCycle(h.args);
  assert.equal(result.status, 'synced');
  assert.equal(result.changed, false);
  assert.ok(readLists(storage).some(l => l.id === 'F'), 'F must not vanish from localStorage');
  assert.equal(h.backups.length, 0);
  // base must not advance past a write that never happened, or the next cycle
  // reads "in base, missing from local" and tombstones the difference.
  assert.deepEqual(Object.keys(h.base.lists), []);

  // The next cycle sees a consistent world and settles it.
  const second = await runSyncCycle(h.args);
  assert.equal(second.status, 'synced');
  assert.equal(server.doc.lists.F?.deletedAt ?? null, null);
  assert.deepEqual(readLists(storage).map(l => l.id).sort(), ['A', 'B', 'F']);
});

// --- Fix round 4: corrupt storage (P1) and unfreeze divergence (P2) ---------

test('unreadable psnpp-lists is corruption, not "everything was deleted here"', async () => {
  const storage = fakeStorage();
  const base = toDoc([list('A', 'Wishlist', [game('g1')]), list('C', 'Backlog', [game('g2')])]);
  const server = fakeServer(base, 1);
  const h = harness(storage, server, base);

  // A truncated quota write, storage corruption, or another script writing junk
  // to the key. readLists swallows the parse failure and returns [] — which,
  // against a populated base, reads as "the user deleted every list".
  storage.setItem(LISTS_KEY, '{ this is not json');

  const result = await runSyncCycle(h.args);
  assert.equal(result.status, 'corrupt');
  assert.equal(result.changed, false);
  assert.equal(server.revision, 1, 'nothing may be pushed from an unreadable local state');
  assert.equal(server.doc.lists.A.deletedAt, null);
  assert.equal(server.doc.lists.C.deletedAt, null);
  assert.equal(storage.getItem(LISTS_KEY), '{ this is not json', 'storage left as-is');
  assert.equal(h.backups.length, 0);
  assert.deepEqual(Object.keys(h.base.lists).sort(), ['A', 'C'], 'base must not advance');
});

test('an empty list array is a legitimate empty state, not corruption', async () => {
  const storage = fakeStorage();
  writeLists(storage, []);
  const server = fakeServer();
  const h = harness(storage, server);

  const result = await runSyncCycle(h.args);
  assert.equal(result.status, 'synced');
});

test('unfreezing a 📡 list that diverged from the server does not delete the difference', async () => {
  const storage = fakeStorage();
  // F is settled on the server with two games, under the server's name.
  const base = toDoc([list('F', 'Server Name', [game('g1'), game('g2')])]);
  const server = fakeServer(stampChanges(emptyDoc(), base, 500), 1);
  const h = harness(storage, server, base);

  // The user turns F into a 📡 remote list. PSNP+ repopulates the row from the
  // feed URL, so its content diverges from the server's copy.
  writeLists(storage, [list('F', 'Feed Name', [game('g1')], { url: 'https://x/y.json' })]);
  await runSyncCycle(h.args);
  assert.equal(server.doc.lists.F.deletedAt, null);

  // Later the user clears the url. F is syncable again, still holding only what
  // the feed left in it.
  writeLists(storage, [list('F', 'Feed Name', [game('g1')])]);
  const result = await runSyncCycle({ ...h.args, now: 5000 });
  assert.equal(result.status, 'synced');
  // The server's copy is not "missing from local" — this device simply was not
  // syncing F. Nothing it holds may be deleted server-wide.
  assert.deepEqual(Object.keys(server.doc.lists.F.games).sort(), ['g1', 'g2'], 'g2 must survive');
  assert.deepEqual(Object.keys(server.doc.lists.F.deletedGames), []);
  assert.deepEqual(readLists(storage)[0].games.map(g => g.id).sort(), ['g1', 'g2']);
});

test('a list deleted while frozen is deliberately NOT deleted server-wide (accepted tradeoff of keeping frozen lists out of base)', async () => {
  const storage = fakeStorage();
  const base = toDoc([list('F', 'Wishlist', [game('g1')])]);
  const server = fakeServer(stampChanges(emptyDoc(), base, 500), 1);
  const h = harness(storage, server, base);

  // F is frozen, and a cycle runs while it is frozen — which is what drops it
  // from base. That drop is what stops an unfreeze from deleting the server's
  // diverged content (see the previous test); this test pins what it costs.
  writeLists(storage, [list('F', 'Wishlist', [game('g1')], { url: 'https://x/y.json' })]);
  await runSyncCycle(h.args);
  assert.deepEqual(Object.keys(h.base.lists), [], 'frozen lists must not be in base');

  // Now the user deletes the 📡 row outright, while it is still frozen.
  writeLists(storage, []);
  const result = await runSyncCycle({ ...h.args, now: 6000 });
  assert.equal(result.status, 'synced');

  // THIS IS DELIBERATE, NOT A BUG. Frozen means excluded from sync entirely, so
  // this device has no standing to delete F anywhere else — it was not syncing
  // it. The alternative (keeping frozen lists in base so the delete
  // propagates) silently destroys diverged content on unfreeze, which is
  // unrecoverable; a deletion that does not propagate is not.
  assert.equal(server.doc.lists.F.deletedAt, null, 'the delete must NOT propagate');
  assert.deepEqual(Object.keys(server.doc.lists.F.games), ['g1']);

  // Visible consequence: the server still holds F, and this device no longer
  // has any record saying otherwise, so F comes back as an ordinary synced
  // list. Deleting it again now — unfrozen — does propagate normally.
  assert.deepEqual(readLists(storage).map(l => l.id), ['F']);
  assert.equal(readLists(storage)[0].url, undefined);
});

// --- Fix round 6: looksCorrupt must ask whether the bytes parsed -----------
//
// Round 4's guard byte-compared `raw.trim()` against a whitelist of "empty"
// spellings, which leaked in both directions. Each case below is a real byte
// sequence a browser can end up with.

/** A settled two-list world: base and server agree, storage is about to lie. */
const corruptionHarness = () => {
  const storage = fakeStorage();
  const base = toDoc([list('A', 'Wishlist', [game('g1')]), list('C', 'Backlog', [game('g2')])]);
  const server = fakeServer(base, 1);
  return { storage, server, h: harness(storage, server, base) };
};

const assertNothingDestroyed = (server, h, storage, raw) => {
  assert.equal(server.revision, 1, 'nothing may be pushed');
  assert.equal(server.doc.lists.A.deletedAt, null);
  assert.equal(server.doc.lists.C.deletedAt, null);
  assert.equal(storage.getItem(LISTS_KEY), raw, 'storage left as-is');
  assert.equal(h.backups.length, 0);
  assert.deepEqual(Object.keys(h.base.lists).sort(), ['A', 'C'], 'base must not advance');
};

test('an empty string does not parse and is corruption, not an empty state', async () => {
  const { storage, server, h } = corruptionHarness();
  storage.setItem(LISTS_KEY, '');

  const result = await runSyncCycle(h.args);
  assert.equal(result.status, 'corrupt');
  assertNothingDestroyed(server, h, storage, '');
});

test('a BOM-contaminated [] does not parse and is corruption', async () => {
  const { storage, server, h } = corruptionHarness();
  // U+FEFF is WhiteSpace, so String.prototype.trim removes it — but JSON.parse
  // rejects it. Any check that trims before comparing lets this straight through.
  storage.setItem(LISTS_KEY, '﻿[]');

  const result = await runSyncCycle(h.args);
  assert.equal(result.status, 'corrupt');
  assertNothingDestroyed(server, h, storage, '﻿[]');
});

test('an array of id-less objects is corruption, not a set of lists', async () => {
  const { storage, server, h } = corruptionHarness();
  // readLists only filters null/non-object, so `{}` survives as a "list" and
  // makes any emptiness test short-circuit. toDoc then keys it by its missing
  // id, i.e. under the literal string "undefined".
  storage.setItem(LISTS_KEY, '[{}]');

  const result = await runSyncCycle(h.args);
  assert.equal(result.status, 'corrupt');
  assertNothingDestroyed(server, h, storage, '[{}]');
  assert.equal(server.doc.lists.undefined, undefined, 'no list may be created under id "undefined"');
});

test('valid JSON spellings of an empty array still sync (no false positive)', async () => {
  for (const raw of ['[ ]', '[\n]', '[\n\n]']) {
    const storage = fakeStorage();
    storage.setItem(LISTS_KEY, raw);
    const server = fakeServer();
    const h = harness(storage, server);

    const result = await runSyncCycle(h.args);
    assert.equal(result.status, 'synced', `${JSON.stringify(raw)} is valid JSON for an empty list set`);
  }
});

// --- Pinned behavior (already correct; guard against regression) -----------

test('pinned: a throwing saveBackup leaves storage untouched', async () => {
  const storage = fakeStorage();
  writeLists(storage, [list('A', 'Wishlist', [game('g1')])]);
  const before = storage.getItem(LISTS_KEY);
  const server = fakeServer(stampChanges(emptyDoc(), toDoc([list('A', 'Wishlist', [game('g1'), game('g2')])]), 500), 1);
  const h = harness(storage, server);
  h.args.saveBackup = async () => { throw new Error('backup failed'); };

  await assert.rejects(() => runSyncCycle(h.args), /backup failed/);
  assert.equal(storage.getItem(LISTS_KEY), before);
});

test('pinned: a getState version failure leaves storage untouched', async () => {
  const storage = fakeStorage();
  writeLists(storage, [list('A', 'Wishlist', [game('g1')])]);
  const before = storage.getItem(LISTS_KEY);
  const server = fakeServer();
  server.getState = async () => { throw new Error('Unsupported document version: 2'); };
  const h = harness(storage, server);

  await assert.rejects(() => runSyncCycle(h.args), /Unsupported document version/);
  assert.equal(storage.getItem(LISTS_KEY), before);
});
