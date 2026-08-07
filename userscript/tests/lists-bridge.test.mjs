import test from 'node:test';
import assert from 'node:assert/strict';
import { LISTS_KEY, readLists, writeLists, readSyncable, writeSyncable } from '../src/lists-bridge.mjs';

/** Minimal in-memory stand-in for the Storage interface. */
const fakeStorage = (initial = {}) => {
  const data = { ...initial };
  return {
    getItem: key => (key in data ? data[key] : null),
    setItem: (key, value) => { data[key] = String(value); },
    removeItem: key => { delete data[key]; }
  };
};

const list = (id, over = {}) => ({
  id, name: `List ${id}`, tags: [], removeStartedGames: false, removeGames: false,
  orderBy: 'custom', direction: 'ascending', note: '', timestamp: 100, games: [], ...over
});

test('readLists returns an empty array when the key is absent', () => {
  assert.deepEqual(readLists(fakeStorage()), []);
});

test('readLists returns an empty array on malformed JSON', () => {
  assert.deepEqual(readLists(fakeStorage({ [LISTS_KEY]: '{not json' })), []);
});

test('readLists returns an empty array when the value is not an array', () => {
  assert.deepEqual(readLists(fakeStorage({ [LISTS_KEY]: '{"a":1}' })), []);
});

test('writeLists then readLists round-trips', () => {
  const storage = fakeStorage();
  writeLists(storage, [list('A')]);
  assert.deepEqual(readLists(storage).map(l => l.id), ['A']);
});

test('readSyncable separates remote lists', () => {
  const storage = fakeStorage();
  writeLists(storage, [list('A'), list('B', { url: 'https://x/y.json' })]);
  const { syncable, remote } = readSyncable(storage);
  assert.deepEqual(syncable.map(l => l.id), ['A']);
  assert.deepEqual(remote.map(l => l.id), ['B']);
});

test('writeSyncable preserves remote lists it was never given', () => {
  const storage = fakeStorage();
  writeLists(storage, [list('A'), list('B', { url: 'https://x/y.json' })]);
  writeSyncable(storage, [list('A', { name: 'Renamed' })]);
  const after = readLists(storage);
  assert.deepEqual(after.map(l => l.id).sort(), ['A', 'B']);
  assert.equal(after.find(l => l.id === 'A').name, 'Renamed');
  assert.equal(after.find(l => l.id === 'B').url, 'https://x/y.json');
});
