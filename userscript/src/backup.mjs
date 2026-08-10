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
 * Author: Trippixn
 * Server: discord.gg/syria
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

  const next = [{ id, at: now, listCount: lists.length }, ...index];
  const keep = [];
  const dropped = [];
  for (const [position, entry] of next.entries()) {
    if (position < MAX_BACKUPS || entry.id === protect) keep.push(entry);
    else dropped.push(entry);
  }
  for (const entry of dropped) await GM.deleteValue(entry.id);
  await GM.setValue(INDEX_KEY, keep);
  return id;
}

export async function listBackups() {
  return GM.getValue(INDEX_KEY, []);
}

export async function restoreBackup(id) {
  const raw = await GM.getValue(id, null);
  if (raw == null) throw new Error(`No such backup: ${id}`);
  return JSON.parse(raw);
}
