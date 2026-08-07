import test from 'node:test';
import assert from 'node:assert/strict';
import { toDoc, emptyDoc } from '../src/doc.mjs';
import { stampChanges, mergeDoc, gcTombstones, TOMBSTONE_TTL_MS } from '../src/merger.mjs';

const list = (over = {}) => ({
  id: 'L1', name: 'Wishlist', tags: [], removeStartedGames: false, removeGames: false,
  orderBy: 'custom', direction: 'ascending', note: '', timestamp: 100, games: [], ...over
});
const game = (id, over = {}) => ({ id, title: `Game ${id}`, platforms: { ps5: true }, tags: [], ...over });
const stamp = (base, lists, now) => stampChanges(base, toDoc(lists), now);

test('adds from both devices both survive', () => {
  const base = stamp(emptyDoc(), [list({ games: [game('g1')] })], 100);
  const local = stamp(base, [list({ games: [game('g1'), game('g2')] })], 200);
  const remote = stamp(base, [list({ games: [game('g1'), game('g3')] })], 300);
  const merged = mergeDoc(base, local, remote, 400);
  assert.deepEqual(Object.keys(merged.lists.L1.games).sort(), ['g1', 'g2', 'g3']);
});

test('a local delete removes a game the remote still has', () => {
  const base = stamp(emptyDoc(), [list({ games: [game('g1'), game('g2')] })], 100);
  const local = stamp(base, [list({ games: [game('g1')] })], 200);
  const merged = mergeDoc(base, local, base, 300);
  assert.equal(merged.lists.L1.games.g2, undefined);
  assert.equal(merged.lists.L1.deletedGames.g2, 200);
});

test('a remote delete removes a game the local still has', () => {
  const base = stamp(emptyDoc(), [list({ games: [game('g1'), game('g2')] })], 100);
  const remote = stamp(base, [list({ games: [game('g1')] })], 200);
  const merged = mergeDoc(base, base, remote, 300);
  assert.equal(merged.lists.L1.games.g2, undefined);
});

test('a deleted game does not resurrect on the next cycle', () => {
  const base = stamp(emptyDoc(), [list({ games: [game('g1'), game('g2')] })], 100);
  const remote = stamp(base, [list({ games: [game('g1')] })], 200);
  const merged = mergeDoc(base, base, remote, 300);
  const again = mergeDoc(merged, stampChanges(merged, toDoc([list({ games: [game('g1')] })]), 400), merged, 500);
  assert.equal(again.lists.L1.games.g2, undefined);
});

test('re-adding a game after a remote delete wins over the tombstone', () => {
  const base = stamp(emptyDoc(), [list({ games: [game('g1')] })], 100);
  const remote = stamp(base, [list({ games: [] })], 200);
  const local = stamp(base, [list({ games: [game('g1', { tags: ['re-added'] })] })], 300);
  const merged = mergeDoc(base, local, remote, 400);
  assert.equal(merged.lists.L1.games.g1.updatedAt, 300);
  assert.equal(merged.lists.L1.deletedGames.g1, undefined);
});

test('the newer edit of the same game wins', () => {
  const base = stamp(emptyDoc(), [list({ games: [game('g1')] })], 100);
  const local = stamp(base, [list({ games: [game('g1', { tags: ['old'] })] })], 200);
  const remote = stamp(base, [list({ games: [game('g1', { tags: ['new'] })] })], 300);
  assert.deepEqual(mergeDoc(base, local, remote, 400).lists.L1.games.g1.tags, ['new']);
});

test('the newer list rename wins', () => {
  const base = stamp(emptyDoc(), [list()], 100);
  const local = stamp(base, [list({ name: 'Old' })], 200);
  const remote = stamp(base, [list({ name: 'New' })], 300);
  assert.equal(mergeDoc(base, local, remote, 400).lists.L1.meta.name, 'New');
});

test('a list added only on the remote is kept', () => {
  const base = emptyDoc();
  const remote = stamp(base, [list({ id: 'R' })], 200);
  assert.deepEqual(Object.keys(mergeDoc(base, base, remote, 300).lists), ['R']);
});

test('a list deleted locally is dropped from the merge', () => {
  const base = stamp(emptyDoc(), [list({ id: 'A' }), list({ id: 'B' })], 100);
  const local = stamp(base, [list({ id: 'A' })], 200);
  const merged = mergeDoc(base, local, base, 300);
  assert.equal(merged.lists.B.deletedAt, 200);
});

test('an edit newer than a list deletion resurrects the list', () => {
  const base = stamp(emptyDoc(), [list({ id: 'A', games: [game('g1')] })], 100);
  const local = stamp(base, [], 200);
  const remote = stamp(base, [list({ id: 'A', games: [game('g1'), game('g2')] })], 500);
  const merged = mergeDoc(base, local, remote, 600);
  assert.equal(merged.lists.A.deletedAt, null);
  assert.deepEqual(Object.keys(merged.lists.A.games).sort(), ['g1', 'g2']);
});

test('the side with the newer order wins, strays appended', () => {
  const base = stamp(emptyDoc(), [list({ games: [game('g1'), game('g2')] })], 100);
  const local = stamp(base, [list({ games: [game('g1'), game('g2')] })], 200);
  const remote = stamp(base, [list({ games: [game('g2'), game('g1'), game('g3')] })], 300);
  const merged = mergeDoc(base, local, remote, 400);
  assert.deepEqual(merged.lists.L1.gameOrder, ['g2', 'g1', 'g3']);
});

test('gcTombstones drops expired tombstones and keeps fresh ones', () => {
  const base = stamp(emptyDoc(), [list({ games: [game('g1'), game('g2')] })], 100);
  const local = stamp(base, [list({ games: [game('g1')] })], 200);
  const fresh = gcTombstones(local, 200 + TOMBSTONE_TTL_MS - 1);
  assert.equal(fresh.lists.L1.deletedGames.g2, 200);
  const expired = gcTombstones(local, 200 + TOMBSTONE_TTL_MS + 1);
  assert.equal(expired.lists.L1.deletedGames.g2, undefined);
});

test('gcTombstones removes long-deleted lists entirely', () => {
  const base = stamp(emptyDoc(), [list({ id: 'A' })], 100);
  const local = stamp(base, [], 200);
  const expired = gcTombstones(local, 200 + TOMBSTONE_TTL_MS + 1);
  assert.deepEqual(Object.keys(expired.lists), []);
});

test('mergeDoc does not mutate its inputs', () => {
  const base = stamp(emptyDoc(), [list({ games: [game('g1')] })], 100);
  const local = stamp(base, [list({ games: [game('g1'), game('g2')] })], 200);
  const remote = stamp(base, [list({ games: [game('g1'), game('g3')] })], 300);
  const snapshot = JSON.stringify([local, remote]);
  mergeDoc(base, local, remote, 400);
  assert.equal(JSON.stringify([local, remote]), snapshot);
});
