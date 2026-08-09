import test from 'node:test';
import assert from 'node:assert/strict';
import { toDoc } from '../src/doc.mjs';
import { planAdoptions, applyAdoptions } from '../src/adopt.mjs';

const list = (id, name, games = []) => ({
  id, name, tags: [], removeStartedGames: false, removeGames: false,
  orderBy: 'custom', direction: 'ascending', note: '', timestamp: 100, games
});

test('matches lists with the same name and different ids', () => {
  const local = toDoc([list('local-1', 'Wishlist')]);
  const remote = toDoc([list('remote-1', 'Wishlist')]);
  assert.deepEqual(planAdoptions(local, remote), [
    { localId: 'local-1', remoteId: 'remote-1', name: 'Wishlist' }
  ]);
});

test('ignores lists that already share an id', () => {
  const local = toDoc([list('same', 'Wishlist')]);
  const remote = toDoc([list('same', 'Wishlist')]);
  assert.deepEqual(planAdoptions(local, remote), []);
});

test('name matching ignores case and surrounding space', () => {
  const local = toDoc([list('local-1', '  wishlist ')]);
  const remote = toDoc([list('remote-1', 'Wishlist')]);
  assert.equal(planAdoptions(local, remote).length, 1);
});

test('ambiguous duplicate names are skipped', () => {
  const local = toDoc([list('local-1', 'Wishlist'), list('local-2', 'Wishlist')]);
  const remote = toDoc([list('remote-1', 'Wishlist')]);
  assert.deepEqual(planAdoptions(local, remote), []);
});

test('a remote list whose id already exists locally is not a target', () => {
  const local = toDoc([list('remote-1', 'Backlog'), list('local-1', 'Wishlist')]);
  const remote = toDoc([list('remote-1', 'Wishlist')]);
  assert.deepEqual(planAdoptions(local, remote), []);
});

test('applyAdoptions rewrites the list id and keeps its games', () => {
  const local = toDoc([list('local-1', 'Wishlist', [{ id: 'g1', title: 'G', platforms: {}, tags: [] }])]);
  const out = applyAdoptions(local, [{ localId: 'local-1', remoteId: 'remote-1', name: 'Wishlist' }]);
  assert.deepEqual(Object.keys(out.lists), ['remote-1']);
  assert.deepEqual(Object.keys(out.lists['remote-1'].games), ['g1']);
});

test('applyAdoptions leaves unrelated lists alone', () => {
  const local = toDoc([list('local-1', 'Wishlist'), list('local-2', 'Backlog')]);
  const out = applyAdoptions(local, [{ localId: 'local-1', remoteId: 'remote-1', name: 'Wishlist' }]);
  assert.deepEqual(Object.keys(out.lists).sort(), ['local-2', 'remote-1']);
});

test('applyAdoptions with no adoptions is a no-op', () => {
  const local = toDoc([list('local-1', 'Wishlist')]);
  assert.deepEqual(applyAdoptions(local, []), local);
});

test('applyAdoptions output nodes are NOT the same references as input nodes', () => {
  const local = toDoc([list('local-1', 'Wishlist', [{ id: 'g1', title: 'G', platforms: {}, tags: [] }])]);
  const out = applyAdoptions(local, [{ localId: 'local-1', remoteId: 'remote-1', name: 'Wishlist' }]);
  // Mutate the output node
  out.lists['remote-1'].meta.name = 'Modified';
  // Verify the input is unchanged
  assert.equal(local.lists['local-1'].meta.name, 'Wishlist');
});

test('applyAdoptions throws if a remoteId collides with an existing local id that is not being renamed', () => {
  const local = toDoc([list('remote-1', 'Backlog'), list('local-1', 'Wishlist')]);
  const adoptions = [{ localId: 'local-1', remoteId: 'remote-1', name: 'Wishlist' }];
  assert.throws(
    () => applyAdoptions(local, adoptions),
    /Collision: remoteId "remote-1" already exists in local/
  );
});

test('deleted lists are not adoption candidates', () => {
  const localLists = [list('local-1', 'Wishlist')];
  const remoteLists = [list('remote-1', 'Wishlist')];
  const local = toDoc(localLists);
  const remote = toDoc(remoteLists);
  // Mark the remote list as deleted
  remote.lists['remote-1'].deletedAt = 100;
  assert.deepEqual(planAdoptions(local, remote), []);
});

test('applyAdoptions preserves the document version field', () => {
  const local = toDoc([list('local-1', 'Wishlist')]);
  const out = applyAdoptions(local, [{ localId: 'local-1', remoteId: 'remote-1', name: 'Wishlist' }]);
  assert.equal(out.version, local.version);
});

/**
 * The bookmark PSNP+ keeps to the list you last used.
 *
 * Renaming a list id strands it, and PSNP+ does not survive that: the green
 * add-to-list button beside every game is built from
 * `getById(id).name` with no guard, so a dead id throws in the constructor and
 * the button silently never renders. Observed live on 2026-08-09.
 */

import { repointActiveList, SCRIPT_STATE_KEY, ACTIVE_LIST_FIELD } from '../src/adopt.mjs';

const stateStorage = initial => {
  const store = { ...initial };
  return {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = v; },
    read: () => JSON.parse(store[SCRIPT_STATE_KEY])
  };
};

test('a bookmark naming a renamed list follows the rename', () => {
  const storage = stateStorage({
    [SCRIPT_STATE_KEY]: JSON.stringify({ version: '11.16', [ACTIVE_LIST_FIELD]: 'local-1' })
  });
  assert.equal(repointActiveList(storage, [{ localId: 'local-1', remoteId: 'remote-1' }]), true);
  assert.equal(storage.read()[ACTIVE_LIST_FIELD], 'remote-1');
  assert.equal(storage.read().version, '11.16', 'the rest of PSNP+ state is untouched');
});

test('a bookmark to a list we did NOT rename is left alone', () => {
  // A list the user genuinely deleted has a legitimately dead bookmark.
  // Choosing a new active list for them is not ours to decide.
  const storage = stateStorage({
    [SCRIPT_STATE_KEY]: JSON.stringify({ [ACTIVE_LIST_FIELD]: 'something-else' })
  });
  assert.equal(repointActiveList(storage, [{ localId: 'local-1', remoteId: 'remote-1' }]), false);
  assert.equal(storage.read()[ACTIVE_LIST_FIELD], 'something-else');
});

test('no adoptions, no bookmark, or unreadable state all no-op instead of throwing', () => {
  const ok = stateStorage({ [SCRIPT_STATE_KEY]: JSON.stringify({ [ACTIVE_LIST_FIELD]: 'local-1' }) });
  assert.equal(repointActiveList(ok, []), false);
  assert.equal(repointActiveList(stateStorage({}), [{ localId: 'a', remoteId: 'b' }]), false);
  assert.equal(repointActiveList(stateStorage({ [SCRIPT_STATE_KEY]: 'not json' }),
    [{ localId: 'a', remoteId: 'b' }]), false);
  assert.equal(repointActiveList(stateStorage({ [SCRIPT_STATE_KEY]: '[]' }),
    [{ localId: 'a', remoteId: 'b' }]), false);
  assert.equal(repointActiveList({
    getItem: () => { throw new Error('storage denied'); }, setItem: () => {}
  }, [{ localId: 'a', remoteId: 'b' }]), false, 'a courtesy repair must never fail a sync');
});

import { reconcileActiveList } from '../src/adopt.mjs';

test('a write of ours that deletes the bookmarked list moves the bookmark on', () => {
  // The "buttons keep disappearing" mechanism: another device deletes the list,
  // our merge removes it here, and PSNP+ silently stops rendering the button.
  const storage = stateStorage({
    [SCRIPT_STATE_KEY]: JSON.stringify({ [ACTIVE_LIST_FIELD]: 'gone' })
  });
  assert.deepEqual(
    reconcileActiveList(storage, ['gone', 'kept'], ['kept']),
    { from: 'gone', to: 'kept' }
  );
  assert.equal(storage.read()[ACTIVE_LIST_FIELD], 'kept');
});

test('a bookmark that was ALREADY dangling before our write is left alone', () => {
  // Not our doing, and possibly the user's own deliberate state. Choosing a
  // different active list for them is not ours to decide.
  const storage = stateStorage({
    [SCRIPT_STATE_KEY]: JSON.stringify({ [ACTIVE_LIST_FIELD]: 'stale' })
  });
  assert.equal(reconcileActiveList(storage, ['a'], ['a']), null);
  assert.equal(storage.read()[ACTIVE_LIST_FIELD], 'stale');
});

test('a still-valid bookmark is never touched', () => {
  const storage = stateStorage({
    [SCRIPT_STATE_KEY]: JSON.stringify({ [ACTIVE_LIST_FIELD]: 'a' })
  });
  assert.equal(reconcileActiveList(storage, ['a', 'b'], ['a']), null);
  assert.equal(storage.read()[ACTIVE_LIST_FIELD], 'a');
});

test('deleting the last list leaves the bookmark rather than inventing a target', () => {
  const storage = stateStorage({
    [SCRIPT_STATE_KEY]: JSON.stringify({ [ACTIVE_LIST_FIELD]: 'only' })
  });
  assert.equal(reconcileActiveList(storage, ['only'], []), null);
  assert.equal(storage.read()[ACTIVE_LIST_FIELD], 'only');
});

test('reconcile never throws, whatever storage does', () => {
  assert.equal(reconcileActiveList({
    getItem: () => { throw new Error('denied'); }, setItem: () => {}
  }, ['a'], []), null);
  assert.equal(reconcileActiveList(stateStorage({ [SCRIPT_STATE_KEY]: 'not json' }), ['a'], []), null);
});
