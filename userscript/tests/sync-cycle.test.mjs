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
  // Local carries a genuine edit of its own (g2), which is what gives this
  // cycle something to push and so makes the 409 reachable at all. It was
  // previously unchanged from base — but a cycle with nothing to send now skips
  // the push entirely, and this fake only injects its conflict from inside
  // putState, so the retry path was never entered and the test passed vacuously
  // on a cycle that never conflicted. g2 also does double duty: it must survive
  // the retry alongside the remote's newer title.
  writeLists(storage, [list('A', 'Wishlist', [gameTitled('g1', 'Old'), gameTitled('g2', 'Mine')])]);

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
  // A clean single-pass merge of local against R1 picks R1's title — not the R0
  // value the first (rejected) attempt would have re-stamped with a fresh `now`
  // and made look newer than R1's real 700.
  const titleOf = games => games.find(g => g.id === 'g1').title;
  assert.equal(server.doc.lists.A.games.g1.title, 'R1-title');
  assert.equal(titleOf(readLists(storage)[0].games), 'R1-title');
  // ...and the local edit that made the push necessary must not be lost to the retry.
  assert.deepEqual(readLists(storage)[0].games.map(g => g.id).sort(), ['g1', 'g2']);
  assert.deepEqual(Object.keys(server.doc.lists.A.games).sort(), ['g1', 'g2']);
});

test('a concurrent write we had nothing to push against arrives on the next cycle', async () => {
  // The unconditional PUT used to double as an accidental liveness probe: even
  // with nothing to say, it would 409 against a write that landed after our GET
  // and pull it in. Skipping the push gives that up — deliberately, and at no
  // risk to data. Verified by execution: the edit is DELAYED by one cycle, not
  // lost, which is the same thing that happens when the other device writes one
  // millisecond after a successful push. Syncs fire on load, focus and edit, so
  // the wait is bounded.
  const storage = fakeStorage();
  const settled = [list('A', 'Wishlist', [gameTitled('g1', 'Old')])];
  writeLists(storage, settled);
  const base = stampChanges(emptyDoc(), toDoc(settled), 100);
  const server = countingServer(
    stampChanges(emptyDoc(), toDoc([list('A', 'Wishlist', [gameTitled('g1', 'R0-title')])]), 500), 1
  );
  const h = harness(storage, server, base);

  await runSyncCycle({ ...h.args, now: 1000 });
  assert.equal(server.pushes, 0, 'nothing to say on the first cycle');
  assert.equal(readLists(storage)[0].games[0].title, 'R0-title');

  // Another device writes AFTER our GET — the window the old 409 used to catch.
  server.doc = stampChanges(emptyDoc(), toDoc([list('A', 'Wishlist', [gameTitled('g1', 'R1-title')])]), 700);
  server.revision = 7;

  const second = await runSyncCycle({ ...h.args, now: 2000 });
  assert.equal(second.changed, true);
  assert.equal(readLists(storage)[0].games[0].title, 'R1-title', 'the edit must arrive, not vanish');
  assert.equal(server.pushes, 0, 'and still without a pointless push');
  assert.equal(server.doc.lists.A.games.g1.title, 'R1-title', "the server's copy is untouched");
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
  // THE property this test exists for, unchanged: the merge computed from the
  // pre-write snapshot must never reach storage, because it would delete the
  // list that just stopped being 📡. What changed is what happens next — the
  // cycle used to give up here, stranding `base` a generation behind the push
  // it had just made (which resurrected deletions on the next cycle). It now
  // retries: fresh snapshot, re-merge against what it wrote, then settle. The
  // stale merge is still discarded; it is simply no longer the last word.
  const storage = fakeStorage();
  writeLists(storage, [
    list('F', 'Frozen', [game('g1')], { url: 'https://x/y.json' }),
    list('A', 'Wishlist')
  ]);
  // The server holds a list this device has never seen, so the merge is a
  // genuine change to storage and the write path is actually reached.
  const server = fakeServer(toDoc([list('B', 'Backlog', [game('g9')])]), 1);
  const h = harness(storage, server);

  let pushes = 0;
  const realPut = server.putState.bind(server);
  server.putState = async (baseRevision, doc) => {
    pushes += 1;
    // Second tab clears F's url while our FIRST push is in flight — after the
    // snapshot that attempt's merge was computed from. One write, so the retry
    // sees a stable world.
    if (pushes === 1) {
      writeLists(storage, [list('F', 'Frozen', [game('g1')]), list('A', 'Wishlist')]);
    }
    return realPut(baseRevision, doc);
  };

  const result = await runSyncCycle(h.args);
  assert.equal(result.status, 'synced');
  assert.ok(readLists(storage).some(l => l.id === 'F'), 'F must not vanish from localStorage');
  assert.equal(pushes, 2, 'the aborted attempt retried instead of returning');
  // The write that landed is the retry's, computed from the snapshot that
  // already contained the other tab's write — F is syncable now, and present.
  assert.equal(result.changed, true);
  assert.deepEqual(readLists(storage).map(l => l.id).sort(), ['A', 'B', 'F']);
  // The backup is a snapshot of what the write actually replaced, not of the
  // bytes the abandoned attempt had in hand.
  assert.equal(h.backups.length, 1);
  assert.deepEqual(h.backups[0].map(l => l.id).sort(), ['A', 'F']);
  // base may claim exactly what reached storage — no more (that would tombstone
  // the difference server-wide) and no less (that would resurrect it).
  assert.deepEqual(Object.keys(h.base.lists).sort(), ['A', 'B', 'F']);
  assert.deepEqual(Object.keys(h.base.lists).sort(), readLists(storage).map(l => l.id).sort());

  // ...and the settled world is stable: the next cycle has nothing to do and
  // F was never tombstoned.
  const second = await runSyncCycle(h.args);
  assert.equal(second.status, 'synced');
  assert.equal(second.changed, false);
  assert.equal(server.doc.lists.F?.deletedAt ?? null, null);
  assert.deepEqual(readLists(storage).map(l => l.id).sort(), ['A', 'B', 'F']);
});

// --- A CAS abort AFTER an accepted push must retry, not give up -------------
//
// The push is the point of no return: once the server has accepted the merge,
// this device HAS settled on it, and `base` has to say so. Returning from a CAS
// abort left `base` one generation behind the server. The next cycle then read
// every record the stale base did not know about as brand new and stamped it
// with a fresh `now` — which outranks a tombstone another device pushed in the
// meantime, so a game (or a whole list) deleted elsewhere came back everywhere.
//
// Reproduced end to end below with two devices and a revision-CAS server. It
// needs NO failure at all: the user simply saves an edit in PSNP+ while a sync
// is in flight, which is exactly what the CAS is watching for.
//
// The fix is to retry the attempt rather than return, so a fresh snapshot is
// re-merged against what was actually just written and the cycle reaches
// saveBase. The CAS itself is untouched — the stale merge is still abandoned,
// it is just no longer the end of the cycle.

/** Fires its callback exactly once: the user saves one edit, mid-cycle. */
const oneShot = fn => {
  let fired = false;
  return () => { if (!fired) { fired = true; fn(); } };
};

const addGame = (storage, id) => {
  const lists = readLists(storage);
  lists[0].games.push(game(id));
  writeLists(storage, lists);
};

const removeGame = (storage, id) => {
  const lists = readLists(storage);
  lists[0].games = lists[0].games.filter(g => g.id !== id);
  writeLists(storage, lists);
};

/**
 * Two devices, one server, one concurrent save.
 *
 * A adds game 77 and, in the same cycle, receives game 55 from B — so the
 * cycle both pushes AND has a local write to make, which is what puts the
 * saveBackup abort (path D) on the table at all. `abortDuring` picks which
 * await the user's save lands in.
 *
 * Game ids are numeric strings because PSNP game ids are, and a fixture that
 * did not match production data shape has already hidden a Critical here.
 */
async function casAbortAfterPush(abortDuring) {
  const server = fakeServer();
  const storageA = fakeStorage();
  writeLists(storageA, [list('L1', 'Backlog', [game('9000'), game('30')])]);
  const storageB = fakeStorage();
  const A = harness(storageA, server);
  const B = harness(storageB, server);
  const runA = (now, over = {}) => runSyncCycle({ ...A.args, now, ...over });
  const runB = now => runSyncCycle({ ...B.args, now });

  await runA(1000);                       // A publishes 9000, 30
  await runB(2000);                       // B receives them
  addGame(storageB, '55');
  await runB(3000);                       // the server gains 55

  addGame(storageA, '77');                // A's own new game
  const userSaves = oneShot(() => addGame(storageA, '88'));
  const over = abortDuring === 'push'
    ? {
      client: {
        getState: () => server.getState(),
        putState: async (revision, doc) => {
          const result = await server.putState(revision, doc);
          userSaves();                    // lands after the push, before the CAS
          return result;
        }
      }
    }
    : {
      saveBackup: async lists => {
        A.backups.push(lists);
        userSaves();                      // lands inside the backup await
      }
    };

  const cycle = await runA(4000, over);
  const baseAfter = A.base.lists.L1?.games ?? {};

  await runB(5000);                       // B receives 77
  const bSaw77 = (readLists(storageB)[0]?.games ?? []).some(g => g.id === '77');
  removeGame(storageB, '77');
  await runB(6000);                       // B deletes it — a tombstone is pushed

  await runA(7000);                       // A's next cycle: does it resurrect 77?
  await runB(8000);

  return {
    cycle,
    baseAfter,
    bSaw77,
    aLists: readLists(storageA),
    bGames: (readLists(storageB)[0]?.games ?? []).map(g => g.id),
    server
  };
}

test('C: a CAS abort DURING the push still settles base, so another device\'s deletion holds', async () => {
  const r = await casAbortAfterPush('push');

  assert.equal(r.cycle.status, 'synced');
  assert.ok(r.bSaw77, 'the scenario is only meaningful if 77 actually reached B');
  assert.ok(!r.bGames.includes('77'), '77 was deleted on B and must stay deleted');
  // ...and the mechanism that makes that true: base must know about the push it
  // made, or the next cycle re-stamps 77 with a fresh `now` that outranks B's
  // tombstone.
  assert.ok('77' in r.baseAfter, 'base must record the record the server accepted');
  assert.equal(r.server.doc.lists.L1.deletedGames['77'] != null, true,
    'the tombstone must survive on the server too');
  // ...and the edit the user made mid-cycle is not collateral damage.
  assert.deepEqual(r.aLists[0].games.map(g => g.id).sort(),
    ['30', '55', '88', '9000'], "A keeps its own concurrent edit and B's game");
  assert.deepEqual(r.bGames.sort(), ['30', '55', '88', '9000']);
});

test('D: a CAS abort during saveBackup still settles base, so another device\'s deletion holds', async () => {
  const r = await casAbortAfterPush('backup');

  assert.equal(r.cycle.status, 'synced');
  assert.ok(r.bSaw77, 'the scenario is only meaningful if 77 actually reached B');
  assert.ok(!r.bGames.includes('77'), '77 was deleted on B and must stay deleted');
  assert.ok('77' in r.baseAfter, 'base must record the record the server accepted');
  assert.equal(r.server.doc.lists.L1.deletedGames['77'] != null, true,
    'the tombstone must survive on the server too');
  assert.deepEqual(r.aLists[0].games.map(g => g.id).sort(),
    ['30', '55', '88', '9000'], "A keeps its own concurrent edit and B's game");
  assert.deepEqual(r.bGames.sort(), ['30', '55', '88', '9000']);
});

test('the retry is bounded — storage changing on every attempt exhausts maxAttempts and corrupts nothing', async () => {
  // A pathological second tab that writes during EVERY push. The retry must
  // not spin: it gets maxAttempts tries and then gives up, leaving the other
  // tab's write intact, base unadvanced, and a delta that claims nothing.
  const storage = fakeStorage();
  writeLists(storage, [list('L1', 'Backlog', [game('9000')])]);
  const server = fakeServer(toDoc([list('L2', 'Wishlist', [game('55')])]), 1);
  const h = harness(storage, server);

  let pushes = 0;
  const realPut = server.putState.bind(server);
  server.putState = async (revision, doc) => {
    pushes += 1;
    const result = await realPut(revision, doc);
    // A different write every time, so the snapshot is stale on every attempt.
    writeLists(storage, [list('L1', 'Backlog', [game('9000'), game(`x${pushes}`)])]);
    return result;
  };

  const result = await runSyncCycle({ ...h.args, maxAttempts: 3 });

  assert.equal(pushes, 3, 'exactly maxAttempts attempts, then stop');
  assert.equal(result.status, 'synced');
  assert.equal(result.changed, false, 'no write ever reached storage');
  assert.deepEqual(result.delta, ZERO);
  // The other tab's last write survives untouched, and base did not advance
  // past a write that never happened.
  assert.deepEqual(readLists(storage).map(l => l.id), ['L1']);
  assert.deepEqual(readLists(storage)[0].games.map(g => g.id).sort(), ['9000', 'x3']);
  assert.equal(h.base.lists.L1, undefined, 'base must not claim an abandoned write');
});

test('a retry that SKIPS its own push still owes base the push the cycle already made', async () => {
  // The debt is the CYCLE's, not the attempt's. Attempt 1 pushes and its CAS
  // aborts; attempt 2 re-merges to exactly what attempt 1 wrote, so it skips
  // the push — and if the flag that drives the retry were scoped to the
  // attempt it would read false there, return, and strand `base` a generation
  // behind a push that definitely happened. That is the original bug wearing a
  // different hat, and it is reachable: an external write touching only fields
  // toDoc ignores changes the raw bytes (aborting the CAS) without changing
  // the merge (so the push is skipped).
  const storage = fakeStorage();
  writeLists(storage, [list('A', 'Wishlist', [game('g1')])]);
  const server = fakeServer(toDoc([list('B', 'Backlog', [game('g9')])]), 1);
  const h = harness(storage, server);
  const withIgnoredField = value =>
    storage.setItem(LISTS_KEY,
      JSON.stringify([{ ...list('A', 'Wishlist', [game('g1')]), zzIgnoredByToDoc: value }]));

  let pushes = 0;
  const realPut = server.putState.bind(server);
  server.putState = async (revision, doc) => {
    pushes += 1;
    if (pushes === 1) withIgnoredField(1);       // aborts attempt 1's CAS
    return realPut(revision, doc);
  };
  let backups = 0;
  h.args.saveBackup = async () => {
    backups += 1;
    if (backups === 1) withIgnoredField(2);      // aborts attempt 2's CAS
  };

  const result = await runSyncCycle(h.args);

  assert.equal(pushes, 1, 'attempt 2 re-merged to the same document and skipped its push');
  assert.equal(result.status, 'synced');
  assert.equal(result.changed, true);
  assert.deepEqual(readLists(storage).map(l => l.id).sort(), ['A', 'B']);
  assert.deepEqual(Object.keys(h.base.lists).sort(), ['A', 'B'],
    'base must settle on the document the server accepted back in attempt 1');
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

// --- Final wave: a list that OMITS a meta field ----------------------------
//
// Every other fixture in this project supplies all 8 META_FIELDS. Real lists do
// not have to: PSNP+ carries `!= null` fallbacks for removeGames, orderBy and
// direction, and importList hands createList an arbitrary shape. doc.mjs copies
// all 8 unconditionally, so such a list gets `meta.removeGames = undefined`,
// while the base document is persisted with JSON.stringify, which drops the key
// outright. Any comparison that renders the two differently makes sameRecord
// false forever, and meta.updatedAt re-stamps to `now` on every single cycle.

/** A PSNP+ list with no `removeGames` key at all. */
const partialList = (id, name, games = []) => ({
  id, name, tags: [], removeStartedGames: false,
  orderBy: 'custom', direction: 'ascending', note: '', timestamp: 100, games
});

/** One device: its own storage and its own base, sharing a server. */
const device = (storage, server) => {
  let saved = emptyDoc();
  return {
    storage,
    // saveBase mirrors main.mjs, which persists the base with JSON.stringify.
    sync: now => runSyncCycle({
      storage, client: server,
      loadBase: async () => saved,
      saveBase: async doc => { saved = JSON.parse(JSON.stringify(doc)); },
      saveBackup: async () => {},
      confirmAdoptions: async () => true,
      now
    })
  };
};

test('a rename converges on a list that omits a meta field', async () => {
  const server = fakeServer();
  const sA = fakeStorage();
  const sB = fakeStorage();
  writeLists(sA, [partialList('A', 'Wishlist', [game('g1')])]);
  writeLists(sB, [partialList('A', 'Wishlist', [game('g1')])]);
  const A = device(sA, server);
  const B = device(sB, server);
  await A.sync(1000);
  await B.sync(1000);

  // The user renames the list on device A.
  writeLists(sA, [partialList('A', 'Backlog', [game('g1')])]);
  await A.sync(2000);
  await B.sync(3000);
  await A.sync(4000);
  await B.sync(5000);

  // With meta.updatedAt re-stamped to `now` every cycle, whichever device syncs
  // last always wins, so the two flip between 'Backlog' and 'Wishlist' forever.
  assert.equal(readLists(sA)[0].name, 'Backlog');
  assert.equal(readLists(sB)[0].name, 'Backlog', 'the rename must reach device B and stay');
  assert.equal(server.doc.lists.A.meta.name, 'Backlog');
});

test('a deleted list stays deleted when it omits a meta field', async () => {
  const server = fakeServer();
  const sA = fakeStorage();
  const sB = fakeStorage();
  writeLists(sA, [partialList('A', 'Wishlist', [game('g1')])]);
  writeLists(sB, [partialList('A', 'Wishlist', [game('g1')])]);
  const A = device(sA, server);
  const B = device(sB, server);
  await A.sync(1000);
  await B.sync(1000);

  // The user deletes the list on device A.
  writeLists(sA, []);
  await A.sync(2000);
  assert.equal(server.doc.lists.A.deletedAt, 2000);

  // B has not touched it. A perpetually re-stamped meta.updatedAt makes
  // latestActivity(B) beat the deletion, so B resurrects it — permanently, and
  // deleting it again just resurrects it again.
  await B.sync(3000);
  assert.deepEqual(readLists(sB).map(l => l.id), [], 'the deletion must reach device B');
  await A.sync(4000);
  assert.deepEqual(readLists(sA).map(l => l.id), [], 'and must not come back to device A');
  assert.equal(server.doc.lists.A.deletedAt, 2000, 'the tombstone must survive both cycles');
});

// --- Final wave: an ABSENT psnpp-lists key ---------------------------------
//
// PSNP+ never removes the key by ordinary use — deleting the last list writes
// `[]` (ListStorage.remove -> _save). Its "Clear" button does
// (clearData -> ListStorage.clear -> localStorage.removeItem), as does clearing
// site data for psnprofiles.com. The GM-stored base lives in extension storage
// and survives all of them, so "key gone, base populated" is a wipe, not a
// deletion — and reading it as a deletion tombstones every list server-wide
// while taking ZERO backups (both sides collapse to empty, so changed is false).

test('PSNP+ Clear (an absent key) against a populated base is corruption, not a server-wide delete', async () => {
  const { storage, server, h } = corruptionHarness();
  writeLists(storage, [list('A', 'Wishlist', [game('g1')]), list('C', 'Backlog', [game('g2')])]);
  storage.removeItem(LISTS_KEY);

  const result = await runSyncCycle(h.args);
  assert.equal(result.status, 'corrupt');
  assert.equal(result.changed, false);
  assertNothingDestroyed(server, h, storage, null);
});

test('a brand-new device (absent key, EMPTY base) is not corruption and pulls the server down', async () => {
  const storage = fakeStorage();
  const server = fakeServer(stampChanges(emptyDoc(), toDoc([list('A', 'Wishlist', [game('g1')])]), 500), 1);
  const h = harness(storage, server);
  assert.equal(storage.getItem(LISTS_KEY), null, 'the key has never been written on this device');

  const result = await runSyncCycle(h.args);
  assert.equal(result.status, 'synced');
  assert.deepEqual(readLists(storage).map(l => l.id), ['A'], 'the server lists must arrive');
  assert.equal(server.doc.lists.A.deletedAt, null, 'and nothing may be tombstoned');
});

test('a new device whose base holds only TOMBSTONES still syncs (the guard must not count deleted lists)', async () => {
  // The other device deleted every list, so the server's document is all
  // tombstones. Tombstones live in base for TOMBSTONE_TTL_MS (90 days), and
  // fromDoc skips deletedAt != null — so this device's first cycle writes
  // nothing (changed === false, psnpp-lists stays absent) while base.lists
  // gains a key. Counting keys rather than LIVE lists then wedges the device
  // permanently: every later cycle reports corrupt, it never receives a list
  // created afterwards, and the chip tells a perfectly healthy browser its
  // data is unreadable while offering zero backups to restore.
  const storage = fakeStorage();
  const deletedWorld = stampChanges(
    toDoc([list('A', 'Wishlist', [game('g1')])]), emptyDoc(), 500
  );
  assert.equal(deletedWorld.lists.A.deletedAt, 500, 'the server world is a tombstone');
  const server = fakeServer(deletedWorld, 1);
  const h = harness(storage, server);

  // Cycle 1: nothing to write locally, but base picks up the tombstone.
  const first = await runSyncCycle(h.args);
  assert.equal(first.status, 'synced');
  assert.equal(storage.getItem(LISTS_KEY), null, 'nothing is written, so the key stays absent');
  assert.deepEqual(Object.keys(h.base.lists), ['A'], 'base now has a key — but no LIVE list');

  // Cycle 2: same healthy device, same absent key. Still not corruption.
  const second = await runSyncCycle({ ...h.args, now: 2000 });
  assert.equal(second.status, 'synced', 'a tombstone-only base must not read as a wipe');

  // And the device must still be able to receive a list created elsewhere.
  const withZ = stampChanges(emptyDoc(), toDoc([list('Z', 'New List', [game('g2')])]), 3000);
  server.doc = { version: 1, lists: { ...server.doc.lists, ...withZ.lists } };
  const third = await runSyncCycle({ ...h.args, now: 4000 });
  assert.equal(third.status, 'synced');
  assert.equal(third.changed, true);
  assert.deepEqual(readLists(storage).map(l => l.id), ['Z'], 'the new list must arrive');
});

test('deleting the last list ("[]") is a real deletion and still mints a tombstone', async () => {
  const storage = fakeStorage();
  const base = toDoc([list('A', 'Wishlist', [game('g1')])]);
  const server = fakeServer(stampChanges(emptyDoc(), base, 500), 1);
  const h = harness(storage, server, base);
  // ListStorage.remove -> _save writes an empty array; it never removes the key.
  writeLists(storage, []);
  assert.equal(storage.getItem(LISTS_KEY), '[]');

  const result = await runSyncCycle({ ...h.args, now: 6000 });
  assert.equal(result.status, 'synced');
  assert.equal(server.doc.lists.A.deletedAt, 6000, 'this deletion MUST propagate');
});

test('[null] is corruption — the length check is what stops it reading as "everything was deleted"', async () => {
  const { storage, server, h } = corruptionHarness();
  // readLists filters the null away and returns [], which against a populated
  // base is indistinguishable from "the user deleted every list here" unless
  // looksCorrupt notices that one parsed entry did not survive the filter.
  storage.setItem(LISTS_KEY, '[null]');

  const result = await runSyncCycle(h.args);
  assert.equal(result.status, 'corrupt');
  assertNothingDestroyed(server, h, storage, '[null]');
});

// --- The cycle reports WHAT it changed --------------------------------------
//
// "Synced" alone cannot answer the only question that ever gets asked after a
// list looks wrong: did a sync do that? The merge already knows the answer, so
// the cycle reports it rather than anyone re-deriving it from storage.
//
// The delta describes what the cycle DID — so every path that writes nothing
// reports zeros, and the counts are only ever non-zero when `changed` is true.

const ZERO = {
  listsAdded: 0, listsRemoved: 0, gamesAdded: 0, gamesRemoved: 0, listsLinked: 0,
  // Named alongside the counts so the log can say WHICH game moved. Empty here
  // and asserted explicitly in the tests where something actually moved.
  addedGames: [], removedGames: []
};

test('a cycle that pulls in a remote game reports it as one game added', async () => {
  const storage = fakeStorage();
  writeLists(storage, [list('A', 'Wishlist', [game('g1')])]);
  const server = fakeServer(stampChanges(emptyDoc(), toDoc([list('A', 'Wishlist', [game('g1'), game('g2')])]), 500), 1);

  const result = await runSyncCycle(harness(storage, server).args);
  assert.equal(result.changed, true);
  assert.deepEqual(result.delta, {
    ...ZERO, gamesAdded: 1, addedGames: [{ title: 'Game g2', list: 'Wishlist' }]
  });
});

test('a cycle that receives a whole new list counts the list AND its games', async () => {
  const storage = fakeStorage();
  writeLists(storage, [list('A', 'Wishlist')]);
  const server = fakeServer(
    stampChanges(emptyDoc(), toDoc([list('B', 'Backlog', [game('g8'), game('g9')])]), 500), 1
  );

  const result = await runSyncCycle(harness(storage, server).args);
  assert.deepEqual(result.delta, {
    ...ZERO, listsAdded: 1, gamesAdded: 2,
    addedGames: [{ title: 'Game g8', list: 'Backlog' }, { title: 'Game g9', list: 'Backlog' }]
  });
});

test('a deletion arriving from another device is reported as a removal', async () => {
  const storage = fakeStorage();
  const before = [list('A', 'Wishlist', [game('g1')]), list('B', 'Backlog', [game('g8')])];
  writeLists(storage, before);
  const base = toDoc(before);
  // The other device deleted B, so the server holds a tombstone for it.
  const server = fakeServer(stampChanges(base, toDoc([list('A', 'Wishlist', [game('g1')])]), 5000), 1);
  const h = harness(storage, server, base);

  const result = await runSyncCycle({ ...h.args, now: 6000 });
  assert.equal(result.changed, true);
  assert.deepEqual(readLists(storage).map(l => l.id), ['A'], 'B really was removed locally');
  assert.deepEqual(result.delta, {
    ...ZERO, listsRemoved: 1, gamesRemoved: 1,
    removedGames: [{ title: 'Game g8', list: 'Backlog' }]
  });
});

test('an adoption is reported as a link, not as a list removed and re-added', async () => {
  const storage = fakeStorage();
  writeLists(storage, [list('local-1', 'Wishlist', [game('g1')])]);
  const server = fakeServer(stampChanges(emptyDoc(), toDoc([list('remote-1', 'Wishlist', [game('g2')])]), 500), 1);

  const result = await runSyncCycle(harness(storage, server).args);
  // local-1 became remote-1. Reading that as "a list vanished and another
  // appeared" would be the single most alarming thing this log could say, and
  // it would be wrong — it is the same list under the id the server already had.
  assert.deepEqual(result.delta, {
    ...ZERO, listsLinked: 1, gamesAdded: 1,
    addedGames: [{ title: 'Game g2', list: 'Wishlist' }]
  });
});

test('a cycle that writes nothing reports a zero delta', async () => {
  const storage = fakeStorage();
  writeLists(storage, [list('A', 'Wishlist', [game('g1')])]);
  const server = fakeServer();
  const h = harness(storage, server);

  await runSyncCycle(h.args);
  const second = await runSyncCycle({ ...h.args, loadBase: async () => h.base });
  assert.equal(second.changed, false);
  assert.deepEqual(second.delta, ZERO);
});

test('a corrupt cycle reports a zero delta — it wrote nothing', async () => {
  const { storage, h } = corruptionHarness();
  storage.setItem(LISTS_KEY, '{ this is not json');

  const result = await runSyncCycle(h.args);
  assert.equal(result.status, 'corrupt');
  assert.deepEqual(result.delta, ZERO);
});

test('an exhausted-retry conflict reports a zero delta', async () => {
  const storage = fakeStorage();
  writeLists(storage, [list('A', 'Wishlist')]);
  const server = fakeServer(toDoc([list('B', 'Backlog', [game('g9')])]), 1);
  server.putState = async () => ({ ok: false, conflict: true, revision: 1, doc: server.doc });

  const result = await runSyncCycle({ ...harness(storage, server).args, maxAttempts: 3 });
  assert.equal(result.status, 'conflict');
  assert.deepEqual(result.delta, ZERO);
});

test('a cycle aborted by the CAS reports the delta of the write that actually landed', async () => {
  // A delta describes what reached storage. The abandoned attempt still reports
  // nothing — but the cycle no longer ENDS there, so what the caller is told
  // has to be the retry's write, not the abandoned one's intentions and not a
  // zero that would hide a real change from the history log.
  const storage = fakeStorage();
  writeLists(storage, [
    list('F', 'Frozen', [game('g1')], { url: 'https://x/y.json' }),
    list('A', 'Wishlist')
  ]);
  const server = fakeServer(toDoc([list('B', 'Backlog', [game('g9')])]), 1);
  const h = harness(storage, server);

  let pushes = 0;
  const realPut = server.putState.bind(server);
  server.putState = async (baseRevision, doc) => {
    pushes += 1;
    // Another tab writes while our first push is in flight, invalidating the
    // snapshot that attempt's merge was computed from.
    if (pushes === 1) {
      writeLists(storage, [list('F', 'Frozen', [game('g1')]), list('A', 'Wishlist')]);
    }
    return realPut(baseRevision, doc);
  };

  const result = await runSyncCycle(h.args);
  assert.equal(result.changed, true);
  // The retry's snapshot was [F, A]; what it wrote is [F, A, B]. Exactly one
  // list and its one game arrived, and nothing was removed.
  assert.deepEqual(result.delta, {
    ...ZERO, listsAdded: 1, gamesAdded: 1,
    addedGames: [{ title: 'Game g9', list: 'Backlog' }]
  });
  const after = readLists(storage);
  assert.deepEqual(after.map(l => l.id).sort(), ['A', 'B', 'F'],
    'the delta must match the bytes actually in storage');
  assert.deepEqual(after.find(l => l.id === 'B').games.map(g => g.id), ['g9']);
  // The abandoned half of the contract still holds: a cycle that reaches no
  // write at all claims nothing. (The bounded-retry test above pins the same
  // thing for a CAS abort that never settles.)
  const quiet = await runSyncCycle(h.args);
  assert.equal(quiet.changed, false);
  assert.deepEqual(quiet.delta, ZERO);
});

// --- The push is skipped when the server already holds the merge ------------
//
// Every cycle used to PUT unconditionally and the server bumped the revision
// regardless: 624 revisions for 600 operations, including cycles that had
// nothing whatsoever to say. If the merged document is what the server already
// holds, there is no message to send.
//
// The trap this has to avoid is that "nothing to PUSH" is NOT "nothing to DO".
// A device receiving a list from elsewhere merges to exactly the server's own
// document — so the push is skippable and the LOCAL write is mandatory. Getting
// that backwards silently stops every device from ever receiving anything.

/** A server that counts pushes, so a skipped push is observable. */
const countingServer = (doc = emptyDoc(), revision = 0) => {
  const server = fakeServer(doc, revision);
  server.pushes = 0;
  const realPut = server.putState.bind(server);
  server.putState = async (baseRevision, next) => {
    server.pushes += 1;
    return realPut(baseRevision, next);
  };
  return server;
};

test('a settled cycle with nothing to tell the server does not push', async () => {
  const storage = fakeStorage();
  writeLists(storage, [list('A', 'Wishlist', [game('g1')])]);
  const server = countingServer();
  const h = harness(storage, server);

  await runSyncCycle(h.args);                       // first sync: a real push
  assert.equal(server.pushes, 1);
  const revisionAfterFirst = server.revision;

  const second = await runSyncCycle({ ...h.args, loadBase: async () => h.base });
  assert.equal(second.status, 'synced');
  assert.equal(second.changed, false);
  assert.equal(server.pushes, 1, 'the second cycle had nothing to send');
  assert.equal(server.revision, revisionAfterFirst, 'and must not have bumped the revision');
  assert.equal(second.revision, revisionAfterFirst, 'the reported revision is the real one');
});

test('repeated quiet cycles never bump the revision', async () => {
  const storage = fakeStorage();
  writeLists(storage, [list('A', 'Wishlist', [game('g1')])]);
  const server = countingServer();
  const h = harness(storage, server);

  await runSyncCycle(h.args);
  const settledRevision = server.revision;
  for (let i = 0; i < 10; i += 1) {
    await runSyncCycle({ ...h.args, loadBase: async () => h.base, now: 2000 + i });
  }
  assert.equal(server.pushes, 1, '10 idle cycles must cost 0 pushes');
  assert.equal(server.revision, settledRevision);
});

test('a cycle that only RECEIVES skips the push but still writes locally', async () => {
  // The merge of "nothing new here" against "the server has a game we lack" IS
  // the server's own document — so there is nothing to push, and everything to
  // write. This is the case that breaks if the local write is left sitting
  // inside the push's success branch.
  const storage = fakeStorage();
  const before = [list('A', 'Wishlist', [game('g1')])];
  writeLists(storage, before);
  const base = stampChanges(emptyDoc(), toDoc(before), 500);
  const server = countingServer(
    stampChanges(base, toDoc([list('A', 'Wishlist', [game('g1'), game('g2')])]), 700), 4
  );
  const h = harness(storage, server, base);

  const result = await runSyncCycle({ ...h.args, now: 1000 });
  assert.equal(server.pushes, 0, 'the server already holds this exact document');
  assert.equal(result.status, 'synced');
  assert.equal(result.changed, true, 'but the cycle DID write');
  assert.deepEqual(readLists(storage)[0].games.map(g => g.id).sort(), ['g1', 'g2'],
    'the received game must reach localStorage even though nothing was pushed');
  assert.equal(h.backups.length, 1, 'and the pre-merge backup must still be taken');
  assert.deepEqual(h.backups[0][0].games.map(g => g.id), ['g1'], 'of the pre-merge lists');
  assert.deepEqual(Object.keys(h.base.lists), ['A'], 'and base must still advance');
  assert.deepEqual(result.delta, {
    ...ZERO, gamesAdded: 1, addedGames: [{ title: 'Game g2', list: 'Wishlist' }]
  });
});

test('a brand-new device still pulls the whole server down without pushing', async () => {
  const storage = fakeStorage();
  const server = countingServer(
    stampChanges(emptyDoc(), toDoc([list('A', 'Wishlist', [game('g1')])]), 500), 1
  );
  const h = harness(storage, server);

  const result = await runSyncCycle(h.args);
  assert.equal(server.pushes, 0);
  assert.equal(result.changed, true);
  assert.deepEqual(readLists(storage).map(l => l.id), ['A']);
  assert.deepEqual(Object.keys(h.base.lists), ['A'], 'base must advance on the skip path too');
});

test('a genuine local change is still pushed', async () => {
  const storage = fakeStorage();
  const settled = [list('A', 'Wishlist', [game('g1')])];
  writeLists(storage, settled);
  const base = stampChanges(emptyDoc(), toDoc(settled), 500);
  const server = countingServer(base, 3);
  const h = harness(storage, server, base);

  writeLists(storage, [list('A', 'Wishlist', [game('g1'), game('g2')])]);
  const result = await runSyncCycle({ ...h.args, now: 1000 });
  assert.equal(server.pushes, 1, 'a local edit is exactly what a push is for');
  assert.equal(result.status, 'synced');
  assert.deepEqual(Object.keys(server.doc.lists.A.games).sort(), ['g1', 'g2']);
  assert.equal(server.revision, 4);
});

test('a local deletion is still pushed', async () => {
  const storage = fakeStorage();
  const settled = [list('A', 'Wishlist', [game('g1')]), list('B', 'Backlog')];
  writeLists(storage, settled);
  const base = stampChanges(emptyDoc(), toDoc(settled), 500);
  const server = countingServer(base, 3);
  const h = harness(storage, server, base);

  writeLists(storage, [list('A', 'Wishlist', [game('g1')])]);
  await runSyncCycle({ ...h.args, now: 6000 });
  assert.equal(server.pushes, 1);
  assert.equal(server.doc.lists.B.deletedAt, 6000, 'the tombstone must reach the server');
});

test('key order in the server document does not force a pointless push', async () => {
  // JSON.stringify is key-order sensitive and the server hands back whatever
  // key order it stored. A comparison that noticed the ordering would push on
  // every single cycle forever — i.e. it would silently do nothing at all.
  const reorderKeys = value => {
    if (value === null || typeof value !== 'object') return value;
    if (Array.isArray(value)) return value.map(reorderKeys);
    const out = {};
    for (const key of Object.keys(value).reverse()) out[key] = reorderKeys(value[key]);
    return out;
  };

  const storage = fakeStorage();
  const settled = [list('A', 'Wishlist', [game('g1')])];
  writeLists(storage, settled);
  const base = stampChanges(emptyDoc(), toDoc(settled), 500);
  const server = countingServer(reorderKeys(base), 3);
  const h = harness(storage, server, base);

  // Sanity: the two really do serialize differently under plain JSON.stringify.
  assert.notEqual(JSON.stringify(server.doc), JSON.stringify(base));

  const result = await runSyncCycle({ ...h.args, now: 1000 });
  assert.equal(result.status, 'synced');
  assert.equal(server.pushes, 0, 'same content, different key order — nothing to say');
  assert.equal(server.revision, 3);
});

test('the CAS still guards the write when the push is skipped', async () => {
  // On the skip path saveBackup is the only await between the snapshot and the
  // write, so it is the whole window another tab can land in — and the write
  // must still be abandoned, with base left where it is.
  const storage = fakeStorage();
  const before = [list('A', 'Wishlist', [game('g1')])];
  writeLists(storage, before);
  const base = stampChanges(emptyDoc(), toDoc(before), 500);
  const server = countingServer(
    stampChanges(base, toDoc([list('A', 'Wishlist', [game('g1'), game('g2')])]), 700), 4
  );
  const h = harness(storage, server, base);
  h.args.saveBackup = async () => {
    // A second tab writes while the backup is being taken.
    writeLists(storage, [list('A', 'Wishlist', [game('g1'), game('g9')])]);
  };

  const result = await runSyncCycle({ ...h.args, now: 1000 });
  assert.equal(server.pushes, 0);
  assert.equal(result.changed, false, 'the write was abandoned');
  assert.deepEqual(result.delta, ZERO);
  assert.deepEqual(readLists(storage)[0].games.map(g => g.id).sort(), ['g1', 'g9'],
    "the other tab's write must survive");
  assert.deepEqual(Object.keys(h.base.lists), ['A']);
  assert.deepEqual(h.base.lists.A.games.g2, undefined,
    'base must NOT advance past a write that never happened');
});

test('a corrupt local state still refuses to push, and never reaches the skip check', async () => {
  const { storage, server: plain, h } = corruptionHarness();
  storage.setItem(LISTS_KEY, '{ this is not json');
  let pushes = 0;
  plain.putState = async () => { pushes += 1; throw new Error('must not push'); };

  const result = await runSyncCycle(h.args);
  assert.equal(result.status, 'corrupt');
  assert.equal(pushes, 0);
});

test('changed stays truthful across the skip path', async () => {
  // The same invariant the pre-existing `changed` test pins, re-run over the
  // scenarios the skip introduces: skip-and-write, skip-and-do-nothing, push.
  const scenarios = [
    // Receives from the server: skips the push, writes locally.
    () => {
      const storage = fakeStorage();
      const before = [list('A', 'Wishlist', [game('g1')])];
      writeLists(storage, before);
      const base = stampChanges(emptyDoc(), toDoc(before), 500);
      const server = fakeServer(stampChanges(base, toDoc([list('A', 'Wishlist', [game('g1'), game('g2')])]), 700), 4);
      return { storage, args: { ...harness(storage, server, base).args, now: 1000 } };
    },
    // Fully settled: skips the push, writes nothing.
    () => {
      const storage = fakeStorage();
      const settled = [list('A', 'Wishlist', [game('g1')])];
      writeLists(storage, settled);
      const base = stampChanges(emptyDoc(), toDoc(settled), 500);
      return { storage, args: { ...harness(storage, fakeServer(base, 3), base).args, now: 1000 } };
    },
    // Local edit: pushes, writes nothing locally.
    () => {
      const storage = fakeStorage();
      const settled = [list('A', 'Wishlist', [game('g1')])];
      const base = stampChanges(emptyDoc(), toDoc(settled), 500);
      writeLists(storage, [list('A', 'Wishlist', [game('g1'), game('g2')])]);
      return { storage, args: { ...harness(storage, fakeServer(base, 3), base).args, now: 1000 } };
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

test('two devices still converge when neither pushes more than it must', async () => {
  // End-to-end: the skip must not stop a change from propagating, only stop
  // the cycles that had nothing to propagate.
  const server = fakeServer();
  let pushes = 0;
  const realPut = server.putState.bind(server);
  server.putState = async (rev, doc) => { pushes += 1; return realPut(rev, doc); };

  const sA = fakeStorage();
  const sB = fakeStorage();
  writeLists(sA, [list('A', 'Wishlist', [game('g1')])]);
  const A = device(sA, server);
  const B = device(sB, server);

  await A.sync(1000);
  await B.sync(1100);
  assert.deepEqual(readLists(sB).map(l => l.id), ['A'], 'B receives the list');

  // Quiet period: nothing changed on either device.
  const quietBaseline = pushes;
  for (let i = 0; i < 6; i += 1) {
    await A.sync(2000 + i);
    await B.sync(2100 + i);
  }
  assert.equal(pushes, quietBaseline, '12 idle cycles across 2 devices must cost 0 pushes');

  // A real edit on B still reaches A.
  writeLists(sB, [list('A', 'Wishlist', [game('g1'), game('g2')])]);
  await B.sync(3000);
  await A.sync(3100);
  assert.deepEqual(readLists(sA)[0].games.map(g => g.id).sort(), ['g1', 'g2']);
  assert.equal(server.revision, pushes, 'the revision counts pushes and nothing else');
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

test('two cycles never share one named-games array', async () => {
  // ZERO_DELTA is spread to build every delta. If it held the arrays, a shallow
  // copy would hand every delta the SAME array and one cycle's games would
  // accumulate into the next one's log — invisibly, and only in production
  // where cycles actually run more than once.
  const storage = fakeStorage();
  writeLists(storage, [list('A', 'Wishlist', [game('g1')])]);
  const server = fakeServer(
    stampChanges(emptyDoc(), toDoc([list('A', 'Wishlist', [game('g1'), game('g2')])]), 500), 1
  );
  const h = harness(storage, server);

  const first = await runSyncCycle(h.args);
  const second = await runSyncCycle(h.args);

  assert.deepEqual(first.delta.addedGames, [{ title: 'Game g2', list: 'Wishlist' }]);
  assert.deepEqual(second.delta.addedGames, [], 'the second cycle added nothing');
  assert.notEqual(first.delta.addedGames, second.delta.addedGames, 'must not be the same array');
});

test('a huge first sync names a bounded number of games, not the whole library', async () => {
  // A first sync, or deleting a list, can move hundreds at once. The log wants
  // to say what changed, not reproduce the library into a Discord message.
  const storage = fakeStorage();
  writeLists(storage, [list('A', 'Wishlist')]);
  const many = Array.from({ length: 200 }, (_, i) => game(`g${i}`));
  const server = fakeServer(
    stampChanges(emptyDoc(), toDoc([list('B', 'Backlog', many)]), 500), 1
  );

  const result = await runSyncCycle(harness(storage, server).args);
  assert.equal(result.delta.gamesAdded, 200, 'the COUNT stays exact');
  assert.equal(result.delta.addedGames.length, 20, 'only the names are capped');
});
