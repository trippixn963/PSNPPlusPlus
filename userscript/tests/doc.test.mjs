import test from 'node:test';
import assert from 'node:assert/strict';
import { toDoc, fromDoc, splitRemote, isRemoteList, emptyDoc, DOC_VERSION } from '../src/doc.mjs';

const list = (over = {}) => ({
  id: 'L1', name: 'Wishlist', tags: [], removeStartedGames: false, removeGames: false,
  orderBy: 'custom', direction: 'ascending', note: '', timestamp: 100, games: [], ...over
});
const game = (id, over = {}) => ({ id, title: `Game ${id}`, platforms: { ps5: true }, tags: [], ...over });

test('emptyDoc has the current version and no lists', () => {
  assert.deepEqual(emptyDoc(), { version: DOC_VERSION, lists: {} });
});

test('isRemoteList only flags a non-empty url', () => {
  assert.equal(isRemoteList(list()), false);
  assert.equal(isRemoteList(list({ url: '' })), false);
  assert.equal(isRemoteList(list({ url: null })), false);
  assert.equal(isRemoteList(list({ url: 'https://x/y.json' })), true);
});

test('splitRemote separates remote lists from syncable ones', () => {
  const a = list({ id: 'A' });
  const b = list({ id: 'B', url: 'https://x/y.json' });
  const { syncable, remote } = splitRemote([a, b]);
  assert.deepEqual(syncable.map(l => l.id), ['A']);
  assert.deepEqual(remote.map(l => l.id), ['B']);
});

test('toDoc keys games by id and records their order', () => {
  const doc = toDoc([list({ games: [game('g2'), game('g1')] })]);
  assert.deepEqual(Object.keys(doc.lists), ['L1']);
  assert.deepEqual(doc.lists.L1.gameOrder, ['g2', 'g1']);
  assert.equal(doc.lists.L1.games.g1.title, 'Game g1');
  assert.equal(doc.lists.L1.meta.name, 'Wishlist');
  assert.equal(doc.lists.L1.deletedAt, null);
  assert.deepEqual(doc.lists.L1.deletedGames, {});
});

test('toDoc drops remote lists', () => {
  const doc = toDoc([list({ id: 'A' }), list({ id: 'B', url: 'https://x/y.json' })]);
  assert.deepEqual(Object.keys(doc.lists), ['A']);
});

test('fromDoc restores list shape and game order', () => {
  const original = list({ games: [game('g2'), game('g1')] });
  const restored = fromDoc(toDoc([original]));
  assert.equal(restored.length, 1);
  assert.equal(restored[0].id, 'L1');
  assert.equal(restored[0].name, 'Wishlist');
  assert.deepEqual(restored[0].games.map(g => g.id), ['g2', 'g1']);
});

test('fromDoc strips internal updatedAt from games', () => {
  const doc = toDoc([list({ games: [game('g1')] })]);
  doc.lists.L1.games.g1.updatedAt = 12345;
  const restored = fromDoc(doc);
  assert.equal('updatedAt' in restored[0].games[0], false);
});

test('fromDoc omits deleted lists', () => {
  const doc = toDoc([list({ id: 'A' }), list({ id: 'B' })]);
  doc.lists.B.deletedAt = 999;
  assert.deepEqual(fromDoc(doc).map(l => l.id), ['A']);
});

test('fromDoc appends games missing from gameOrder', () => {
  const doc = toDoc([list({ games: [game('g1')] })]);
  doc.lists.L1.games.g2 = { ...game('g2'), updatedAt: 1 };
  assert.deepEqual(fromDoc(doc)[0].games.map(g => g.id), ['g1', 'g2']);
});

test('fromDoc ignores gameOrder entries with no game', () => {
  const doc = toDoc([list({ games: [game('g1')] })]);
  doc.lists.L1.gameOrder = ['ghost', 'g1'];
  assert.deepEqual(fromDoc(doc)[0].games.map(g => g.id), ['g1']);
});
