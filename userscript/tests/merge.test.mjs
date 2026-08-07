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

// --- Regression coverage from the Task 5 review ---
//
// The fixtures above use ids like 'g1'/'g2'/'g3', which are not numeric
// strings, so Object.keys enumerates them in insertion order and hides a bug
// that only shows up with real PSNP+ ids (numeric strings, which JS engines
// enumerate in ascending numeric order regardless of insertion order).

test('a resurrected list keeps its own order through edits that do not touch order (numeric game ids)', () => {
  const orderedGames = [game('9000'), game('30'), game('415')];
  const base = stamp(emptyDoc(), [list({ games: orderedGames })], 100);
  const local = stamp(base, [], 200); // list deleted locally at 200

  const renamed = stamp(base, [list({ games: orderedGames, name: 'Renamed' })], 300);
  assert.deepEqual(mergeDoc(base, local, renamed, 400).lists.L1.gameOrder, ['9000', '30', '415']);

  const tagged = stamp(base, [list({
    games: [game('9000', { tags: ['done'] }), game('30'), game('415')]
  })], 300);
  assert.deepEqual(mergeDoc(base, local, tagged, 400).lists.L1.gameOrder, ['9000', '30', '415']);

  const noted = stamp(base, [list({ games: orderedGames, note: 'seen it' })], 300);
  assert.deepEqual(mergeDoc(base, local, noted, 400).lists.L1.gameOrder, ['9000', '30', '415']);
});

test('a resurrected list adopts a genuine add or reorder from the surviving device (numeric game ids)', () => {
  const orderedGames = [game('9000'), game('30'), game('415')];
  const base = stamp(emptyDoc(), [list({ games: orderedGames })], 100);
  const local = stamp(base, [], 200); // list deleted locally at 200

  const added = stamp(base, [list({ games: [...orderedGames, game('7')] })], 300);
  assert.deepEqual(mergeDoc(base, local, added, 400).lists.L1.gameOrder, ['9000', '30', '415', '7']);

  const reordered = stamp(base, [list({ games: [game('30'), game('415'), game('9000')] })], 300);
  assert.deepEqual(mergeDoc(base, local, reordered, 400).lists.L1.gameOrder, ['30', '415', '9000']);
});

test('a same-millisecond conflict resolves identically regardless of merge direction, and settles rather than oscillating', () => {
  const base = stamp(emptyDoc(), [list({ games: [game('9000')] })], 100);
  const aEdit = stamp(base, [list({ games: [game('9000', { tags: ['from-a'] })] })], 200);
  const bEdit = stamp(base, [list({ games: [game('9000', { tags: ['from-b'] })] })], 200);

  const fromA = mergeDoc(base, aEdit, bEdit, 300);
  const fromB = mergeDoc(base, bEdit, aEdit, 300);
  assert.deepEqual(fromA, fromB);

  // A real oscillation bug would keep flipping the winning tag on every
  // subsequent sync. Re-merging the settled result against itself, and again,
  // must be a no-op.
  const again = mergeDoc(fromA, fromA, fromA, 400);
  assert.deepEqual(again, fromA);
  const onceMore = mergeDoc(again, again, again, 500);
  assert.deepEqual(onceMore, fromA);
});

test('both devices deleting the same game converges to a single tombstone', () => {
  const base = stamp(emptyDoc(), [list({ games: [game('9000'), game('30')] })], 100);
  const aLocal = stamp(base, [list({ games: [game('30')] })], 200);
  const bLocal = stamp(base, [list({ games: [game('30')] })], 250);
  const merged = mergeDoc(base, aLocal, bLocal, 300);
  assert.equal(merged.lists.L1.games['9000'], undefined);
  assert.equal(merged.lists.L1.deletedGames['9000'], 250);
});

test('a list deletion and a game add at the exact same millisecond favor the add, not the deletion', () => {
  const base = stamp(emptyDoc(), [list({ games: [game('9000')] })], 100);
  const local = stamp(base, [], 200); // list deleted locally at 200
  const remote = stamp(base, [list({ games: [game('9000'), game('30')] })], 200); // game added at 200
  const merged = mergeDoc(base, local, remote, 300);
  assert.equal(merged.lists.L1.deletedAt, null);
  assert.deepEqual(Object.keys(merged.lists.L1.games).sort(), ['30', '9000']);
});

test('gcTombstones keeps things exactly at the TTL boundary and drops them one millisecond later', () => {
  const base = stamp(emptyDoc(), [list({ id: 'A', games: [game('9000'), game('30')] })], 100);
  const local = stamp(base, [list({ id: 'A', games: [game('9000')] })], 200);

  const atBoundary = gcTombstones(local, 200 + TOMBSTONE_TTL_MS);
  assert.equal(atBoundary.lists.A.deletedGames['30'], 200);
  const pastBoundary = gcTombstones(local, 200 + TOMBSTONE_TTL_MS + 1);
  assert.equal(pastBoundary.lists.A.deletedGames['30'], undefined);

  const deletedList = stamp(base, [], 200);
  const listAtBoundary = gcTombstones(deletedList, 200 + TOMBSTONE_TTL_MS);
  assert.notEqual(listAtBoundary.lists.A, undefined);
  const listPastBoundary = gcTombstones(deletedList, 200 + TOMBSTONE_TTL_MS + 1);
  assert.equal(listPastBoundary.lists.A, undefined);
});
