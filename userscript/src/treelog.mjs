/**
 * PSNP++ - Tree Log Client
 * ========================
 *
 * Sends structured events to the sidecar, which renders them as trees and
 * streams them to Discord.
 *
 * The webhook is NOT here and must never be. This script is served from a
 * public URL out of a public repository, so anything it carries is readable by
 * anyone, and a Discord webhook URL is a credential — whoever holds it can post
 * to the channel. Events go to `POST /api/psnppp/log` behind the same sync key
 * as everything else; only the server sees the webhook.
 *
 * Everything here is FIRE AND FORGET. `log()` returns nothing, never rejects,
 * and is never awaited by the sync cycle. That is the whole contract: the
 * events worth logging are the ones raised while something is already going
 * wrong, and a logger that could fail a sync would turn a bad cycle into a lost
 * write. Every failure mode — no endpoint, no key, a rejecting request, a 500,
 * a body that will not serialise — ends the same way, as a dropped log line and
 * nothing else.
 *
 * Batching, spacing and the 429 circuit live SERVER-side (see treelog.py). They
 * are per-webhook concerns, and a browser tab cannot coordinate them: close the
 * tab and any client-side queue goes with it.
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */

import { gmRequest } from './sync-client.mjs';

// The emoji set that marks an event as a fault (❌ ⚠️ 🚨 💥) lives server-side
// in treelog.py, which is what would route them to a separate webhook. It is
// deliberately NOT duplicated here: two copies of a routing table that nothing
// compares is a drift waiting to happen.

const REQUEST_TIMEOUT_MS = 10000;

/**
 * Post one tree. Returns a promise that always resolves — never rejects.
 *
 * `items` is an array of [key, value] pairs, not an object: the order of a
 * tree's rows carries meaning (what identifies the event comes first), and
 * object key order is not a thing to rely on across engines.
 */
export async function sendTree({ endpoint, key, title, items = [], emoji = '📦', request = gmRequest }) {
  if (!endpoint || !key || !title) return false;
  // Trailing slash stripped the same way sync-client.mjs strips it. Without
  // this, an endpoint stored as ".../api/psnppp/" syncs perfectly and 404s
  // every log line forever — silently, because logging never reports failure.
  try {
    const response = await request({
      method: 'POST',
      url: `${String(endpoint).replace(/\/+$/, '')}/log`,
      headers: { 'Content-Type': 'application/json', 'X-Sync-Key': key },
      data: JSON.stringify({
        title: String(title),
        emoji: String(emoji),
        // Values are stringified HERE rather than server-side so a value that
        // cannot serialise costs one row, not the whole tree.
        items: items.map(([k, v]) => [String(k), safeValue(v)])
      }),
      timeout: REQUEST_TIMEOUT_MS
    });
    return response?.status >= 200 && response?.status < 300;
  } catch {
    return false;
  }
}

function safeValue(value) {
  try {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    return JSON.stringify(value) ?? String(value);
  } catch {
    return '<unrenderable>';
  }
}

/**
 * Bind a logger to one configuration.
 *
 * Returns a `log` that swallows everything, so call sites read as plain
 * statements — `log('Game Added', [...], '➕')` — with no await, no catch, and
 * no way to change the behaviour of the code around them.
 */
export function createTreeLog({ endpoint, key, request = gmRequest } = {}) {
  return function log(title, items, emoji = '📦') {
    // `void`, and no .catch: sendTree is specified never to reject, so a catch
    // here would be unreachable code implying a guarantee that lives elsewhere.
    // Returning nothing is the point — a call site must not be able to await a
    // log line and make the sync wait on Discord.
    void sendTree({ endpoint, key, title, items, emoji, request });
  };
}
