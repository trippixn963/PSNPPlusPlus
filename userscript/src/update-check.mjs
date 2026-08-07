/**
 * PSNP++ - Update Check
 * =====================
 *
 * Tampermonkey polls @updateURL on its own schedule (roughly daily) and
 * installs nothing without the user's say-so — a userscript cannot silently
 * self-update, that would be a security hole. This module exists so the
 * script can tell the user sooner: fetch the same tiny metadata file
 * Tampermonkey itself polls, compare its @version against the running one,
 * and surface an offer to install.
 *
 * `request` is injected the same way sync-client.mjs injects it, so this runs
 * in Node under the test runner. Defaults to `gmRequest`, the GM_xmlhttpRequest
 * wrapper already used for the sync endpoint — trippixn.com is the same host,
 * so no new @connect is needed.
 *
 * This runs ALONGSIDE the sync cycle, never inside it: nothing here is
 * imported by sync-cycle.mjs, and nothing here can make it fail. Every
 * failure mode — a rejecting/throwing request, a non-200 status, an HTML body
 * (the SPA fallback returns 200 + HTML for any unmatched path on this host),
 * a missing or malformed @version — resolves to `{ available: false }`. This
 * function never throws and never returns a rejected promise.
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */

import { gmRequest } from './sync-client.mjs';

const THROTTLE_MS = 30 * 60 * 1000;

/**
 * Pull `@version` out of a userscript metadata block.
 *
 * Returns null rather than throwing on anything that is not a clean dotted
 * numeric version: an absent directive, a non-string body (an HTML fallback
 * page, most of all), or a value that is not purely `\d+(\.\d+)*`. A loose
 * match here (accepting e.g. a pre-release suffix) would let `isNewer` compare
 * against something it was never built to parse.
 */
export function parseVersion(metaText) {
  if (typeof metaText !== 'string') return null;
  const match = metaText.match(/@version\s+(\S+)/);
  if (!match) return null;
  const version = match[1];
  return /^\d+(\.\d+)*$/.test(version) ? version : null;
}

/**
 * Is `latest` a newer dotted numeric version than `current`?
 *
 * Compared segment by segment, numerically. A naive string/lexicographic
 * compare gets this backwards for double-digit segments — `"1.10.0" <
 * "1.2.0"` as strings, because `"1" < "2"` at the second character, even
 * though 1.10.0 is the newer release. Differing segment counts (`1.2` vs
 * `1.2.0`) are padded with 0 rather than compared by length, so they can
 * still tie correctly. Non-numeric junk in a segment parses to NaN, which is
 * treated as 0 rather than thrown — this has to stay safe to call with
 * whatever `parseVersion` handed back, including a value nobody validated.
 */
export function isNewer(latest, current) {
  const segments = value =>
    String(value ?? '').split('.').map(part => {
      const n = Number.parseInt(part, 10);
      return Number.isFinite(n) ? n : 0;
    });
  const a = segments(latest);
  const b = segments(current);
  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i += 1) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    if (av !== bv) return av > bv;
  }
  return false;
}

/**
 * Check for a newer version, throttled to once per 30 minutes.
 *
 * `loadState`/`saveState` persist `{ checkedAt, available, latest }` in GM
 * storage (the same injection pattern as `loadBase`/`saveBase` in main.mjs),
 * so the throttle survives across page loads within a browsing session — a
 * user with ten psnprofiles.com tabs open does not fire ten requests.
 *
 * The verdict is cached and returned on every throttled call, success or
 * failure alike: a dead endpoint gets rechecked at the same 30-minute cadence
 * as a healthy one, not hammered on every page load just because it happened
 * to fail once.
 */
export async function checkForUpdate({
  currentVersion, metaUrl, request = gmRequest, now = Date.now(), loadState, saveState
}) {
  let state = null;
  try {
    state = await loadState();
  } catch {
    state = null;
  }
  if (state && typeof state.checkedAt === 'number' && now - state.checkedAt < THROTTLE_MS) {
    return { available: Boolean(state.available), latest: state.latest ?? null };
  }

  let result = { available: false, latest: null };
  try {
    const response = await request({ method: 'GET', url: metaUrl });
    if (response && response.status === 200) {
      const latest = parseVersion(response.responseText);
      if (latest != null) {
        result = { available: isNewer(latest, currentVersion), latest };
      }
    }
  } catch {
    // Network error, timeout, abort, or a throwing fake in tests — the check
    // must never surface as a failure. `result` stays the not-available default.
  }

  try {
    await saveState({ checkedAt: now, available: result.available, latest: result.latest });
  } catch {
    // Persistence failing must not fail the check itself — it just means the
    // next call within the window re-requests instead of reading a cache.
  }

  return result;
}
