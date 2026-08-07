/**
 * PSNP++ - Sync Cycle
 * ===================
 *
 * One complete sync: pull, merge, write back, push.
 *
 * Every dependency is injected, so the whole cycle runs in node against fake
 * storage and a fake server — no browser needed for the tests that matter.
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */

import { toDoc, fromDoc, emptyDoc } from './doc.mjs';
import { stampChanges, mergeDoc, gcTombstones } from './merger.mjs';
import { readSyncable, writeSyncable, LISTS_KEY } from './lists-bridge.mjs';
import { planAdoptions, applyAdoptions } from './adopt.mjs';

const DEFAULT_MAX_ATTEMPTS = 3;

/**
 * List-order-insensitive fingerprint of a set of lists.
 *
 * Sorting by id is the only normalization this does: a reordered lists array
 * must not read as a change, or every cycle would look "changed" and churn out
 * a backup each time.
 *
 * It is NOT key-order insensitive, and fromDoc does not make it so. fromDoc
 * fixes the key order of each LIST (it builds `{id}` and then walks META_FIELDS
 * in a fixed order), but a game object is passed through with whatever key
 * order it was stored under, so two content-equal games written by different
 * devices can serialize differently here. What actually keeps that from
 * churning a backup every cycle is one level down, in merger.mjs: on an exact
 * updatedAt tie `pickNewer` compares the two records with `stableStringify`,
 * which ignores key order, and its `>=` returns the LOCAL copy when they are
 * content-equal — so the merge hands back the bytes already in storage.
 * Verified by execution: a game whose server copy has its keys in reverse order
 * settles after at most one cycle and then runs 10 rounds with 0 backups.
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

/**
 * Every local fact one attempt needs, taken from one point in time.
 *
 * localStorage is shared with the page and with every other psnprofiles.com
 * tab, and it can change under us across any `await`. Deriving "which lists are
 * frozen", "what is the local document" and "what do we back up" from separate
 * reads produced an internally inconsistent view and, twice, destroyed data.
 * All three now come from here, and `raw` lets the caller prove the snapshot is
 * still current at the moment it writes.
 *
 * The two getItem calls run in the same synchronous turn, with no await between
 * them, so no other tab's write can interleave — they are one read.
 */
function readSnapshot(storage) {
  const raw = storage.getItem(LISTS_KEY);
  const { syncable, remote } = readSyncable(storage);
  return { raw, syncable, remote, corrupt: looksCorrupt(raw, syncable, remote) };
}

/**
 * Storage does not hold a readable set of lists.
 *
 * `readLists` deliberately swallows a JSON.parse failure and returns `[]` — it
 * must never throw inside a page we do not own, and that is the right call
 * there. But this module is the only one that also knows about `base`, and to
 * `stampChanges` an empty local document against a populated base means "the
 * user deleted every list here", which mints a tombstone per list and pushes
 * mass deletion to every device. A truncated quota write, storage corruption,
 * or any other script writing junk to `psnpp-lists` is enough to trigger it.
 *
 * The question asked here is whether the bytes actually PARSED into lists — not
 * whether they look like some spelling of "empty". Comparing `raw.trim()` against
 * a whitelist leaked both ways: `""` and `"   "` do not parse but were treated as
 * empty; a BOM-prefixed `"[]"` trims to `"[]"` (U+FEFF is WhiteSpace) while
 * JSON.parse rejects it; and `"[ ]"` / `"[\n]"` are perfectly valid empty arrays
 * that the whitelist rejected, permanently halting a healthy user's sync.
 *
 * Only an absent key is a genuine empty state. Everything else has to parse to
 * an array whose length matches the lists actually recovered — the length check
 * catches entries `readLists` dropped (`[null]`), and the id check catches ones
 * it kept but that are not lists (`[{}]`, which `toDoc` would otherwise key
 * under the literal string "undefined" and push to the server).
 */
function looksCorrupt(raw, syncable, remote) {
  if (raw == null) return false;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return true;
  }
  if (!Array.isArray(parsed)) return true;
  if (parsed.length !== syncable.length + remote.length) return true;
  return syncable.some(l => l.id == null) || remote.some(l => l.id == null);
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

  // First contact with a list created on another device: match by name once, so
  // the two "Wishlist" lists become one instead of sitting side by side. This is
  // a one-time PLAN, decided against the initial pull and confirmed by the user
  // (or not) exactly once — never re-planned and never re-prompted below.
  //
  // In the browser `confirmAdoptions` is a blocking window.confirm that can sit
  // open for minutes. Nothing derived from this pre-confirm read is used after
  // it: the plan is a set of {localId, remoteId} pairs, re-applied below to
  // whatever storage actually holds by then.
  const adoptions = planAdoptions(toDoc(readSyncable(storage).syncable), remote.doc);
  const adopt = adoptions.length > 0 && (await confirmAdoptions(adoptions));

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    // ONE read of localStorage per attempt. Which lists are frozen, what the
    // working base is, what the local document is, and what gets backed up are
    // all derived from this single snapshot, so they cannot disagree with each
    // other. Reading it here rather than before the confirm also means a retry
    // picks up the newer local state a 409 implies, and re-applying `adoptions`
    // to it keeps a confirmed rename alive across retries.
    const snapshot = readSnapshot(storage);

    // The key is GONE, but this device has synced lists before. PSNP+ never
    // reaches that state by ordinary use: deleting the last list writes `[]`
    // (ListStorage.remove -> _save), it never calls removeItem. The one thing
    // that does is PSNP+'s own "Clear" button (clearData ->
    // ListStorage.clear -> localStorage.removeItem), plus anything else that
    // wipes site data for psnprofiles.com — and GM-stored `base` lives in
    // EXTENSION storage, so it survives all of them.
    //
    // `looksCorrupt` cannot catch this: an absent key is genuinely the
    // brand-new-device state and is indistinguishable from a wipe when all you
    // have is `raw`. One level up it IS distinguishable, because base says this
    // device had lists at its last successful sync. Treat it as corruption:
    // otherwise stampChanges reads it as "the user deleted every list here",
    // tombstones all of them server-wide in one cycle, takes ZERO backups
    // (both sides collapse to empty, so `changed` is false) and reports a
    // cheerful {status:'synced'}.
    //
    // Empty base + absent key is left alone — that is the real new device, and
    // it must be able to pull the server's lists down.
    //
    // The test is for a LIVE list, not for any key. Tombstones stay in base for
    // TOMBSTONE_TTL_MS (90 days) and fromDoc skips them, so a new device that
    // first syncs against an all-deleted server writes nothing (`changed` is
    // false, the key stays absent) while base.lists gains those tombstone keys.
    // Counting keys wedged that device permanently: every later cycle returned
    // corrupt, it never received a list created afterwards, and the chip told a
    // perfectly healthy browser its data was unreadable with zero backups to
    // offer. Every base that should trip this guard has at least one live list
    // in it, so asking for one costs the Clear-button protection nothing.
    if (snapshot.raw == null && Object.values(base.lists).some(n => n.deletedAt == null)) {
      return { status: 'corrupt', revision: remote.revision, changed: false };
    }

    // Local state is unreadable. Every inference below — above all "in base,
    // missing from local, therefore deleted" — would be drawn from nothing.
    // Bail out before the push, leaving storage, base and the server exactly as
    // they are, and let the caller tell the user their list data looks broken
    // and that a backup can be restored. Restoring is the user's call, not ours.
    if (snapshot.corrupt) {
      return { status: 'corrupt', revision: remote.revision, changed: false };
    }

    // Lists that turned into a PSNP+ 📡 remote list on this device (the
    // edit-list dialog assigns `url` onto the existing row, keeping its id)
    // must stop syncing WITHOUT being deleted everywhere else. Drop their id
    // from the base fed into the merge so stampChanges's "in base, missing
    // from local" check never sees them and never mints a tombstone for a list
    // that is still alive on other devices.
    const frozenIds = new Set(snapshot.remote.map(l => l.id));
    const workingBase = dropLists(base, frozenIds);

    const rawLocalDoc = toDoc(snapshot.syncable);
    // Storage is only ever written after a successful push, so `rawLocalDoc` is
    // always in its pristine, PRE-adoption shape and applying `adoptions` to it
    // can never double-apply. applyAdoptions's collision guard can still fire
    // here — an external write between the plan and now can introduce a list
    // under the adoption's remoteId — in which case the throw propagates out of
    // runSyncCycle, nothing is written, and main.mjs surfaces it as "Offline".
    const localDoc = adopt ? applyAdoptions(rawLocalDoc, adoptions) : rawLocalDoc;

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
    const currentLists = snapshot.syncable;
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
      // `mergedLists` and `merged` describe the world as of `snapshot`, and
      // writeSyncable re-reads storage itself to decide which 📡 rows to keep —
      // an agreement that only holds while storage still matches the snapshot.
      // If another tab wrote during the push, abandon this cycle's local write
      // AND leave `base` where it is: writing a stale merge would delete a list
      // that just stopped being 📡, and advancing `base` past a write that
      // never happened would tombstone it server-wide on the next cycle. Doing
      // nothing is always safe — the server already has the merge, and the
      // write that invalidated us also re-triggers a cycle.
      //
      // Known, ACCEPTED cosmetic cost — not a limitation: if this attempt had
      // adopted, the adopted ids are now on the server while localStorage still
      // has the old ones, so the next cycle proposes the same adoption and the
      // user sees the "Link them?" confirm a second time. This is suppressible
      // (e.g. a session-scoped memo of already-answered {localId -> remoteId}
      // pairs in main.mjs); it is left in deliberately because one extra dialog
      // that converges on the next cycle does not justify another change to
      // this path.
      if (storage.getItem(LISTS_KEY) !== snapshot.raw) {
        return { status: 'synced', revision: result.revision, changed: false };
      }
      if (changed) {
        // Snapshot the untouched lists before the merge result overwrites them.
        await saveBackup(currentLists);
        // saveBackup is an await too, so re-check before the one and only write.
        // A write landing inside that window still costs one of the 5 backup
        // slots for a write that never happens. That residual cost is
        // irreducible without breaking something worse: the backup has to
        // precede the write, and the write has to be the last thing after the
        // last await. It is also mild — the slot holds a genuine snapshot of
        // genuine data, so at most it displaces an older snapshot.
        if (storage.getItem(LISTS_KEY) !== snapshot.raw) {
          return { status: 'synced', revision: result.revision, changed: false };
        }
        writeSyncable(storage, mergedLists);
      }
      // Frozen (📡) lists are deliberately kept OUT of base. `merged` carries
      // the server's own node for them (the merge had nothing local to weigh it
      // against), and recording that as "what this device last settled" is a
      // lie: this device is not syncing the list at all, and PSNP+ repopulates
      // a 📡 row from its feed URL, so local and server content diverge freely.
      // On unfreeze, stampChanges would then read the server's extra games as
      // "in base, missing from local" and delete them on every device.
      //
      // TRADEOFF, accepted deliberately — do not "fix" this back: with the
      // list absent from base, a deletion made elsewhere while it was frozen
      // can never be propagated server-wide by this device. That is consistent
      // with what frozen means (excluded from sync entirely); silently
      // destroying diverged content is not.
      await saveBase(dropLists(merged, frozenIds));
      return { status: 'synced', revision: result.revision, changed };
    }

    // Someone wrote between our pull and our push. Re-merge against their copy
    // on the next attempt, from a fresh snapshot taken at the top of the loop.
    remote = { revision: result.revision, doc: result.doc };
  }

  // Every attempt was rejected: nothing was ever written to storage, so there
  // is nothing to report as changed.
  return { status: 'conflict', revision: remote.revision, changed: false };
}
