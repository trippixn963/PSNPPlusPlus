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

/** A copy of `doc` with the given list ids removed. */
function dropLists(doc, ids) {
  if (ids.size === 0) return doc;
  const out = { version: doc.version, lists: {} };
  for (const [listId, node] of Object.entries(doc.lists)) {
    if (!ids.has(listId)) out.lists[listId] = node;
  }
  return out;
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

  const { syncable, remote: remoteLists } = readSyncable(storage);
  let localDoc = toDoc(syncable);

  // Lists that turned into a PSNP+ 📡 remote list on this device (the edit-list
  // dialog assigns `url` onto the existing row, keeping its id) must stop
  // syncing WITHOUT being deleted everywhere else. Drop their id from the base
  // fed into the merge so stampChanges's "in base, missing from local" check
  // never sees them and never mints a tombstone for a list that's still alive
  // on other devices.
  const frozenIds = new Set(remoteLists.map(l => l.id));
  const workingBase = dropLists(base, frozenIds);

  // First contact with a list created on another device: match by name once, so
  // the two "Wishlist" lists become one instead of sitting side by side.
  const adoptions = planAdoptions(localDoc, remote.doc);
  if (adoptions.length > 0 && (await confirmAdoptions(adoptions))) {
    localDoc = applyAdoptions(localDoc, adoptions);
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const stamped = stampChanges(workingBase, localDoc, now);
    const merged = gcTombstones(mergeDoc(workingBase, stamped, remote.doc, now), now);

    // A frozen list's node above is whatever the merge fell back to (the
    // remote's own copy, untouched) — correct to push back as-is, but it must
    // never reappear in the syncable lists handed to writeSyncable, or it
    // would collide with the 📡 entry already sitting in storage.
    const mergedLists = fromDoc(dropLists(merged, frozenIds));
    // Compare against what is actually on disk, not against the stamped local
    // document — an adoption rewrites a list id without changing any content,
    // and that rewrite still has to reach localStorage.
    const currentLists = readSyncable(storage).syncable;
    const changed = fingerprint(fromDoc(toDoc(currentLists))) !== fingerprint(mergedLists);

    // Push before writing anything to storage. Writing first (and only
    // advancing `base` on success) meant a rejected attempt still left its
    // merge result sitting in storage; the next attempt re-read that as
    // "local", re-stamped it against the untouched `base`, and every
    // remote-origin record picked up a fresh `now` timestamp — newer than any
    // real remote edit, so local (i.e. the previous attempt's already-stale
    // merge) always won the next merge. Only touching storage after the
    // server accepts keeps every retry's stamp pass honest.
    const result = await client.putState(remote.revision, merged);
    if (result.ok) {
      if (changed) {
        // Snapshot the untouched lists before the merge result overwrites them.
        await saveBackup(currentLists);
        writeSyncable(storage, mergedLists);
      }
      await saveBase(merged);
      return { status: 'synced', revision: result.revision, changed };
    }

    // Someone wrote between our pull and our push. Re-merge against their copy.
    // Storage was never touched by this attempt, so localDoc is unchanged too —
    // re-deriving it here matters only if the environment mutated storage out
    // from under us between attempts.
    remote = { revision: result.revision, doc: result.doc };
    localDoc = toDoc(readSyncable(storage).syncable);
  }

  // Every attempt was rejected: nothing was ever written to storage, so there
  // is nothing to report as changed.
  return { status: 'conflict', revision: remote.revision, changed: false };
}
