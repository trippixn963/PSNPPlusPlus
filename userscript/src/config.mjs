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

// FORKING? CHANGE THIS. It is the author's server, and a build that keeps it
// points every one of your users at a host they have no key for and you do not
// control. Change @connect in userscript/banner.txt to match, or Tampermonkey
// blocks the request. An installed copy can also be repointed at runtime from
// the status chip's right-click menu, which is enough for testing.
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

const AUTO_CONFIRM_REMOVE_KEY = 'psnppp.autoConfirmRemove';

/** On, because the owner asked for it (see auto-confirm.mjs). */
export const AUTO_CONFIRM_REMOVE_DEFAULT = true;

/**
 * Should PSNP+'s "Are you sure you want to remove X?" answer itself?
 *
 * Read and written on its OWN key rather than folded into loadConfig/saveConfig.
 * Those two are the credential record: loadConfig runs on every sync cycle and
 * feeds `isAllowedEndpoint`, and saveConfig is the settings form's write. A
 * display preference riding in that object would have to survive every
 * validation branch in applyConfig — including the "blank key keeps the stored
 * one" rule — for no benefit, and a bug there costs the user their sync key.
 *
 * Only an explicit `false` turns it off. Anything else in storage — absent,
 * null, a string left by some other build — reads as on, which is the state the
 * owner asked for and the one whose failure mode is "a dialog I did not want",
 * never "a dialog I needed and did not get".
 */
export async function loadAutoConfirmRemove() {
  const stored = await GM.getValue(AUTO_CONFIRM_REMOVE_KEY, AUTO_CONFIRM_REMOVE_DEFAULT);
  return stored !== false;
}

/**
 * Store the toggle as a real boolean, never as whatever the caller passed.
 *
 * `=== true` rather than a truthiness coercion: the read above turns on for
 * anything that is not exactly `false`, so writing a truthy non-boolean (a
 * string 'off', say) would store a value that reads back as ON forever with no
 * way to switch it off from the panel.
 */
export async function saveAutoConfirmRemove(enabled) {
  await GM.setValue(AUTO_CONFIRM_REMOVE_KEY, enabled === true);
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
 * What the user is told when a rejected endpoint is not saved.
 *
 * A constant rather than a string built at the call site: this is the entire
 * explanation for why the thing they just typed did not take effect, and it has
 * to survive the move off `window.alert` intact. It names the reason (the key
 * is a header), the rule (https), and the one exception (loopback).
 */
export const INSECURE_ENDPOINT_MESSAGE =
  'That endpoint was not saved. The sync key is sent as a request header, so ' +
  'the endpoint must be https:// (http:// is allowed only for localhost or ' +
  '127.0.0.1).';

/**
 * Everything a settings form is allowed to say about the stored key.
 *
 * Never the key, never a prefix of it, and not even its length — this string is
 * rendered inside psnprofiles.com, a page we do not control.
 */
export function describeStoredKey(key) {
  return key ? 'One is already stored. Leave this blank to keep it.' : 'None stored yet.';
}

/**
 * Validate and save what the settings form was given.
 *
 * Returns `{ ok: true, config }` or `{ ok: false, message }` for a REJECTED
 * endpoint, rather than throwing or alerting, so the caller can put the failure
 * wherever the user is already looking. Validation runs before any write, so a
 * rejected endpoint leaves the previous endpoint and key both standing.
 *
 * Storage failure is the other kind and is NOT converted: `saveConfig`'s two
 * `GM.setValue` calls are not atomic, so a rejection from the second one can
 * leave the endpoint written and the key not. That rejects out of here on
 * purpose — the caller (openSettings) logs it and shows it — because reporting
 * `{ ok: false }` would tell the user nothing was saved when something was.
 *
 * A blank key KEEPS the stored one. The form's key field starts empty by
 * design (see panel.mjs), which makes "submit an empty box" the natural way to
 * say "I only wanted to change the endpoint" — it must not mean "erase my key".
 * The cost is that this form cannot delete a key, which is a good trade against
 * silently wiping the one credential the user has.
 */
export async function applyConfig(submitted) {
  // Read off a possibly-null argument rather than destructured in the
  // signature: a default parameter only covers `undefined`, so `applyConfig(null)`
  // would throw a TypeError straight out of the settings form's Save button —
  // past the panel's `{ ok, message }` contract and into an unhandled rejection
  // with nothing on screen to show for it.
  const endpoint = String(submitted?.endpoint ?? '').trim();
  const rawKey = submitted?.key;
  if (!isAllowedEndpoint(endpoint)) {
    return { ok: false, message: INSECURE_ENDPOINT_MESSAGE };
  }
  const current = await loadConfig();
  const typedKey = String(rawKey ?? '').trim();
  const config = { endpoint, key: typedKey === '' ? current.key : typedKey };
  await saveConfig(config);
  return { ok: true, config };
}
