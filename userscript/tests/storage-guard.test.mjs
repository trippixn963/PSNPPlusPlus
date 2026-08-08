import test from 'node:test';
import assert from 'node:assert/strict';
import { installStorageGuard, isQuotaError, describeStorageFailure }
  from '../src/storage-guard.mjs';

/** A storage that writes normally until told to fail. */
const fakeStorage = () => {
  const map = new Map();
  let failure = null;
  return {
    map,
    failWith(error) { failure = error; },
    setItem(key, value) {
      if (failure) throw failure;
      map.set(key, String(value));
    },
    removeItem(key) {
      if (failure) throw failure;
      map.delete(key);
    },
    getItem(key) { return map.has(key) ? map.get(key) : null; }
  };
};

const quota = () => {
  const error = new Error('exceeded');
  error.name = 'QuotaExceededError';
  return error;
};

test('a successful write is untouched', () => {
  const storage = fakeStorage();
  const failures = [];
  installStorageGuard(storage, { onFailure: f => failures.push(f) });
  storage.setItem('psnpp-lists', '{"a":1}');
  assert.equal(storage.getItem('psnpp-lists'), '{"a":1}');
  assert.equal(failures.length, 0, 'nothing to report');
});

test('a failed write is reported and still throws', () => {
  // Rethrowing is the point: swallowing would leave PSNP+ believing it saved.
  const storage = fakeStorage();
  const failures = [];
  installStorageGuard(storage, { onFailure: f => failures.push(f) });
  storage.failWith(quota());

  assert.throws(() => storage.setItem('psnpp-lists', '{"a":1}'), /exceeded/);
  assert.equal(failures.length, 1);
  assert.equal(failures[0].key, 'psnpp-lists');
  assert.equal(failures[0].bytes, '{"a":1}'.length);
  assert.equal(isQuotaError(failures[0].error), true);
});

test('removeItem is guarded too', () => {
  const storage = fakeStorage();
  const failures = [];
  installStorageGuard(storage, { onFailure: f => failures.push(f) });
  storage.failWith(new Error('nope'));
  assert.throws(() => storage.removeItem('psnpp-lists'));
  assert.equal(failures.length, 1);
  assert.equal(failures[0].key, 'psnpp-lists');
});

test('a throwing reporter does not replace the storage error', () => {
  // The reporter exists to surface the failure; it must never become it.
  const storage = fakeStorage();
  installStorageGuard(storage, { onFailure: () => { throw new Error('reporter broke'); } });
  storage.failWith(quota());
  assert.throws(() => storage.setItem('k', 'v'), /exceeded/);
});

test('installing twice does not wrap twice', () => {
  const storage = fakeStorage();
  const failures = [];
  installStorageGuard(storage, { onFailure: f => failures.push(f) });
  installStorageGuard(storage, { onFailure: f => failures.push(f) });
  storage.failWith(quota());
  assert.throws(() => storage.setItem('k', 'v'));
  assert.equal(failures.length, 1, 'one report, not two');
});

test('uninstall restores the originals', () => {
  const storage = fakeStorage();
  const before = storage.setItem;
  const uninstall = installStorageGuard(storage, {});
  assert.notEqual(storage.setItem, before, 'wrapped');
  uninstall();
  assert.equal(storage.setItem, before, 'and put back');
});

test('a null storage is not an error', () => {
  assert.doesNotThrow(() => installStorageGuard(null, {})());
});

test('quota errors are recognised in every spelling browsers use', () => {
  const named = name => Object.assign(new Error('x'), { name });
  const coded = code => Object.assign(new Error('x'), { code });
  assert.equal(isQuotaError(named('QuotaExceededError')), true);
  assert.equal(isQuotaError(named('NS_ERROR_DOM_QUOTA_REACHED')), true, 'Firefox');
  assert.equal(isQuotaError(coded(22)), true);
  assert.equal(isQuotaError(coded(1014)), true, 'older Firefox');
  assert.equal(isQuotaError(new Error('something else')), false);
  assert.equal(isQuotaError(null), false);
});

test('the message names the key and points somewhere useful', () => {
  const full = describeStorageFailure({ key: 'psnpp-lists', error: quota(), bytes: 4096 });
  assert.match(full, /psnpp-lists/);
  assert.match(full, /full/i);
  assert.match(full, /4096/);

  const other = describeStorageFailure({ key: 'psnpp-lists', error: new Error('weird'), bytes: 10 });
  assert.match(other, /weird/);
  assert.doesNotMatch(other, /full/i, 'a non-quota failure must not blame quota');
});

test('it catches a write made the way PSNP+ makes them', () => {
  // PSNP+ writes through one-line save() methods that hold no reference to the
  // storage object beyond `localStorage.setItem(...)`. The guard has to catch
  // those, not merely calls routed through it deliberately — so this models the
  // real shape: a class that captures the storage once and writes through it.
  const storage = fakeStorage();
  const failures = [];
  installStorageGuard(storage, { onFailure: f => failures.push(f) });

  class ListStorage {
    constructor(store) { this._store = store; this._storageKey = 'psnpp-lists'; }
    _save(lists) { this._store.setItem(this._storageKey, JSON.stringify(lists)); }
  }
  const lists = new ListStorage(storage);

  lists._save({ wishlist: [1, 2, 3] });
  assert.equal(storage.getItem('psnpp-lists'), '{"wishlist":[1,2,3]}', 'writes normally');
  assert.equal(failures.length, 0);

  storage.failWith(quota());
  assert.throws(() => lists._save({ wishlist: [1, 2, 3, 4] }));
  assert.equal(failures.length, 1, 'and the failure is seen');
  assert.equal(failures[0].key, 'psnpp-lists');
  // The old bytes are still there — which is exactly why a green "Synced" over
  // this would be a lie: the cycle would read and push these.
  assert.equal(storage.getItem('psnpp-lists'), '{"wishlist":[1,2,3]}');
});
