/**
 * One complete sync: pull, merge, write back, push.
 *
 * Every dependency is injected, so the whole cycle runs in node against fake
 * storage and a fake server — no browser needed for the tests that matter.
 */

import { toDoc, fromDoc, emptyDoc } from './doc.mjs';
import { stampChanges, mergeDoc, gcTombstones } from './merger.mjs';
import { readSyncable, writeSyncable } from './lists-bridge.mjs';
import { planAdoptions, applyAdoptions } from './adopt.mjs';

const DEFAULT_MAX_ATTEMPTS = 3;

/**
 * Order-and-key-insensitive fingerprint of a set of lists.
 *
 * Both sides are normalized through fromDoc so property order is identical, and
 * lists are sorted by id so a reordered array does not read as a change. Without
 * this, every cycle would look "changed" and churn out a backup each time.
 */
function fingerprint(lists) {
  return JSON.stringify([...lists].sort((a, b) => String(a.id).localeCompare(String(b.id))));
}

export async function runSyncCycle({
  storage,
  client,
  loadBase,
  saveBase,
  saveBackup,
  confirmAdoptions,
  now = Date.now(),
  maxAttempts = DEFAULT_MAX_ATTEMPTS
}) {
  const base = (await loadBase()) ?? emptyDoc();
  let remote = await client.getState();

  const { syncable } = readSyncable(storage);
  let localDoc = toDoc(syncable);

  // First contact with a list created on another device: match by name once, so
  // the two "Wishlist" lists become one instead of sitting side by side.
  const adoptions = planAdoptions(localDoc, remote.doc);
  if (adoptions.length > 0 && (await confirmAdoptions(adoptions))) {
    localDoc = applyAdoptions(localDoc, adoptions);
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const stamped = stampChanges(base, localDoc, now);
    const merged = gcTombstones(mergeDoc(base, stamped, remote.doc, now), now);

    const mergedLists = fromDoc(merged);
    // Compare against what is actually on disk, not against the stamped local
    // document — an adoption rewrites a list id without changing any content,
    // and that rewrite still has to reach localStorage.
    const currentLists = readSyncable(storage).syncable;
    const changed = fingerprint(fromDoc(toDoc(currentLists))) !== fingerprint(mergedLists);
    if (changed) {
      // Snapshot the untouched lists before the merge result overwrites them.
      await saveBackup(currentLists);
      writeSyncable(storage, mergedLists);
    }

    const result = await client.putState(remote.revision, merged);
    if (result.ok) {
      await saveBase(merged);
      return { status: 'synced', revision: result.revision, changed };
    }

    // Someone wrote between our pull and our push. Re-merge against their copy.
    remote = { revision: result.revision, doc: result.doc };
    localDoc = toDoc(readSyncable(storage).syncable);
  }

  return { status: 'conflict', revision: remote.revision, changed: false };
}
