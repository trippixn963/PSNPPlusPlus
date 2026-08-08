import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DISPOSABLE_KEYS, STORAGE_WARN_BYTES,
  checkPsnpPlusPresent, measurePsnpStorage, checkHealth, clearDisposableCaches, describeHealth
} from '../src/health.mjs';

/** Storage stand-in with the enumeration API measurePsnpStorage walks. */
const fakeStorage = (initial = {}) => {
  const data = { ...initial };
  return {
    get length() { return Object.keys(data).length; },
    key: i => Object.keys(data)[i] ?? null,
    getItem: k => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = String(v); },
    removeItem: k => { delete data[k]; },
    has: k => k in data
  };
};

const fakeDoc = ({ ready = 'complete', logoText = 'PSNProfilesPSNP+ v11.14', hasLogo = true } = {}) => ({
  readyState: ready,
  querySelector: sel => (sel === 'div.logo' && hasLogo ? { textContent: logoText } : null)
});

// --- is PSNP+ running -------------------------------------------------------

test('the badge present means running', () => {
  assert.equal(checkPsnpPlusPresent(fakeDoc()), 'running');
});

test('the badge absent on a finished page means missing', () => {
  assert.equal(checkPsnpPlusPresent(fakeDoc({ logoText: 'PSNProfiles' })), 'missing');
});

test('an unfinished page is unknown, never missing', () => {
  // PSNP+ draws its badge in its DOMContentLoaded pass. Calling it "missing"
  // before then would put a scary message on the chip during every page load.
  assert.equal(checkPsnpPlusPresent(fakeDoc({ ready: 'loading', logoText: 'PSNProfiles' })), 'unknown');
  assert.equal(checkPsnpPlusPresent(fakeDoc({ ready: 'interactive', logoText: 'PSNProfiles' })), 'unknown');
});

test('no logo at all is unknown — that is psnprofiles changing, not PSNP+ failing', () => {
  assert.equal(checkPsnpPlusPresent(fakeDoc({ hasLogo: false })), 'unknown');
});

test('a hostile or absent document is unknown, not a throw', () => {
  assert.equal(checkPsnpPlusPresent(null), 'unknown');
  assert.equal(checkPsnpPlusPresent({}), 'unknown');
  assert.equal(checkPsnpPlusPresent({
    readyState: 'complete',
    querySelector() { throw new Error('hostile'); }
  }), 'unknown');
});

// --- storage ----------------------------------------------------------------

test('only PSNP+ and PSNP++ keys are counted', () => {
  const storage = fakeStorage({
    'psnpp-lists': 'x'.repeat(100),
    'psnppp.base': 'y'.repeat(50),
    'something-else': 'z'.repeat(10000)
  });
  const { bytes, keys } = measurePsnpStorage(storage);
  assert.equal(keys.some(k => k.key === 'something-else'), false);
  assert.equal(bytes, ('psnpp-lists'.length + 100) + ('psnppp.base'.length + 50));
});

test('keys come back heaviest first, so a caller can name the culprit', () => {
  const storage = fakeStorage({ 'psnpp-sessions': 'a'.repeat(10), 'psnpp-lists': 'b'.repeat(500) });
  assert.equal(measurePsnpStorage(storage).keys[0].key, 'psnpp-lists');
});

test('a storage that refuses to enumerate reports zero rather than throwing', () => {
  const hostile = { get length() { throw new Error('nope'); } };
  assert.doesNotThrow(() => measurePsnpStorage(hostile));
  assert.equal(measurePsnpStorage(hostile).bytes, 0);
});

// --- clearing ---------------------------------------------------------------

test('clearing drops the caches and nothing else', () => {
  const storage = fakeStorage({
    'psnpp-lists': 'THE LISTS',
    'psnpp-gameslist': 'THE ONLY PROGRESS HISTORY THAT EXISTS',
    'psnpp-settings': 'PREFS',
    'psnpp-scriptstate': 'ACTIVE CHECKLIST',
    'psnpp-sessions': 'cache',
    'psnpp-guides': 'cache'
  });
  clearDisposableCaches(storage);
  assert.equal(storage.has('psnpp-lists'), true);
  assert.equal(storage.has('psnpp-gameslist'), true, 'gameslist looks like a cache and is not');
  assert.equal(storage.has('psnpp-settings'), true);
  assert.equal(storage.has('psnpp-scriptstate'), true);
  assert.equal(storage.has('psnpp-sessions'), false);
  assert.equal(storage.has('psnpp-guides'), false);
});

test('gameslist is deliberately not in the disposable list', () => {
  assert.equal(DISPOSABLE_KEYS.includes('psnpp-gameslist'), false);
  assert.equal(DISPOSABLE_KEYS.includes('psnpp-lists'), false);
  assert.equal(DISPOSABLE_KEYS.includes('psnpp-scriptstate'), false);
});

test('clearing reports the bytes it freed and survives a key that will not go', () => {
  const storage = fakeStorage({ 'psnpp-sessions': 'abcde', 'psnpp-guides': 'fg' });
  const original = storage.removeItem;
  storage.removeItem = k => { if (k === 'psnpp-sessions') throw new Error('locked'); original(k); };
  assert.doesNotThrow(() => clearDisposableCaches(storage));
  assert.equal(storage.has('psnpp-guides'), false, 'one bad key does not abandon the rest');
});

// --- what the chip says -----------------------------------------------------

test('a healthy page says nothing at all', () => {
  const storage = fakeStorage({ 'psnpp-lists': 'small' });
  assert.equal(describeHealth(checkHealth({ storage, doc: fakeDoc() })), null);
});

test('PSNP+ missing is reported, and says the lists are safe', () => {
  const storage = fakeStorage({ 'psnpp-lists': 'small' });
  const message = describeHealth(checkHealth({ storage, doc: fakeDoc({ logoText: 'PSNProfiles' }) }));
  assert.match(message, /PSNP\+ did not load/);
  assert.match(message, /safe/);
});

test('a tight quota is reported and names the refetchable share', () => {
  const storage = fakeStorage({
    'psnpp-lists': 'x'.repeat(3 * 1024 * 1024),
    'psnpp-guides': 'y'.repeat(2 * 1024 * 1024)
  });
  const health = checkHealth({ storage, doc: fakeDoc() });
  assert.equal(health.storageTight, true);
  const message = describeHealth(health);
  assert.match(message, /Near the browser limit/);
  assert.match(message, /refetchable cache/);
});

test('an unknown PSNP+ never produces a message', () => {
  const storage = fakeStorage({ 'psnpp-lists': 'small' });
  const health = checkHealth({ storage, doc: fakeDoc({ ready: 'loading', logoText: 'PSNProfiles' }) });
  assert.equal(describeHealth(health), null);
});

test('the warn threshold is what actually gates the message', () => {
  const storage = fakeStorage({ 'psnpp-lists': 'x'.repeat(1000) });
  assert.equal(checkHealth({ storage, doc: fakeDoc() }).storageTight, false);
  assert.equal(checkHealth({ storage, doc: fakeDoc(), warnBytes: 500 }).storageTight, true);
  assert.equal(STORAGE_WARN_BYTES, 4 * 1024 * 1024);
});

test('two PSNP+ badges means both copies are running', () => {
  // PSNP++ now ships PSNP+. If the standalone is still enabled, both write to
  // the same keys independently and can overwrite each other's list edits.
  const doc = {
    readyState: 'complete',
    querySelector: sel => (sel === 'div.logo'
      ? { textContent: 'PSNProfilesPSNP+ v11.14PSNP+ v11.14' } : null)
  };
  assert.equal(checkPsnpPlusPresent(doc), 'duplicate');
});

test('the duplicate warning tells the user what to actually do', () => {
  const storage = { length: 0, key: () => null, getItem: () => null };
  const doc = {
    readyState: 'complete',
    querySelector: () => ({ textContent: 'PSNP+ v11.14PSNP+ v11.14' })
  };
  const message = describeHealth(checkHealth({ storage, doc }));
  assert.match(message, /Two copies of PSNP\+/);
  assert.match(message, /disable the separate PSNP\+ script/);
});

test('one badge is still just running', () => {
  const doc = {
    readyState: 'complete',
    querySelector: () => ({ textContent: 'PSNProfilesPSNP+ v11.14' })
  };
  assert.equal(checkPsnpPlusPresent(doc), 'running');
});
