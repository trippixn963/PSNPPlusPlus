import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_ENDPOINT, loadConfig, saveConfig, applyConfig, isAllowedEndpoint,
  describeStoredKey, INSECURE_ENDPOINT_MESSAGE } from '../src/config.mjs';

/** A fake GM.* backed by a Map, so config.mjs can be exercised in node. */
function installFakeGM() {
  const store = new Map();
  globalThis.GM = {
    async getValue(key, fallback) {
      return store.has(key) ? store.get(key) : fallback;
    },
    async setValue(key, value) {
      store.set(key, value);
    },
    async deleteValue(key) {
      store.delete(key);
    }
  };
  return store;
}

function uninstallFakeGM() {
  delete globalThis.GM;
}

test('loadConfig returns the default endpoint and an empty key when nothing is stored', async () => {
  installFakeGM();
  try {
    const config = await loadConfig();
    assert.deepEqual(config, { endpoint: DEFAULT_ENDPOINT, key: '' });
  } finally {
    uninstallFakeGM();
  }
});

test('saveConfig round-trips through loadConfig', async () => {
  installFakeGM();
  try {
    await saveConfig({ endpoint: 'https://example.com/api/psnppp', key: 'secret-key' });
    const config = await loadConfig();
    assert.deepEqual(config, { endpoint: 'https://example.com/api/psnppp', key: 'secret-key' });
  } finally {
    uninstallFakeGM();
  }
});

test('loadConfig returns a stored endpoint over the default', async () => {
  installFakeGM();
  try {
    await saveConfig({ endpoint: 'https://custom.host/sync', key: '' });
    const config = await loadConfig();
    assert.equal(config.endpoint, 'https://custom.host/sync');
    assert.notEqual(config.endpoint, DEFAULT_ENDPOINT);
  } finally {
    uninstallFakeGM();
  }
});

// --- the secret must never be handed to a page we do not control ------------
//
// The settings form renders inside psnprofiles.com. Anything it can say about
// the stored key is visible to whoever is looking at that screen, to a
// screenshot, and to the page itself — so it may report only THAT a key is
// stored, never any part of it and not even its length. (panel.mjs holds the
// matching rule for the input's value; this is the text beside it.)

test('the stored key is never rendered, not even in part', () => {
  const hint = describeStoredKey('super-secret-key');
  assert.equal(hint.includes('super-secret-key'), false, `secret leaked: ${hint}`);
  assert.equal(/secret|sekrit/i.test(hint), false, `secret leaked: ${hint}`);
  // Not its length either — a 16-character mask is a 16-character disclosure.
  assert.equal(/•{5,}/.test(hint), false, `the mask discloses a length: ${hint}`);
  assert.match(hint, /already stored/i);
});

test('with nothing stored the form says so rather than showing an empty hint', () => {
  const hint = describeStoredKey('');
  assert.match(hint, /none stored/i);
});

test('submitting a blank key keeps the stored key (the field starts empty by design)', async () => {
  installFakeGM();
  try {
    await saveConfig({ endpoint: 'https://example.test/api', key: 'super-secret-key' });
    // With nothing pre-filled, "submit an empty box" is the natural way to say
    // "I only wanted to change the endpoint" — it must not mean "erase my key".
    const result = await applyConfig({ endpoint: 'https://other.test/api', key: '   ' });
    assert.equal(result.ok, true);

    const config = await loadConfig();
    assert.equal(config.key, 'super-secret-key');
    assert.equal(config.endpoint, 'https://other.test/api');
  } finally {
    uninstallFakeGM();
  }
});

test('a typed key replaces the stored one', async () => {
  installFakeGM();
  try {
    await saveConfig({ endpoint: 'https://example.test/api', key: 'old-key' });
    await applyConfig({ endpoint: 'https://example.test/api', key: '  new-key  ' });
    assert.equal((await loadConfig()).key, 'new-key');
  } finally {
    uninstallFakeGM();
  }
});

test('applyConfig never reaches for a browser dialog', async () => {
  // The whole point of the panel is that these three are gone from the settings
  // path. A stray prompt() here would be a regression, so make one fatal.
  installFakeGM();
  globalThis.window = {
    prompt: () => { throw new Error('applyConfig used window.prompt'); },
    alert: () => { throw new Error('applyConfig used window.alert'); },
    confirm: () => { throw new Error('applyConfig used window.confirm'); }
  };
  try {
    assert.equal((await applyConfig({ endpoint: 'https://ok.test/api', key: 'k' })).ok, true);
    assert.equal((await applyConfig({ endpoint: 'http://bad.test/api', key: 'k' })).ok, false);
  } finally {
    delete globalThis.window;
    uninstallFakeGM();
  }
});

// --- a plaintext endpoint would send the key unencrypted --------------------
//
// The key travels in an X-Sync-Key request header. One typo'd `http://` and it
// crosses the network in the clear, on every single cycle, silently. Loopback
// is exempt so the sidecar can be run locally.

test('isAllowedEndpoint accepts https and loopback http, and nothing else', () => {
  for (const url of [
    'https://trippixn.com/api/psnppp',
    'https://example.test',
    'http://localhost:8091/api/psnppp',
    'http://localhost',
    'http://127.0.0.1:8091/api/psnppp'
  ]) {
    assert.equal(isAllowedEndpoint(url), true, `${url} must be allowed`);
  }

  for (const url of [
    'http://trippixn.com/api/psnppp',     // the typo this exists to catch
    'http://example.test',
    'http://127.0.0.1.evil.test',         // loopback-looking, not loopback
    'http://localhost.evil.test',
    'ftp://trippixn.com',
    'javascript:alert(1)',
    'file:///etc/passwd',
    'trippixn.com/api/psnppp',            // no scheme at all
    '//trippixn.com/api/psnppp',
    '',
    '   ',
    'https://'
  ]) {
    assert.equal(isAllowedEndpoint(url), false, `${url} must be rejected`);
  }
});

test('a plaintext endpoint is rejected on save, and nothing is stored', async () => {
  installFakeGM();
  try {
    await saveConfig({ endpoint: 'https://good.test/api', key: 'super-secret-key' });

    const result = await applyConfig({ endpoint: 'http://trippixn.com/api/psnppp', key: 'whatever' });

    assert.equal(result.ok, false);
    // The user must be told WHY, and the reason has to name the rule. This
    // message used to be a window.alert; it now lands in the panel's message
    // region, and losing it there would be losing the only explanation for why
    // what they typed did nothing.
    assert.match(result.message, /https/i);
    assert.equal(result.message, INSECURE_ENDPOINT_MESSAGE);
    // The good config must stand — including the key that came with the
    // rejected submission.
    assert.deepEqual(await loadConfig(), { endpoint: 'https://good.test/api', key: 'super-secret-key' });
  } finally {
    uninstallFakeGM();
  }
});

test('a loopback endpoint is accepted for local testing', async () => {
  installFakeGM();
  try {
    const result = await applyConfig({ endpoint: 'http://127.0.0.1:8091/api/psnppp', key: 'local-key' });
    assert.equal(result.ok, true);
    assert.deepEqual(await loadConfig(), { endpoint: 'http://127.0.0.1:8091/api/psnppp', key: 'local-key' });
  } finally {
    uninstallFakeGM();
  }
});

test('applyConfig trims the endpoint and survives junk input without throwing', async () => {
  installFakeGM();
  try {
    assert.equal((await applyConfig({ endpoint: '  https://ok.test/api  ', key: 'k' })).ok, true);
    assert.equal((await loadConfig()).endpoint, 'https://ok.test/api');

    for (const bad of [undefined, null, {}, { endpoint: null, key: null }, { endpoint: 42 }]) {
      const result = await applyConfig(bad);
      assert.equal(result.ok, false, JSON.stringify(bad));
    }
    // ...and none of that disturbed what was already stored.
    assert.deepEqual(await loadConfig(), { endpoint: 'https://ok.test/api', key: 'k' });
  } finally {
    uninstallFakeGM();
  }
});
