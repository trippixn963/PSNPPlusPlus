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
