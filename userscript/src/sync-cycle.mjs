/**
 * PSNP++ - Sync Cycle
 * ===================
 *
 * One complete sync: pull, merge, write back, push.
 *
 * Every dependency is injected, so the whole cycle runs in node against fake
 * storage and a fake server — no browser needed for the tests that matter.
 *
 * Developer: Trippixn
 * Website:   https://trippixn.com
 * Discord:   discord.gg/syria
 */

import { toDoc, fromDoc, emptyDoc } from './doc.mjs';
import { stampChanges, mergeDoc, gcTombstones } from './merger.mjs';
import { readSyncable, writeSyncable, LISTS_KEY } from './lists-bridge.mjs';
import { planAdoptions, applyAdoptions, repointActiveList, reconcileActiveList } from './adopt.mjs';

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

/**
 * JSON with object keys in a fixed order, so two content-equal documents always
 * serialize identically.
 *
 * A deliberate local copy of the same function in merger.mjs, which does not
 * export it. Importing it would mean widening the surface of the module that
 * owns every merge rule in the project purely for a caller's convenience, and
 * this file is not worth that: it is 20 lines with no dependencies.
 *
 * Plain JSON.stringify cannot do this job. It emits keys in insertion order,
 * and the server hands back whatever order it stored — so a comparison built on
 * it would report "different" on documents that are character-for-character the
 * same content, on every cycle, forever. The skip would then never fire and the
 * change would look harmless while doing precisely nothing.
 *
 * `undefined` is rendered the way JSON.stringify renders it (an object key with
 * an undefined value is dropped, an undefined array element becomes null), for
 * the same reason merger.mjs does it: doc.mjs writes all 8 META_FIELDS whether
 * or not the list had them, so `meta.removeGames === undefined` is an ordinary
 * shape here, while the JSON that came back from the server never has the key
 * at all. Rendering those two differently would make every such document look
 * permanently unequal to itself.
 */
function stableStringify(value) {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return '[' + value.map(v => (v === undefined ? 'null' : stableStringify(v))).join(',') + ']';
  }
  const entries = Object.keys(value)
    .filter(key => value[key] !== undefined)
    .sort()
    .map(key => `"${key}":${stableStringify(value[key])}`);
  return '{' + entries.join(',') + '}';
}

/** Do these two sync documents carry the same content, key order aside? */
function sameDoc(left, right) {
  return stableStringify(left) === stableStringify(right);
}

const ZERO_DELTA = {
  listsAdded: 0, listsRemoved: 0, gamesAdded: 0, gamesRemoved: 0, listsLinked: 0
};

/** How many game titles a single delta will name. See summarizeDelta. */
const NAMED_GAME_LIMIT = 20;

/**
 * The delta for a cycle that wrote nothing.
 *
 * Every early return in this file — corrupt storage, an exhausted retry, either
 * CAS abort — reports one of these. A delta describes what reached storage, so
 * a cycle that abandoned its write has nothing to report, and saying otherwise
 * would make the history log lie in exactly the situation it exists to explain.
 */
// Fresh arrays every call. ZERO_DELTA deliberately holds none, so no spread of
// it can hand two deltas the same array.
const zeroDelta = () => ({ ...ZERO_DELTA, addedGames: [], removedGames: [] });

/**
 * What a cycle did, in the only terms the user thinks in.
 *
 * Derived from the two list arrays the cycle already built — the snapshot it
 * read and the merge it is about to write — so it costs one pass over data
 * already in hand. Deliberately NOT a second merge and NOT a re-read of
 * storage: a delta computed from a different read than the write it describes
 * would be a second source of truth about the same cycle, and this file has
 * already destroyed data twice by letting two reads disagree.
 *
 * `renames` folds an adoption's id rewrite (local-1 -> remote-1) into one
 * identity. Without it the single most alarming line this log can print — "1
 * list removed, 1 list added" — would appear on the most ordinary first sync
 * there is, and it would be false: nothing was removed, the list simply took
 * the id the server already had for it.
 */
function summarizeDelta(before, after, renames) {
  const gameIds = list => new Set((list.games ?? []).map(g => String(g.id)));
  const titlesById = list => new Map(
    (list.games ?? []).map(g => [String(g.id), typeof g.title === 'string' ? g.title : ''])
  );
  const beforeById = new Map(before.map(l => [renames.get(String(l.id)) ?? String(l.id), l]));
  const afterById = new Map(after.map(l => [String(l.id), l]));

  // The counts are the contract every caller already relies on; the named
  // arrays are additive and purely for the log. Built here rather than by a
  // second pass elsewhere for the reason the docblock above gives — a delta
  // derived from a different read than the write it describes is a second
  // source of truth about the same cycle, and that has destroyed data twice.
  //
  // Arrays are created per call, never spread out of ZERO_DELTA: a shallow
  // copy of a frozen-looking constant holding an array shares the SAME array
  // with every delta ever made, so one cycle's games would accumulate into the
  // next one's log.
  const delta = { ...ZERO_DELTA, listsLinked: renames.size, addedGames: [], removedGames: [] };

  // Bounded because a first sync, or a list deletion, can move hundreds at
  // once. The log wants to name what changed, not reproduce the library.
  const note = (bucket, title, listName) => {
    if (bucket.length >= NAMED_GAME_LIMIT || !title) return;
    bucket.push({ title, list: listName });
  };
  const nameOf = list => (typeof list.name === 'string' && list.name ? list.name : 'a list');

  for (const [listId, list] of afterById) {
    const previous = beforeById.get(listId);
    const titles = titlesById(list);
    const listName = nameOf(list);
    if (previous == null) {
      delta.listsAdded += 1;
      delta.gamesAdded += titles.size;
      for (const [, title] of titles) note(delta.addedGames, title, listName);
      continue;
    }
    const had = gameIds(previous);
    const hadTitles = titlesById(previous);
    for (const gameId of titles.keys()) {
      if (had.has(gameId)) continue;
      delta.gamesAdded += 1;
      note(delta.addedGames, titles.get(gameId), listName);
    }
    for (const gameId of had) {
      if (titles.has(gameId)) continue;
      delta.gamesRemoved += 1;
      note(delta.removedGames, hadTitles.get(gameId), listName);
    }
  }

  for (const [listId, list] of beforeById) {
    if (afterById.has(listId)) continue;
    delta.listsRemoved += 1;
    delta.gamesRemoved += gameIds(list).size;
    for (const [, title] of titlesById(list)) note(delta.removedGames, title, nameOf(list));
  }

  return delta;
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
  // The same plan the merge applies, in the shape the delta needs.
  const renames = new Map(adopt ? adoptions.map(a => [String(a.localId), String(a.remoteId)]) : []);

  // Has THIS CYCLE, on any attempt, had a push accepted? Scoped to the cycle
  // rather than to the attempt on purpose. Once the server has taken a merge
  // from us, `base` owes it a `saveBase` for the rest of the cycle, and which
  // attempt made the push is irrelevant to that debt. A per-attempt flag leaves
  // a real hole, reproduced against the real modules: attempt 1 pushes and its
  // CAS aborts; attempt 2 re-merges to exactly what attempt 1 wrote, so it
  // SKIPS the push, and if its own CAS then aborts a per-attempt flag reads
  // false and returns — stranding `base` a generation behind a push that
  // definitely happened, which is the whole bug. (Reachable: an external write
  // that only touches fields `toDoc` ignores changes the raw bytes, aborting
  // the CAS without changing the merge.)
  let pushed = false;
  // Set by the write below when it stranded PSNP+'s bookmark and we moved it.
  let activeListRepair = null;

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
      return { status: 'corrupt', revision: remote.revision, changed: false, delta: zeroDelta() };
    }

    // Local state is unreadable. Every inference below — above all "in base,
    // missing from local, therefore deleted" — would be drawn from nothing.
    // Bail out before the push, leaving storage, base and the server exactly as
    // they are, and let the caller tell the user their list data looks broken
    // and that a backup can be restored. Restoring is the user's call, not ours.
    if (snapshot.corrupt) {
      return { status: 'corrupt', revision: remote.revision, changed: false, delta: zeroDelta() };
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
    // Only computed when there is a write to describe. `changed === false` means
    // the fingerprints agree, so every count would come out zero anyway — this
    // just says so without the pass.
    const delta = changed ? summarizeDelta(currentLists, mergedLists, renames) : zeroDelta();

    // What the USER did on this device since it last settled, which is a
    // different question from `delta` and the one a human actually asks.
    //
    // `delta` compares the local snapshot to the merge, so it describes what
    // the CYCLE wrote to localStorage — i.e. what ARRIVED from elsewhere. A
    // game you add here is already in both sides of that comparison, so it
    // reports nothing: your own edits, the thing most worth reporting, are
    // exactly what it cannot see. This compares BASE to the snapshot instead.
    //
    // An EMPTY rename map, deliberately: both sides here still carry this
    // device's own list ids (the snapshot is pre-adoption and base records
    // what this device last settled), so applying the adoption's map would
    // rewrite one side's ids and invent a removal plus an addition.
    const localDelta = summarizeDelta(fromDoc(workingBase), currentLists, new Map());

    // Say nothing when there is nothing to say.
    //
    // The server stores the document and bumps the revision for every PUT it
    // accepts, whatever the body — so a cycle whose merge IS the document the
    // server already holds spends a round trip and a revision to tell it
    // something it told us. Measured before this check: 624 revisions for 600
    // operations, most of them cycles where nobody had changed anything.
    //
    // "Nothing to PUSH" is emphatically NOT "nothing to DO", and everything
    // below this block depends on that. A device that merely RECEIVES — a new
    // device pulling the world down, or any device picking up a game added
    // elsewhere — merges to exactly the server's own document, so its push is
    // skippable and its local write is mandatory. Both were verified by
    // execution before this was written. That is why the local write, the
    // backup, the CAS and `saveBase` all live outside this block: leaving them
    // in the push's success branch would silently stop every device from ever
    // receiving anything, while still reporting a cheerful "Synced".
    //
    // `settledRevision` is what the server is at once this attempt is done —
    // the new revision if we pushed, the one we pulled if we did not. Truthful
    // either way, because in the skip case the server's document is unchanged.
    //
    // The push is the point of no return for `base`: once the server has
    // accepted the merge, this device HAS settled on it, and every path below
    // has to end at `saveBase` or the next cycle re-derives the difference as
    // local news. See the retries at the two CAS aborts.
    let settledRevision = remote.revision;
    if (!sameDoc(merged, remote.doc)) {
      // Push before writing anything to storage. Writing first (and only
      // advancing `base` on success) meant a rejected attempt still left its
      // merge result sitting in storage; the next attempt re-read that as
      // "local", re-stamped it against the untouched `base`, and every
      // remote-origin record picked up a fresh `now` timestamp — newer than any
      // real remote edit, so local (i.e. the previous attempt's already-stale
      // merge) always won the next merge. Only touching storage after the
      // server accepts keeps every retry's stamp pass honest.
      const result = await client.putState(remote.revision, merged);
      if (!result.ok) {
        // Someone wrote between our pull and our push. Re-merge against their
        // copy on the next attempt, from a fresh snapshot taken at the top of
        // the loop.
        remote = { revision: result.revision, doc: result.doc };
        continue;
      }
      settledRevision = result.revision;
      pushed = true;
      // The server now holds `merged` at `settledRevision`. Recording it here
      // is what makes a retry below correct rather than dangerous: the next
      // attempt re-merges against what we just WROTE, not against the older
      // copy we pulled, so it cannot undo its own push.
      remote = { revision: settledRevision, doc: merged };
    }

    // `mergedLists` and `merged` describe the world as of `snapshot`, and
    // writeSyncable re-reads storage itself to decide which 📡 rows to keep —
    // an agreement that only holds while storage still matches the snapshot.
    // If another tab wrote during the push, abandon this cycle's local write
    // AND leave `base` where it is: writing a stale merge would delete a list
    // that just stopped being 📡, and advancing `base` past a write that
    // never happened would tombstone it server-wide on the next cycle. Both
    // halves of that still hold — `saveBase` on this path would be exactly the
    // bug it describes, and nothing below calls it.
    //
    // But simply RETURNING here is not safe either, and that was its own
    // data-loss path. Once the push was accepted, the server is a generation
    // ahead of `base`; returning strands it there, and the next cycle reads
    // every record the stale `base` does not know about as brand new, stamps
    // it `now`, and that beats a tombstone another device pushed in between —
    // resurrecting a game or a whole list on every device, under a green
    // "Synced" chip. So when the push landed, RETRY: the loop takes a fresh
    // snapshot, re-merges against the document we just wrote (`remote` was
    // updated to it above), and reaches `saveBase` normally. The stale merge
    // is still discarded; it is just no longer the end of the cycle.
    //
    // Unpushed attempts still return — there is nothing the server knows that
    // `base` does not, so leaving both alone really is complete. That is the
    // skip-the-push path, and the write that invalidated us re-triggers a
    // cycle anyway.
    //
    // Still checked when the push was skipped. Nothing awaited between the
    // snapshot and here on that path, so it cannot fire yet — but it is the
    // guard for an invariant ("this write matches the bytes it was computed
    // from"), not for one particular await, and the next await is one line
    // below it.
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
      if (pushed && attempt < maxAttempts) continue;
      return { status: 'synced', revision: settledRevision, changed: false, delta: zeroDelta() };
    }
    // A DELETION made on this device was being backed up USELESSLY.
    //
    // The snapshot below is `currentLists` — the lists as read at the top of
    // this cycle. That is the right thing to keep when the merge is about to
    // overwrite local data with something that arrived from elsewhere. But when
    // the change is a deletion made HERE, `currentLists` is ALREADY the
    // post-deletion state: the backup faithfully preserves the absence, and
    // restoring it brings nothing back — while the tombstone goes out to every
    // other device. A backup that exists and cannot undo the thing it was taken
    // for is worse than an obvious gap, because it stops anyone looking.
    //
    // What is worth keeping is what this device last settled on: `workingBase`,
    // which the cycle already holds and would otherwise discard.
    //
    // NOT gated on anything extra: a deletion always writes, because stamping
    // the tombstone makes the merge differ from what is in storage. Verified by
    // execution across a game removal, a whole-list removal and removing
    // everything — `changed` was true in all three. So this only ever changes
    // WHICH snapshot is taken, never whether one is.
    const deletedLocally = localDelta.gamesRemoved > 0 || localDelta.listsRemoved > 0;

    if (changed) {
      // Snapshot the untouched lists before the merge result overwrites them —
      // EXCEPT after a local deletion, where `currentLists` is already the
      // post-deletion state and restoring it would bring nothing back. There
      // the useful snapshot is what this device last settled on, which the
      // cycle is holding as `workingBase` and would otherwise discard.
      //
      // saveDailyBackup is what main.mjs injects, so a routine merge takes at
      // most one snapshot per Eastern day and a busy afternoon no longer spends
      // every slot in an hour.
      //
      // `force` covers the case the cap must never ration. The server is NOT a
      // complete substitute for these: the push above is skipped when the merge
      // equals what the server already holds, so a receive-only merge creates no
      // revision, and anything this merge DESTROYS was never pushed in the first
      // place. A lossy write with today's slot already spent would leave that
      // content nowhere at all, so removals always snapshot.
      const removesLocalContent = delta.gamesRemoved > 0 || delta.listsRemoved > 0;
      await saveBackup(
        deletedLocally ? fromDoc(workingBase) : currentLists,
        now,
        { force: removesLocalContent || deletedLocally }
      );
      // The backup is an await too, so re-check before the one and only write:
      // the backup has to precede the write, and the write has to be the last
      // thing after the last await.
      if (storage.getItem(LISTS_KEY) !== snapshot.raw) {
        if (pushed && attempt < maxAttempts) continue;
        return { status: 'synced', revision: settledRevision, changed: false, delta: zeroDelta() };
      }
      const idsBefore = currentLists.map(l => String(l.id));
      writeSyncable(storage, mergedLists);

      // AFTER the write, and only on the attempt that actually landed. An
      // adoption whose push was rejected never reaches storage, so repointing
      // for it would create the same dangling bookmark in the other direction.
      // Returns a boolean and never throws — see repointActiveList.
      if (adopt) repointActiveList(storage, adoptions);

      // Then the general case: any write of ours that REMOVED the bookmarked
      // list — a deletion arriving from another device — strands it just as
      // effectively as a rename, and PSNP+'s add-to-list buttons vanish
      // mid-session with nothing said. Reported so the log can name it rather
      // than leaving it as "the buttons keep disappearing sometimes".
      activeListRepair = reconcileActiveList(
        storage, idsBefore, mergedLists.map(l => String(l.id))
      );
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
    //
    // Advanced on the skip path too, and it has to be: `merged` is what the
    // server holds, so this device HAS settled on it. Leaving `base` behind
    // because no bytes went over the wire would make the next cycle read the
    // difference as a local deletion.
    await saveBase(dropLists(merged, frozenIds));
    return { status: 'synced', revision: settledRevision, changed, delta, localDelta, activeListRepair };
  }

  // Every attempt was rejected: nothing was ever written to storage, so there
  // is nothing to report as changed.
  return { status: 'conflict', revision: remote.revision, changed: false, delta: zeroDelta() };
}
