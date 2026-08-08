/**
 * PSNP++ - Compare+ bridge
 * ========================
 *
 * Reads and writes PSNP+'s `psnpp-compareplus` map: trophy list id -> the
 * comma-separated PSN IDs you compare that game against.
 *
 * THIS IS THE ONE THE FORK BOUGHT. Every other PSNP+ store is a localStorage
 * key any userscript on the page can read. Compare+ is not: PSNP+ puts it
 * through its own `HybridStorage`, which prefers GM storage, and GM storage is
 * per-script — a separate companion userscript is in a different namespace and
 * simply cannot see it. It was the one thing cross-device sync could not carry.
 * Vendored, PSNP+ and PSNP++ are ONE script with ONE GM namespace, so
 * `GM.getValue('psnpp-compareplus')` returns exactly the bytes PSNP+ wrote.
 *
 * HybridStorage's rules are reimplemented here rather than called, because
 * reaching into a webpack module by its minified export name is a dependency on
 * something no patch guards and no build failure would announce. They are
 * copied deliberately and must not drift:
 *
 *   - read: GM first; fall back to localStorage when GM has nothing. A profile
 *     that used an older PSNP+ still has its data in localStorage, and reading
 *     GM alone would silently report it as empty.
 *   - write: REMOVE the localStorage copy, then write GM. Leaving both would
 *     mean two sources of truth, and the stale one wins the moment GM is
 *     cleared.
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */

export const COMPARE_KEY = 'psnpp-compareplus';

/** Whether a parsed value is the flat id -> string map PSNP+ stores. */
const isMap = value => value != null && typeof value === 'object' && !Array.isArray(value);

/**
 * The Compare+ map, or {} for anything unreadable.
 *
 * Never throws and never rejects. A malformed blob is treated as empty for the
 * same reason loadBase does it: the alternative is a cycle that throws forever
 * with no way out, and the recovery here costs nothing — the next write from
 * PSNP+ rebuilds it.
 *
 * Values are coerced to strings. PSNP+ only ever stores the text of an input
 * box, so anything else came from a corrupted blob or a hand-edited export, and
 * pushing it to the server would spread the corruption to every device.
 */
export async function readCompareValues({ gm = globalThis.GM, storage = globalThis.localStorage } = {}) {
  let raw = null;
  try {
    if (gm?.getValue != null) raw = await gm.getValue(COMPARE_KEY, null);
  } catch {
    raw = null;
  }
  if (raw == null) {
    try {
      raw = storage?.getItem?.(COMPARE_KEY) ?? null;
    } catch {
      raw = null;
    }
  }
  if (raw == null) return {};

  let parsed;
  try {
    parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return {};
  }
  if (!isMap(parsed)) return {};

  const out = {};
  for (const [id, value] of Object.entries(parsed)) {
    if (typeof value === 'string') out[id] = value;
    else if (typeof value === 'number' || typeof value === 'boolean') out[id] = String(value);
  }
  return out;
}

/**
 * Write the map back the way PSNP+ would have.
 *
 * Returns true when it landed. Never throws: it is called from a sync path that
 * must not reject, and a Compare+ write that fails is worth strictly less than
 * the lists cycle running on the same tick.
 */
export async function writeCompareValues(values, { gm = globalThis.GM, storage = globalThis.localStorage } = {}) {
  if (!isMap(values)) return false;
  const encoded = JSON.stringify(values);
  try {
    if (gm?.setValue != null) {
      // Order copied from HybridStorage: drop the legacy localStorage copy
      // FIRST, so a failure after this point cannot leave a stale value that
      // outranks nothing and confuses the next read.
      try {
        storage?.removeItem?.(COMPARE_KEY);
      } catch {
        // A guarded storage rethrows here (see storage-guard.mjs). Removing the
        // legacy copy is a tidy-up, not the write — GM is where this lives now.
      }
      await gm.setValue(COMPARE_KEY, encoded);
      return true;
    }
    storage?.setItem?.(COMPARE_KEY, encoded);
    return true;
  } catch (error) {
    console.error('[psnppp] could not save Compare+ data:', error);
    return false;
  }
}
