/**
 * PSNP++ - Health
 * ===============
 *
 * Two questions PSNP+ never answers for itself: is it actually running, and is
 * its storage about to fill up.
 *
 * Both matter because PSNP+ fails quietly. Its bootstrap swallows a throw into
 * `console.error`, so a psnprofiles markup change makes the page render plain
 * and nothing says why. And not one `localStorage.setItem` in its entire bundle
 * is wrapped in a try/catch — on a full quota, adding a game to a list appears
 * to work in the page and simply is not saved. That second one is the failure
 * PSNP++ cares about most: it is the only way a list edit can vanish that our
 * own sync cannot see, because the edit never reached storage to be synced.
 *
 * Everything here degrades to "unknown" rather than to "broken". A false alarm
 * on every page load would be worse than no check at all.
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */

/**
 * PSNP+ appends `PSNP+ v<version>` into `div.logo` from `_appendScriptInfo`,
 * which runs in its DOMContentLoaded pass. Its presence is the cheapest proof
 * that PSNP+ got all the way through its own startup.
 */
const BADGE_CONTAINER = 'div.logo';
const BADGE_PREFIX = 'PSNP+ v';

/**
 * The PSNP+ stores that are pure caches: public data on a TTL, or scraped data
 * it refetches on its own. Clearing any of these costs a refetch and nothing
 * else.
 *
 * Deliberately NOT here: `psnpp-lists` (the actual lists), `psnpp-settings`,
 * `psnpp-scriptstate` (holds the active guide checklist), and `psnpp-gameslist`
 * — that last one looks like a cache and is not. It is the only record that
 * your game progress was ever at a given value on a given day, and PSNP+
 * overwrites each entry silently on the next visit. Clearing it destroys
 * history that cannot be rebuilt.
 */
export const DISPOSABLE_KEYS = Object.freeze([
  'psnpp-platprices',
  'psnpp-sessions',
  'psnpp-guides',
  'psnpp-unobtainabletrophies',
  'psnpp-donators',
  'psnpp-shutdowns'
]);

/** Browsers give an origin ~5MB. Warn with enough room left to act. */
export const STORAGE_WARN_BYTES = 4 * 1024 * 1024;

const PSNP_PREFIX = 'psnpp-';

/**
 * Is PSNP+ running?
 *
 * Returns 'running', 'missing', or 'unknown' — and 'unknown' is the important
 * one. Before the page finishes loading, PSNP+ legitimately has not drawn its
 * badge yet, so an absent badge means nothing. Reporting 'missing' then would
 * put a scary message on the chip during every single page load.
 */
export function checkPsnpPlusPresent(doc) {
  try {
    if (doc == null || typeof doc.querySelector !== 'function') return 'unknown';
    if (doc.readyState !== 'complete') return 'unknown';

    const container = doc.querySelector(BADGE_CONTAINER);
    // No logo at all means psnprofiles changed its own markup. That tells us
    // nothing about PSNP+, and guessing would be exactly the false alarm this
    // function exists to avoid.
    if (container == null) return 'unknown';

    const text = typeof container.textContent === 'string' ? container.textContent : '';
    return text.includes(BADGE_PREFIX) ? 'running' : 'missing';
  } catch {
    return 'unknown';
  }
}

/**
 * How many bytes PSNP+ and PSNP++ are holding in localStorage, per key.
 *
 * Counts key and value together, since both occupy the quota. Sorted heaviest
 * first so the caller can name the culprit rather than just the total.
 */
export function measurePsnpStorage(storage) {
  const keys = [];
  let bytes = 0;
  try {
    const total = typeof storage.length === 'number' ? storage.length : 0;
    for (let i = 0; i < total; i += 1) {
      const key = storage.key(i);
      if (typeof key !== 'string') continue;
      if (!key.startsWith(PSNP_PREFIX) && !key.startsWith('psnppp.')) continue;
      const value = storage.getItem(key);
      const size = key.length + (typeof value === 'string' ? value.length : 0);
      keys.push({ key, bytes: size });
      bytes += size;
    }
  } catch {
    // An enumeration that throws tells us nothing; report what we counted.
  }
  keys.sort((a, b) => b.bytes - a.bytes);
  return { bytes, keys };
}

/**
 * Both checks in one call. Never throws — it runs alongside the sync.
 */
export function checkHealth({ storage, doc, warnBytes = STORAGE_WARN_BYTES }) {
  const psnpPlus = checkPsnpPlusPresent(doc);
  const { bytes, keys } = measurePsnpStorage(storage);
  return {
    psnpPlus,
    bytes,
    keys,
    storageTight: bytes >= warnBytes,
    disposableBytes: keys
      .filter(entry => DISPOSABLE_KEYS.includes(entry.key))
      .reduce((sum, entry) => sum + entry.bytes, 0)
  };
}

/**
 * Drop the disposable caches, returning how many bytes that freed.
 *
 * Only ever removes keys named in DISPOSABLE_KEYS — never a computed match, so
 * a key added later cannot be swept up by a pattern nobody re-read.
 */
export function clearDisposableCaches(storage) {
  let freed = 0;
  for (const key of DISPOSABLE_KEYS) {
    try {
      const value = storage.getItem(key);
      if (value == null) continue;
      freed += key.length + value.length;
      storage.removeItem(key);
    } catch {
      // One key refusing to go is not a reason to abandon the rest.
    }
  }
  return freed;
}

const mb = bytes => `${(bytes / (1024 * 1024)).toFixed(1)}MB`;

/**
 * A line for the chip, or null when there is nothing worth saying.
 *
 * Silence is the default. A health check that always has an opinion becomes
 * noise the user learns to ignore, and then it is worth nothing on the day it
 * is right.
 */
export function describeHealth(health) {
  if (health == null) return null;
  if (health.psnpPlus === 'missing') {
    return 'PSNP+ did not load on this page. Your lists are safe, but PSNP+ is not running.';
  }
  if (health.storageTight) {
    const freeable = health.disposableBytes > 0
      ? ` ${mb(health.disposableBytes)} of that is refetchable cache.`
      : '';
    return `PSNP+ storage is at ${mb(health.bytes)}. Near the browser limit, edits can fail to save.${freeable}`;
  }
  return null;
}
