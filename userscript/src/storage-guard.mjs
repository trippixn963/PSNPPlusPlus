/**
 * PSNP++ - Storage guard
 * ======================
 *
 * Not one of PSNP+'s eight `localStorage.setItem` calls is wrapped in a
 * try/catch. Every one of them is a bare write inside a one-line `save()`.
 *
 * The obvious reading is that they should be hardened so they stop throwing.
 * That is the smaller half of the problem. The dangerous half is that a write
 * which fails is INVISIBLE: PSNP+ keeps its in-memory copy, the page goes on
 * showing the change, and PSNP++ then reads storage, finds the old bytes, and
 * syncs them as though nothing had happened — reporting "Synced" in the settled
 * tier over data the user believes they changed. A green light over a failure is
 * worse than the failure.
 *
 * So this guard OBSERVES rather than intervenes. It reports, and it rethrows:
 * control flow after a failed write is left exactly as it is today, because
 * changing it would mean deciding, for eight call sites in someone else's code,
 * whether a half-applied feature is better than an exception — and there is no
 * general answer to that. What it changes is that the failure reaches the user
 * instead of dying in a console nobody has open.
 *
 * Quota is the realistic cause: Safari's private mode refuses writes outright,
 * and psnprofiles.com plus PSNP+'s own caches (shutdowns, prices, sessions,
 * game lists) share one origin's 5MB with everything else on the domain.
 *
 * Installed on the storage object rather than patched into the bundle: eight
 * near-identical one-liners would be seven or eight separate patches, each able
 * to fail the build on its own, to say something the same wrapper says once.
 *
 * Developer: Trippixn
 * Website:   https://trippixn.com
 * Discord:   discord.gg/syria
 */

/**
 * Storage objects already guarded, and how to unguard them.
 *
 * Out here rather than as a property on the storage itself — see the note at the
 * assignment below for why touching a Storage object's own properties is unsafe.
 * Weak, so a storage from a closed frame is not held alive by this.
 */
const guarded = new WeakMap();

/**
 * Roughly how many bytes a write costs, for the report.
 *
 * Deliberately approximate: `length` counts UTF-16 code units, so anything
 * outside the BMP undercounts. It is a number to put in a message next to
 * "quota", not an accounting figure, and computing it exactly would mean
 * encoding the whole value a second time on a path that has just failed.
 */
const approximateBytes = value => {
  try {
    return String(value ?? '').length;
  } catch {
    return 0;
  }
};

/**
 * Whether an error is the browser saying "no room", as opposed to any other
 * reason a write can fail.
 *
 * Every engine spells it differently and two of them use a bare numeric code,
 * so all three spellings are checked. Only ever used to word the message: an
 * unrecognised failure is still reported, just without the quota wording.
 */
export function isQuotaError(error) {
  if (error == null) return false;
  const name = typeof error.name === 'string' ? error.name : '';
  const code = error.code;
  return name === 'QuotaExceededError'
    || name === 'NS_ERROR_DOM_QUOTA_REACHED'
    || code === 22
    || code === 1014;
}

/** A short, human sentence for the chip's tooltip. */
export function describeStorageFailure({ key, error, bytes }) {
  const where = key ? `"${key}"` : 'a value';
  return isQuotaError(error)
    ? `Browser storage is full — could not save ${where} (${bytes} bytes). `
      + 'Clearing site data for psnprofiles.com will free it.'
    : `Could not save ${where} to browser storage: ${error?.message ?? 'unknown error'}.`;
}

/**
 * Wrap `setItem` and `removeItem` so failures are reported before they throw.
 *
 * Returns an `uninstall` function that puts the originals back. Idempotent: a
 * second install on the same storage object is a no-op returning the first
 * uninstall, so a double-wired start() cannot end up reporting twice or, worse,
 * leave a wrapper wrapping a wrapper that can never be removed.
 *
 * `onFailure` is called with `{ key, error, bytes }` and is itself wrapped: a
 * throwing reporter must not replace the storage error with its own, which
 * would hide the very thing it exists to surface.
 */
export function installStorageGuard(storage, { onFailure = () => {} } = {}) {
  if (storage == null) return () => {};
  const already = guarded.get(storage);
  if (already) return already;

  const original = {
    setItem: storage.setItem,
    removeItem: storage.removeItem
  };

  const report = (key, error, bytes) => {
    try {
      onFailure({ key, error, bytes });
    } catch (reportError) {
      console.error('[psnppp] the storage reporter itself failed:', reportError);
    }
  };

  const guard = (name, computeBytes) => function guardedWrite(key, value) {
    try {
      return original[name].call(storage, key, value);
    } catch (error) {
      report(key, error, computeBytes(value));
      // Rethrown on purpose. See the module note: swallowing would leave eight
      // call sites in someone else's code believing a write landed.
      throw error;
    }
  };

  const wrappedSet = guard('setItem', approximateBytes);
  const wrappedRemove = guard('removeItem', () => 0);
  // Assigning over `setItem` shadows the method inherited from Storage.prototype,
  // which is the ordinary way to wrap it. Assigning a NEW name would not: for a
  // real Storage object, setting an unknown property goes through the named
  // property setter and writes a localStorage ENTRY. That is why the
  // already-installed marker is a WeakSet out here and not a flag on the object
  // — a `storage.__psnpppGuarded = true` would have put a stray key in the
  // user's storage, and straight into the bytes the sync cycle reads.
  storage.setItem = wrappedSet;
  storage.removeItem = wrappedRemove;

  const uninstall = () => {
    // Only unwind if the wrappers are still ours. Something else installing over
    // the top of us and then being removed would otherwise have its work undone.
    if (storage.setItem === wrappedSet) storage.setItem = original.setItem;
    if (storage.removeItem === wrappedRemove) storage.removeItem = original.removeItem;
    guarded.delete(storage);
  };

  guarded.set(storage, uninstall);
  return uninstall;
}
