/**
 * Endpoint and secret storage.
 *
 * The secret lives in GM storage rather than in the script file, so the script
 * itself can be committed and shared without leaking a credential.
 */

const ENDPOINT_KEY = 'psnpsync.endpoint';
const SECRET_KEY = 'psnpsync.key';

export const DEFAULT_ENDPOINT = 'https://trippixn.com/api/psnp-sync';

export async function loadConfig() {
  const endpoint = await GM.getValue(ENDPOINT_KEY, DEFAULT_ENDPOINT);
  const key = await GM.getValue(SECRET_KEY, '');
  return { endpoint, key };
}

export async function saveConfig({ endpoint, key }) {
  await GM.setValue(ENDPOINT_KEY, endpoint);
  await GM.setValue(SECRET_KEY, key);
}

/** Ask once for the secret. Returns the saved config, or null if declined. */
export async function promptForConfig() {
  const current = await loadConfig();
  const endpoint = window.prompt('PSNPSync — sync endpoint:', current.endpoint);
  if (endpoint == null) return null;
  const key = window.prompt('PSNPSync — sync key:', current.key);
  if (key == null) return null;
  const config = { endpoint: endpoint.trim(), key: key.trim() };
  await saveConfig(config);
  return config;
}
