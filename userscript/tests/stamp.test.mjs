import test from 'node:test';
import assert from 'node:assert/strict';
import { toDoc, emptyDoc } from '../src/doc.mjs';
import { stampChanges } from '../src/merger.mjs';

const NOW = 1_000_000;
const list = (over = {}) => ({
  id: 'L1', name: 'Wishlist', tags: [], removeStartedGames: false, removeGames: false,
  orderBy: 'custom', direction: 'ascending', note: '', timestamp: 100, games: [], ...over
});
const game = (id, over = {}) => ({ id, title: `Game ${id}`, platforms: { ps5: true }, tags: [], ...over });

test('a brand new list is stamped with now', () => {
  const out = stampChanges(emptyDoc(), toDoc([list({ games: [game('g1')] })]), NOW);
  assert.equal(out.lists.L1.meta.updatedAt, NOW);
  assert.equal(out.lists.L1.games.g1.updatedAt, NOW);
  assert.equal(out.lists.L1.orderUpdatedAt, NOW);
});

test('unchanged records keep their base timestamps', () => {
  const base = stampChanges(emptyDoc(), toDoc([list({ games: [game('g1')] })]), 500);
  const out = stampChanges(base, toDoc([list({ games: [game('g1')] })]), NOW);
  assert.equal(out.lists.L1.meta.updatedAt, 500);
  assert.equal(out.lists.L1.games.g1.updatedAt, 500);
});

test('a modified game is restamped but its siblings are not', () => {
  const base = stampChanges(emptyDoc(), toDoc([list({ games: [game('g1'), game('g2')] })]), 500);
  const local = toDoc([list({ games: [game('g1', { tags: ['fun'] }), game('g2')] })]);
  const out = stampChanges(base, local, NOW);
  assert.equal(out.lists.L1.games.g1.updatedAt, NOW);
  assert.equal(out.lists.L1.games.g2.updatedAt, 500);
});

test('renaming a list restamps meta but not its games', () => {
  const base = stampChanges(emptyDoc(), toDoc([list({ games: [game('g1')] })]), 500);
  const local = toDoc([list({ name: 'Backlog', games: [game('g1')] })]);
  const out = stampChanges(base, local, NOW);
  assert.equal(out.lists.L1.meta.updatedAt, NOW);
  assert.equal(out.lists.L1.games.g1.updatedAt, 500);
});

test('reordering games restamps orderUpdatedAt but not meta', () => {
  const base = stampChanges(emptyDoc(), toDoc([list({ games: [game('g1'), game('g2')] })]), 500);
  const local = toDoc([list({ games: [game('g2'), game('g1')] })]);
  const out = stampChanges(base, local, NOW);
  assert.equal(out.lists.L1.orderUpdatedAt, NOW);
  assert.equal(out.lists.L1.meta.updatedAt, 500);
});

test('a game missing from local becomes a tombstone', () => {
  const base = stampChanges(emptyDoc(), toDoc([list({ games: [game('g1'), game('g2')] })]), 500);
  const out = stampChanges(base, toDoc([list({ games: [game('g1')] })]), NOW);
  assert.equal(out.lists.L1.games.g2, undefined);
  assert.equal(out.lists.L1.deletedGames.g2, NOW);
});

test('an existing tombstone keeps its original time', () => {
  const base = stampChanges(emptyDoc(), toDoc([list({ games: [game('g1'), game('g2')] })]), 500);
  const once = stampChanges(base, toDoc([list({ games: [game('g1')] })]), 700);
  const twice = stampChanges(once, toDoc([list({ games: [game('g1')] })]), NOW);
  assert.equal(twice.lists.L1.deletedGames.g2, 700);
});

test('a list missing from local becomes a deleted list', () => {
  const base = stampChanges(emptyDoc(), toDoc([list({ id: 'A' }), list({ id: 'B' })]), 500);
  const out = stampChanges(base, toDoc([list({ id: 'A' })]), NOW);
  assert.equal(out.lists.B.deletedAt, NOW);
  assert.deepEqual(out.lists.B.games, {});
});

test('a list never seen locally is not resurrected as a tombstone', () => {
  const out = stampChanges(emptyDoc(), toDoc([list({ id: 'A' })]), NOW);
  assert.deepEqual(Object.keys(out.lists), ['A']);
});

test('stampChanges does not mutate its inputs', () => {
  const base = stampChanges(emptyDoc(), toDoc([list({ games: [game('g1')] })]), 500);
  const local = toDoc([list({ games: [game('g1'), game('g2')] })]);
  const baseSnapshot = JSON.stringify(base);
  const localSnapshot = JSON.stringify(local);
  stampChanges(base, local, NOW);
  assert.equal(JSON.stringify(base), baseSnapshot);
  assert.equal(JSON.stringify(local), localSnapshot);
});

test('a re-added game is not tombstoned', () => {
  const base = stampChanges(emptyDoc(), toDoc([list({ games: [game('g1')] })]), 500);
  const once = stampChanges(base, toDoc([list({ games: [] })]), 700);
  assert.equal(once.lists.L1.deletedGames.g1, 700);
  const twice = stampChanges(once, toDoc([list({ games: [game('g1')] })]), NOW);
  assert.notEqual(twice.lists.L1.games.g1, undefined);
  assert.equal(twice.lists.L1.deletedGames.g1, undefined);
});

test('two records with different key orders are treated as unchanged', () => {
  const base = stampChanges(emptyDoc(), toDoc([list({ games: [game('g1')] })]), 500);
  const reorderedGame = { id: 'g1', title: 'Game g1', tags: [], platforms: { ps5: true } };
  const local = toDoc([list({ games: [reorderedGame] })]);
  const out = stampChanges(base, local, NOW);
  assert.equal(out.lists.L1.games.g1.updatedAt, 500);
});

test('a list tombstone keeps its original deletedAt on second stampChanges', () => {
  const base = stampChanges(emptyDoc(), toDoc([list({ id: 'A' }), list({ id: 'B' })]), 500);
  const once = stampChanges(base, toDoc([list({ id: 'A' })]), 700);
  assert.equal(once.lists.B.deletedAt, 700);
  const twice = stampChanges(once, toDoc([list({ id: 'A' })]), NOW);
  assert.equal(twice.lists.B.deletedAt, 700);
});
