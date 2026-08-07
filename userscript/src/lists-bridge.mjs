/**
 * The only module that touches localStorage['psnpp-lists'].
 *
 * Storage is passed in rather than reached for globally, so the logic is
 * testable in node without a DOM.
 */

import { splitRemote, isRemoteList } from './doc.mjs';

export const LISTS_KEY = 'psnpp-lists';

export function readLists(storage) {
  try {
    const raw = storage.getItem(LISTS_KEY);
    if (raw == null) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Filter to well-shaped entries only; protects downstream consumers
    // (doc.mjs's toDoc/fromDoc, splitRemote's isRemoteList, etc.) from
    // null/malformed entries that could cause exceptions.
    return parsed.filter(l => l != null && typeof l === 'object');
  } catch {
    // PSNP+ itself swallows parse failures here and starts from empty; do the
    // same rather than throwing inside a page we do not own.
    return [];
  }
}

export function writeLists(storage, lists) {
  storage.setItem(LISTS_KEY, JSON.stringify(lists));
}

export function readSyncable(storage) {
  return splitRemote(readLists(storage));
}

/** Write back the synced lists, leaving remote (📡) lists exactly as they were. */
export function writeSyncable(storage, syncedLists) {
  const { remote } = readSyncable(storage);
  const remoteIds = new Set(remote.map(l => l.id));

  // Drop from syncedLists any entry that is itself remote or whose id collides
  // with a remote list. Prefer dropping over throwing — this is the write path
  // for the user's real data, and correct output with a warning beats an
  // exception mid-sync.
  const cleaned = syncedLists.filter(l => {
    if (isRemoteList(l)) {
      console.warn('[psnpsync] writeSyncable: dropping remote list in syncedLists:', l.id);
      return false;
    }
    if (remoteIds.has(l.id)) {
      console.warn('[psnpsync] writeSyncable: dropping syncedList with remote id collision:', l.id);
      return false;
    }
    return true;
  });

  writeLists(storage, [...cleaned, ...remote]);
}

/**
 * Watch for changes to the lists key.
 *
 * Same-tab writes do not fire `storage` events, and PSNP+ writes from the same
 * tab, so patching setItem is the primary signal. The poll is a backstop, and
 * the cross-tab `storage` listener catches a second PSNP+ tab.
 */
export function watchLists(storage, onChange, { intervalMs = 2000, target = globalThis } = {}) {
  let last = storage.getItem(LISTS_KEY);
  let inCheck = false; // Reentrancy guard: prevent recursive check/onChange calls

  const check = () => {
    if (inCheck) return;
    inCheck = true;
    try {
      const current = storage.getItem(LISTS_KEY);
      if (current === last) return;
      last = current;
      try {
        onChange();
      } catch (e) {
        // If onChange throws, swallow it and log — an exception here must never
        // surface into a page we do not own. This callback runs synchronously
        // from the setItem path we patched, and PSNP+ calls setItem frequently.
        console.error('[psnpsync] Sync callback error:', e);
      }
    } finally {
      inCheck = false;
    }
  };

  const proto = target.Storage?.prototype;
  const originalSetItem = proto?.setItem;
  let patchedSetItem; // Declare here so stop() can reference it

  if (originalSetItem) {
    patchedSetItem = function(key, value) {
      originalSetItem.call(this, key, value);
      if (key === LISTS_KEY) {
        try {
          check();
        } catch (e) {
          // Storage patch error is rare but must not break the write.
          console.error('[psnpsync] Storage patch error:', e);
        }
      }
    };
    proto.setItem = patchedSetItem;
  }

  const onStorageEvent = event => {
    if (event.key === LISTS_KEY) {
      try {
        check();
      } catch (e) {
        console.error('[psnpsync] Storage event error:', e);
      }
    }
  };
  target.addEventListener?.('storage', onStorageEvent);
  const timer = setInterval(() => {
    try {
      check();
    } catch (e) {
      console.error('[psnpsync] Poll error:', e);
    }
  }, intervalMs);

  return function stop() {
    // Only restore if we're still the top of the chain. If another script
    // patched setItem after us, restoring unconditionally would remove their
    // patch, which is silent corruption. Leave the chain as-is unless we're
    // certain we're unwinding our own patch.
    if (originalSetItem && proto.setItem === patchedSetItem) {
      proto.setItem = originalSetItem;
    }
    target.removeEventListener?.('storage', onStorageEvent);
    clearInterval(timer);
  };
}
