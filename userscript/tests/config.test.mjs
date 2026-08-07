import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_ENDPOINT, loadConfig, saveConfig } from '../src/config.mjs';

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
