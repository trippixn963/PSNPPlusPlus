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
