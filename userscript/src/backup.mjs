/**
 * PSNP++ - Backups
 * ================
 *
 * Pre-merge snapshots of the raw lists.
 *
 * The merge writes to the only copy of this data that exists on the device, so
 * a snapshot is taken first. Routine merges get one snapshot per Eastern day
 * (see saveDailyBackup); a merge that would REMOVE something currently on this
 * device always gets one, because that is the case a backup exists for and it
 * must not be rationed. Kept in GM storage rather than localStorage so a PSNP+
 * reset cannot take the backups with it.
 *
 * Developer: Trippixn
 * Website:   https://trippixn.com
 * Discord:   discord.gg/syria
 */

const INDEX_KEY = 'psnppp.backups';
/**
 * How many pre-merge snapshots to keep, newest first, oldest evicted.
 *
 * Three, not five, and the owner's reasoning was right: these are a short undo
 * for the last few minutes, not an archive, and five rows of near-identical
 * timestamps is a wall to read past in a panel opened to check one thing.
 *
 * Depth behind these lives on the server, which retains HISTORY_LIMIT (100)
 * revisions across ALL devices — these are local to one browser.
 *
 * ⚠️ Do not read the server as a complete substitute. The cycle only pushes a
 * revision when the merge differs from what the server already holds, so a
 * device that merely RECEIVES another device's edit writes storage without
 * creating one. Content destroyed by a merge before it was ever pushed exists
 * nowhere but a local snapshot. That is why lossy writes bypass the daily gate.
 */
export const MAX_BACKUPS = 3;

/**
 * Which entries survive the cap, and which fall off. Pure — decides nothing
 * about storage.
 *
 * ⚠️ Entries flagged `protected` are never dropped, and the flag lives on the
 * ENTRY rather than being an argument for a reason: a read has no idea a
 * restore is in flight, so a caller-supplied `protect` would sail past every
 * reader that was not told. Storing it means every reader honours it.
 *
 * Tolerates a corrupt index. GM.getValue's default only covers ABSENT, not
 * malformed, and migrate.mjs deliberately passes null entries through — an
 * unguarded `entry.protected` here would throw inside listBackups, which
 * main.mjs awaits in the Promise.allSettled that builds the panel. The Backups
 * tab would then render "no backups yet" over perfectly good snapshots, which
 * is the worst lie an escape hatch can tell.
 */
function trim(index) {
  const keep = [];
  const dropped = [];
  if (!Array.isArray(index)) return { keep, dropped };
  for (const [position, entry] of index.entries()) {
    if (position < MAX_BACKUPS || entry?.protected) keep.push(entry);
    else dropped.push(entry);
  }
  return { keep, dropped };
}

/**
 * `protect` names one entry that must survive this save even if it would
 * otherwise be the one evicted.
 *
 * The restore flow takes a safety snapshot of the current lists before
 * overwriting them — and with only three slots, that save is exactly what
 * evicts the oldest entry, which is the one a restore usually targets. The
 * result was a restore that destroyed its own source. Protecting it lets the
 * index run one over the cap for the length of that operation, which is a far
 * better trade than the alternative.
 */
export async function saveBackup(lists, now = Date.now(), { protect = null } = {}) {
  const index = await GM.getValue(INDEX_KEY, []);
  const id = `psnppp.backup.${now}`;
  await GM.setValue(id, JSON.stringify(lists));

  // Clearing the previous flag is not optional: it is only ever set for the
  // length of one restore, and a stale one pins its entry above the cap. The
  // key is DELETED rather than set to undefined — real GM storage serialises to
  // JSON and drops undefined values, but the test fake holds objects by
  // reference, so `protected: undefined` is a difference the suite cannot see.
  const next = [{ id, at: now, listCount: lists.length }, ...index].map(entry => {
    const { protected: _cleared, ...rest } = entry;
    return entry.id === protect ? { ...rest, protected: true } : rest;
  });

  const { keep, dropped } = trim(next);
  // Index first, blobs after — migrate.mjs's stated ordering rule, and the
  // reason is the same. Interrupted here, an unreferenced blob is invisible
  // waste; the reverse order leaves an index row whose RESTORE button throws
  // "No such backup" at the person already having a bad day. A failed delete
  // must not abort the rest for the same reason.
  await GM.setValue(INDEX_KEY, keep);
  for (const entry of dropped) {
    try {
      await GM.deleteValue(entry.id);
    } catch (error) {
      console.error('[psnppp] could not delete an evicted backup:', error);
    }
  }
  return id;
}

/**
 * The snapshots worth showing, newest first.
 *
 * Applies the CURRENT cap to whatever is stored, so lowering MAX_BACKUPS takes
 * effect the moment the panel is opened rather than on the next write — an
 * index written under the old cap of five otherwise sat there indefinitely on a
 * device that had not merged since.
 *
 * Deliberately does NOT persist that trim. It used to, and a read that writes
 * earned two bugs at once: a rejected GM write turned a perfectly good list
 * into "no backups yet", and the read-modify-write raced the sync cycle's own
 * save, which could orphan the very snapshot that cycle was taking. The blobs
 * beyond the cap are reclaimed by the next saveBackup, which is the path that
 * owns them.
 */
export async function listBackups() {
  return trim(await GM.getValue(INDEX_KEY, [])).keep;
}

/**
 * The calendar day a timestamp falls on in New York, as `YYYY-MM-DD`, or null
 * if it cannot be determined.
 *
 * A fixed UTC offset would be wrong for half the year — Eastern is UTC-5 or
 * UTC-4 depending on the date — so the zone is named and the runtime applies
 * the right one, including on the two days a year it changes. `en-CA` is the
 * locale that formats as `YYYY-MM-DD`.
 *
 * ⚠️ Never throws, and that is the whole point. `Intl.DateTimeFormat.format`
 * raises RangeError on an invalid instant, and `at` comes off a stored index
 * entry that nothing validates — panel.mjs already guards the same field for
 * exactly this reason. Thrown from here it would reject out of saveDailyBackup,
 * out of the sync cycle, and every cycle after it: a malformed timestamp would
 * silently end syncing on that device forever, showing only an "Offline" chip.
 * Callers must treat null as "unknown" and fail OPEN.
 *
 * Built lazily rather than at module scope. This module is imported by main.mjs
 * at document-start on every psnprofiles.com page load, while the formatter is
 * needed roughly once a day; constructing a named-timezone formatter costs ~8ms
 * on a cold ICU cache. Building it here also contains a runtime without full
 * ICU data, where the constructor itself throws — at module scope that would
 * take the entire userscript down rather than just this feature.
 */
let easternDayFormat;
export function easternDay(at) {
  if (!Number.isFinite(at)) return null;
  try {
    easternDayFormat ??= new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit'
    });
    return easternDayFormat.format(at);
  } catch (error) {
    console.error('[psnppp] could not read the Eastern date:', error);
    return null;
  }
}

/**
 * One routine snapshot per Eastern calendar day — but never at the cost of a
 * lossy write.
 *
 * Replaces a snapshot before EVERY merge that wrote, which is what filled the
 * panel: an afternoon of edits spent all three slots inside an hour and pushed
 * out the older state actually worth keeping.
 *
 * ⚠️ `force` is the safety valve and is not optional. Rationing snapshots by
 * time alone assumed the server holds a revision for every write, and it does
 * not — sync-cycle.mjs only pushes when the merge differs from what the server
 * already has, so a receive-only merge creates none, and content a merge
 * DESTROYS was by definition never pushed. Under a time-only gate, adding games
 * at 15:00 and having the merge drop them was unrecoverable if that day's
 * snapshot had already been spent at 09:00. Callers pass force for any write
 * that removes something currently on this device.
 *
 * Fails OPEN: an unreadable day takes the snapshot. A duplicate costs one slot;
 * a missed one costs the data.
 *
 * Returns null when the snapshot was skipped, so a caller can tell "already
 * have today's" from a save. Failures throw rather than returning null.
 */
export async function saveDailyBackup(lists, now = Date.now(), { force = false } = {}) {
  if (force) return saveBackup(lists, now);
  const index = await GM.getValue(INDEX_KEY, []);
  const newest = Array.isArray(index) ? index[0] : null;
  const today = easternDay(now);
  const last = newest == null ? null : easternDay(newest.at);
  if (today != null && last === today) return null;
  return saveBackup(lists, now);
}

/**
 * The lists held in one snapshot, as they were when it was taken.
 *
 * Both failure paths name the id. A restore is attempted from a list of several
 * rows, so "which one" is the first thing the person needs — and a corrupt blob
 * says nothing about the other rows, which may be perfectly restorable.
 */
export async function restoreBackup(id) {
  const raw = await GM.getValue(id, null);
  if (raw == null) throw new Error(`No such backup: ${id}`);
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Backup ${id} is corrupt: ${error.message}`, { cause: error });
  }
}
