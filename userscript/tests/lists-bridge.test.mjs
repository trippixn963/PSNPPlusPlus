import test from 'node:test';
import assert from 'node:assert/strict';
import { LISTS_KEY, readLists, writeLists, readSyncable, writeSyncable, watchLists } from '../src/lists-bridge.mjs';

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

test('readLists filters out null entries', () => {
  // Stored as [null] — Array.isArray check passes, but downstream must not break
  assert.deepEqual(readLists(fakeStorage({ [LISTS_KEY]: '[null]' })), []);
});

test('readLists filters out non-object entries', () => {
  // Stored as [1, 2, "string", true, null] — must filter to safe entries only
  assert.deepEqual(readLists(fakeStorage({ [LISTS_KEY]: '[1, 2, "string", true, null]' })), []);
});

test('readLists keeps well-formed entries and filters bad ones', () => {
  const storage = fakeStorage({
    [LISTS_KEY]: JSON.stringify([
      null,
      { id: 'A', name: 'Good', games: [] },
      'string',
      { id: 'B', name: 'Also good', games: [] },
      123
    ])
  });
  const result = readLists(storage);
  assert.equal(result.length, 2);
  assert.deepEqual(result.map(l => l.id), ['A', 'B']);
});

test('readSyncable does not throw on [null]', () => {
  const storage = fakeStorage({ [LISTS_KEY]: '[null]' });
  // This would have thrown before the fix
  const { syncable, remote } = readSyncable(storage);
  assert.deepEqual(syncable, []);
  assert.deepEqual(remote, []);
});

test('writeSyncable drops remote lists in syncedLists', () => {
  const storage = fakeStorage();
  writeLists(storage, [list('A'), list('R', { url: 'https://x/y.json' })]);

  // Try to write a remote list through writeSyncable (should be dropped with warning)
  writeSyncable(storage, [
    list('A', { name: 'Updated' }),
    list('R', { url: 'https://x/y.json', name: 'Bad' })
  ]);

  const after = readLists(storage);
  // A is updated, R is untouched (dropped from syncedLists, kept from remote)
  assert.equal(after.find(l => l.id === 'A').name, 'Updated');
  assert.equal(after.find(l => l.id === 'R').url, 'https://x/y.json');
});

test('writeSyncable drops id collisions with remote lists', () => {
  const storage = fakeStorage();
  writeLists(storage, [list('A'), list('R', { url: 'https://x/y.json' })]);

  // Try to write a list whose id collides with remote R (should be dropped with warning)
  writeSyncable(storage, [
    list('A', { name: 'Updated' }),
    list('R', { name: 'Collision attempt' }) // id 'R' collides with remote
  ]);

  const after = readLists(storage);
  // A is updated, R collision is dropped, remote R is preserved
  assert.equal(after.find(l => l.id === 'A').name, 'Updated');
  assert.equal(after.find(l => l.id === 'R').url, 'https://x/y.json');
});

test('watchLists fires onChange when the lists key changes via setItem', () => {
  const storage = fakeStorage();
  let callCount = 0;

  const target = createFakeTarget();
  const stop = watchLists(storage, () => { callCount += 1; }, { target, intervalMs: 100000 });

  // Initial state is empty. Now change it via the patched setItem.
  const listA = JSON.stringify([list('A')]);
  storage.setItem(LISTS_KEY, listA);
  target._fireSetItem(LISTS_KEY, listA);

  assert.equal(callCount, 1);
  stop();
});

test('watchLists does not fire onChange for unrelated keys', () => {
  const storage = fakeStorage();
  let callCount = 0;

  const target = createFakeTarget();
  const stop = watchLists(storage, () => { callCount += 1; }, { target, intervalMs: 100000 });

  // Write to an unrelated key through the patched setItem
  storage.setItem('other-key', 'value');
  target._fireSetItem('other-key', 'value');

  assert.equal(callCount, 0);
  stop();
});

test('stop() removes the storage event listener', () => {
  const storage = fakeStorage();
  let callCount = 0;

  const target = createFakeTarget();
  const stop = watchLists(storage, () => { callCount += 1; }, { target, intervalMs: 100000 });

  // First, set a value so storage has content
  const listA = JSON.stringify([list('A')]);
  storage.setItem(LISTS_KEY, listA);

  // Fire a storage event (simulates cross-tab write) with a new value
  const listB = JSON.stringify([list('B')]);
  storage.setItem(LISTS_KEY, listB);
  target._fireStorageEvent(LISTS_KEY);
  const countAfterFirstEvent = callCount;
  assert.equal(countAfterFirstEvent, 1);

  stop();

  // After stop, storage event should not fire the callback
  const listC = JSON.stringify([list('C')]);
  storage.setItem(LISTS_KEY, listC);
  target._fireStorageEvent(LISTS_KEY);
  assert.equal(callCount, 1); // Still the same, no new callback
});

test('stop() restores original setItem only if we are still the top of the chain', () => {
  const storage = fakeStorage();
  const target = createFakeTarget();

  // Save the original before patching
  const originalSetItem = target.Storage.prototype.setItem;

  const stop1 = watchLists(storage, () => {}, { target, intervalMs: 100000 });
  const patchedByWatcher1 = target.Storage.prototype.setItem;

  // Install a second watcher
  const stop2 = watchLists(storage, () => {}, { target, intervalMs: 100000 });
  const patchedByWatcher2 = target.Storage.prototype.setItem;

  // The patches should be different (watcher2's patch wraps watcher1's patch)
  assert.notEqual(patchedByWatcher1, patchedByWatcher2);

  // Stop watcher1 first (out of order)
  stop1();

  // Watcher2's patch should still be in place (because stop1 sees it's not the top)
  assert.equal(target.Storage.prototype.setItem, patchedByWatcher2);

  // Stop watcher2
  stop2();
});

test('onChange exceptions do not propagate out of setItem', () => {
  const storage = fakeStorage();

  const target = createFakeTarget();
  const stop = watchLists(storage, () => {
    throw new Error('Callback error');
  }, { target, intervalMs: 100000 });

  // This should not throw, even though onChange throws
  const listA = JSON.stringify([list('A')]);
  storage.setItem(LISTS_KEY, listA);
  assert.doesNotThrow(() => {
    target._fireSetItem(LISTS_KEY, listA);
  });

  stop();
});

test('onChange that writes to storage does not recurse infinitely', () => {
  const storage = fakeStorage();
  let callCount = 0;

  const target = createFakeTarget();
  const stop = watchLists(storage, () => {
    callCount += 1;
    if (callCount < 100) {
      // This would cause recursion without the reentrancy guard
      const newLists = JSON.stringify([list(`call-${callCount}`)]);
      storage.setItem(LISTS_KEY, newLists);
      target._fireSetItem(LISTS_KEY, newLists);
    }
  }, { target, intervalMs: 100000 });

  const initialLists = JSON.stringify([list('A')]);
  storage.setItem(LISTS_KEY, initialLists);
  target._fireSetItem(LISTS_KEY, initialLists);

  // Should have fired exactly once, not recursed
  assert.equal(callCount, 1);

  stop();
});

/** Helper: create a fake target object with Storage.prototype mock for testing. */
function createFakeTarget() {
  const listeners = {};
  const target = {
    Storage: {
      prototype: {
        // Provide an original setItem that does nothing (will be patched by watchLists)
        setItem() {}
      }
    },
    addEventListener(event, handler) {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(handler);
    },
    removeEventListener(event, handler) {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter(h => h !== handler);
      }
    },
    _fireSetItem(key, value) {
      const setItem = target.Storage.prototype.setItem;
      if (setItem) setItem.call({}, key, value);
    },
    _fireStorageEvent(key) {
      if (listeners['storage']) {
        listeners['storage'].forEach(h => h({ key }));
      }
    }
  };
  return target;
}
