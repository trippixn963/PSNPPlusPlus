/**
 * The only module that touches localStorage['psnpp-lists'].
 *
 * Storage is passed in rather than reached for globally, so the logic is
 * testable in node without a DOM.
 */

import { splitRemote } from './doc.mjs';

export const LISTS_KEY = 'psnpp-lists';

export function readLists(storage) {
  try {
    const raw = storage.getItem(LISTS_KEY);
    if (raw == null) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
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
  writeLists(storage, [...syncedLists, ...remote]);
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

  const check = () => {
    const current = storage.getItem(LISTS_KEY);
    if (current === last) return;
    last = current;
    onChange();
  };

  const proto = target.Storage?.prototype;
  const originalSetItem = proto?.setItem;
  if (originalSetItem) {
    proto.setItem = function patchedSetItem(key, value) {
      originalSetItem.call(this, key, value);
      if (key === LISTS_KEY) check();
    };
  }

  const onStorageEvent = event => { if (event.key === LISTS_KEY) check(); };
  target.addEventListener?.('storage', onStorageEvent);
  const timer = setInterval(check, intervalMs);

  return function stop() {
    if (originalSetItem) proto.setItem = originalSetItem;
    target.removeEventListener?.('storage', onStorageEvent);
    clearInterval(timer);
  };
}
