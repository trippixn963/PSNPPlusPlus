/**
 * Pre-merge snapshots of the raw lists.
 *
 * The merge writes to the only copy of this data that exists on the device, so
 * every write-back is preceded by a snapshot. Kept in GM storage rather than
 * localStorage so a PSNP+ reset cannot take the backups with it.
 */

const INDEX_KEY = 'psnppp.backups';
const MAX_BACKUPS = 5;

export async function saveBackup(lists, now = Date.now()) {
  const index = await GM.getValue(INDEX_KEY, []);
  const id = `psnppp.backup.${now}`;
  await GM.setValue(id, JSON.stringify(lists));

  const next = [{ id, at: now, listCount: lists.length }, ...index];
  const dropped = next.slice(MAX_BACKUPS);
  for (const entry of dropped) await GM.deleteValue(entry.id);
  await GM.setValue(INDEX_KEY, next.slice(0, MAX_BACKUPS));
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
