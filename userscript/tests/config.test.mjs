import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_ENDPOINT, loadConfig, saveConfig, promptForConfig, isAllowedEndpoint } from '../src/config.mjs';

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
// promptForConfig runs on psnprofiles.com. window.prompt's second argument is
// the input's initial VALUE, so pre-filling it with the stored key paints the
// live credential in plaintext inside a third-party page — visible to anyone
// looking at the screen, to a screenshot, and to any script that reads the
// dialog's surroundings. The endpoint is not sensitive and may still be
// pre-filled.

/**
 * A fake window whose prompt answers are scripted and whose every prompt
 * argument is recorded, so a test can assert on what was DISPLAYED and not
 * merely on what came back.
 */
function installFakeWindow({ prompts = [] } = {}) {
  const promptCalls = [];
  const alerts = [];
  globalThis.window = {
    prompt: (message, initial) => {
      promptCalls.push({ message, initial });
      return prompts.length ? prompts.shift() : null;
    },
    alert: message => { alerts.push(message); }
  };
  return { promptCalls, alerts };
}
function uninstallFakeWindow() { delete globalThis.window; }

test('the stored key is never pre-filled into a prompt', async () => {
  installFakeGM();
  try {
    await saveConfig({ endpoint: 'https://example.test/api', key: 'super-secret-key' });
    const fake = installFakeWindow({ prompts: ['https://example.test/api', ''] });
    try {
      await promptForConfig();
    } finally {
      uninstallFakeWindow();
    }

    // Not in the initial value, and not smuggled into the message either.
    for (const call of fake.promptCalls) {
      assert.equal(String(call.initial ?? '').includes('super-secret-key'), false,
        `secret leaked into a prompt's initial value: ${JSON.stringify(call.initial)}`);
      assert.equal(String(call.message ?? '').includes('super-secret-key'), false,
        `secret leaked into a prompt's message: ${JSON.stringify(call.message)}`);
    }
  } finally {
    uninstallFakeGM();
  }
});

test('cancelling the key prompt keeps the stored key rather than wiping it', async () => {
  installFakeGM();
  try {
    await saveConfig({ endpoint: 'https://example.test/api', key: 'super-secret-key' });
    installFakeWindow({ prompts: ['https://example.test/api', null] });
    try {
      const result = await promptForConfig();
      assert.equal(result, null, 'a cancelled prompt saves nothing');
    } finally {
      uninstallFakeWindow();
    }
    assert.equal((await loadConfig()).key, 'super-secret-key');
  } finally {
    uninstallFakeGM();
  }
});

test('submitting a blank key keeps the stored key (the field starts empty by design)', async () => {
  installFakeGM();
  try {
    await saveConfig({ endpoint: 'https://example.test/api', key: 'super-secret-key' });
    installFakeWindow({ prompts: ['https://other.test/api', '   '] });
    try {
      await promptForConfig();
    } finally {
      uninstallFakeWindow();
    }
    // With nothing pre-filled, "OK on an empty box" is the natural way to say
    // "I only wanted to change the endpoint" — it must not mean "erase my key".
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
    installFakeWindow({ prompts: ['https://example.test/api', '  new-key  '] });
    try {
      await promptForConfig();
    } finally {
      uninstallFakeWindow();
    }
    assert.equal((await loadConfig()).key, 'new-key');
  } finally {
    uninstallFakeGM();
  }
});

test('the endpoint is still pre-filled — it is not a secret', async () => {
  installFakeGM();
  try {
    await saveConfig({ endpoint: 'https://example.test/api', key: 'k' });
    const fake = installFakeWindow({ prompts: [null] });
    try {
      await promptForConfig();
    } finally {
      uninstallFakeWindow();
    }
    assert.equal(fake.promptCalls[0].initial, 'https://example.test/api');
  } finally {
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
    const fake = installFakeWindow({ prompts: ['http://trippixn.com/api/psnppp', 'whatever'] });
    try {
      const result = await promptForConfig();
      assert.equal(result, null);
    } finally {
      uninstallFakeWindow();
    }

    assert.equal(fake.alerts.length, 1, 'the user must be told why');
    assert.match(fake.alerts[0], /https/i);
    // The key prompt must not even be reached, and the good config must stand.
    assert.equal(fake.promptCalls.length, 1);
    assert.deepEqual(await loadConfig(), { endpoint: 'https://good.test/api', key: 'super-secret-key' });
  } finally {
    uninstallFakeGM();
  }
});

test('a loopback endpoint is accepted for local testing', async () => {
  installFakeGM();
  try {
    installFakeWindow({ prompts: ['http://127.0.0.1:8091/api/psnppp', 'local-key'] });
    try {
      await promptForConfig();
    } finally {
      uninstallFakeWindow();
    }
    assert.deepEqual(await loadConfig(), { endpoint: 'http://127.0.0.1:8091/api/psnppp', key: 'local-key' });
  } finally {
    uninstallFakeGM();
  }
});
