/**
 * PSNP++ - Config
 * ===============
 *
 * Endpoint and secret storage.
 *
 * The secret lives in GM storage rather than in the script file, so the script
 * itself can be committed and shared without leaking a credential.
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */

const ENDPOINT_KEY = 'psnppp.endpoint';
const SECRET_KEY = 'psnppp.key';

export const DEFAULT_ENDPOINT = 'https://trippixn.com/api/psnppp';

export async function loadConfig() {
  const endpoint = await GM.getValue(ENDPOINT_KEY, DEFAULT_ENDPOINT);
  const key = await GM.getValue(SECRET_KEY, '');
  return { endpoint, key };
}

export async function saveConfig({ endpoint, key }) {
  await GM.setValue(ENDPOINT_KEY, endpoint);
  await GM.setValue(SECRET_KEY, key);
}

/**
 * Is this an endpoint the sync key can safely be sent to?
 *
 * The key travels as an `X-Sync-Key` REQUEST HEADER on every cycle. Over
 * `http://` that header crosses the network in cleartext, on every sync,
 * forever, with nothing in the UI to suggest anything is wrong — so a single
 * mistyped scheme quietly turns the credential into public information.
 *
 * Loopback is the one exemption, so the sidecar can be run against a local
 * checkout. It is matched on `hostname`, not on a prefix of the string:
 * `http://127.0.0.1.evil.test` and `http://localhost.evil.test` are ordinary
 * public hosts that merely start with the right characters, and a substring
 * test would hand them the key.
 *
 * Checked when the endpoint is SAVED rather than when it is used: an endpoint
 * already in storage keeps working, and the user is told at the moment they can
 * still fix the typo.
 */
export function isAllowedEndpoint(endpoint) {
  let parsed;
  try {
    parsed = new URL(String(endpoint));
  } catch {
    return false;
  }
  if (parsed.protocol === 'https:') return true;
  if (parsed.protocol !== 'http:') return false;
  return parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
}

/**
 * Ask for the endpoint and secret. Returns the saved config, or null if
 * declined or rejected.
 *
 * The key field starts EMPTY. `window.prompt`'s second argument is the input's
 * initial value, and this dialog opens inside psnprofiles.com — a page we do
 * not control — so pre-filling it painted the live credential in plaintext on
 * a third party's page every time the user opened settings just to check the
 * endpoint. The mask below reports only THAT a key is stored, never any part of
 * it and not even its length.
 *
 * That leaves "OK on an empty box" as the natural way to say "I did not want to
 * change the key", so a blank submission KEEPS the stored key; only a non-empty
 * entry replaces it. Cancelling keeps everything. The cost is that this dialog
 * cannot erase a key — an acceptable trade against silently wiping the one
 * credential the user has, and re-entering a key is always possible.
 */
export async function promptForConfig() {
  const current = await loadConfig();

  const rawEndpoint = window.prompt('PSNP++ — sync endpoint:', current.endpoint);
  if (rawEndpoint == null) return null;
  const endpoint = rawEndpoint.trim();
  if (!isAllowedEndpoint(endpoint)) {
    window.alert(
      `PSNP++ — that endpoint was not saved:\n\n${endpoint}\n\n` +
      'The sync key is sent as a request header, so the endpoint must be ' +
      'https:// (http:// is allowed only for localhost / 127.0.0.1).'
    );
    return null;
  }

  const rawKey = window.prompt(
    'PSNP++ — sync key ' +
    `(${current.key ? 'one is already stored: ••••••••' : 'none stored yet'}).\n\n` +
    'Type a new key, or leave this blank to keep the stored one.',
    ''
  );
  if (rawKey == null) return null;
  const typedKey = rawKey.trim();

  const config = { endpoint, key: typedKey === '' ? current.key : typedKey };
  await saveConfig(config);
  return config;
}
