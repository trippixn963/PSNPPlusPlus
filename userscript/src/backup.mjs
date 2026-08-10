/**
 * PSNP++ - Backups
 * ================
 *
 * Pre-merge snapshots of the raw lists.
 *
 * The merge writes to the only copy of this data that exists on the device, so
 * every write-back is preceded by a snapshot. Kept in GM storage rather than
 * localStorage so a PSNP+ reset cannot take the backups with it.
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
 * The depth they used to have to provide alone now lives on the server, which
 * keeps ~40 revisions across ALL devices — these five were only ever local to
 * one browser and only ever taken before a merge.
 *
 * ⚠️ A single cycle can spend TWO of these: the retry path takes a snapshot per
 * attempt (see sync-cycle.mjs). At three, one bad cycle leaves one older slot.
 * That is acceptable given the server history behind it, but it is the reason
 * not to go lower than three.
 */
export const MAX_BACKUPS = 3;

/**
 * Trim an index to the cap, deleting the blobs that fall off, and persist it.
 *
 * Shared by save and list because trimming only on save leaves an index written
 * under an older, larger cap sitting over it indefinitely: lowering MAX_BACKUPS
 * took effect on the next write, so a device that had not merged since kept
 * showing five rows with no way to reach three. Pruning on read as well means a
 * changed cap applies the moment the panel is opened.
 *
 * Deletes the blob, not just the index entry. Dropping the row alone would hide
 * the backup while its payload sat in GM storage forever, which is the more
 * expensive half.
 *
 * ⚠️ Entries flagged `protected` are never dropped, and that flag is why the
 * flag exists on the ENTRY rather than being an argument. A read has no idea a
 * restore is in flight, so a prune-on-read that took `protect` as a parameter
 * would sail straight past it and delete the snapshot the restore was about to
 * read — the "restore destroys its own source" bug, reintroduced through the
 * read path instead of the write path. Storing it means every reader honours it.
 */
async function pruneTo(index) {
  const keep = [];
  const dropped = [];
  for (const [position, entry] of index.entries()) {
    if (position < MAX_BACKUPS || entry.protected) keep.push(entry);
    else dropped.push(entry);
  }
  if (dropped.length > 0) {
    for (const entry of dropped) await GM.deleteValue(entry.id);
    await GM.setValue(INDEX_KEY, keep);
  }
  return keep;
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

  // Clear any previous flag as we go. Protection covers one restore, and a
  // stale flag left behind would pin that entry above the cap permanently —
  // the index would creep upwards one orphan at a time.
  const next = [{ id, at: now, listCount: lists.length }, ...index].map(entry => (
    entry.id === protect ? { ...entry, protected: true } : { ...entry, protected: undefined }
  ));

  const keep = await pruneTo(next);
  // pruneTo only writes when it dropped something; a save always has to,
  // because the new entry is in `keep` and nowhere else yet.
  if (keep.length === next.length) await GM.setValue(INDEX_KEY, keep);
  return id;
}

export async function listBackups() {
  return pruneTo(await GM.getValue(INDEX_KEY, []));
}

export async function restoreBackup(id) {
  const raw = await GM.getValue(id, null);
  if (raw == null) throw new Error(`No such backup: ${id}`);
  return JSON.parse(raw);
}
