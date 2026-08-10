/**
 * PSNP++ - GM Storage Migration
 * =============================
 *
 * One-time move of GM storage from the `psnpsync.*` names to `psnppp.*`.
 *
 * Everything this script owns lives in GM storage under a name prefix, and the
 * PSNP++ rename changed that prefix. Without this, an existing install comes
 * back after the update looking like a brand-new device: no endpoint, no sync
 * key, no base document, and an empty restore menu — while the real values sit
 * unreachable under the old names.
 *
 * There are four families to move, and the fourth has a second level:
 *   psnpsync.endpoint          -> psnppp.endpoint
 *   psnpsync.key               -> psnppp.key
 *   psnpsync.base              -> psnppp.base
 *   psnpsync.backups           -> psnppp.backups      (an index of {id, at, listCount})
 *   psnpsync.backup.<ts>       -> psnppp.backup.<ts>  (the blob each index entry names)
 * Migrating the index without the blobs it references would leave the restore
 * menu listing entries whose data is gone — the escape hatch intact in name and
 * empty in fact, which is worse than no menu at all.
 *
 * ORDERING IS THE SAFETY PROPERTY. Every value is written to its new name
 * before the old name is deleted, and within the backup family every blob is
 * written before the new index is. That makes "the new index exists" imply "the
 * new side is complete", which is exactly the condition this module uses to
 * decide it has already run. An interrupted migration therefore either re-runs
 * from the top (nothing was deleted yet) or is already finished; it can never
 * resume into a half-copied state.
 *
 * Developer: Trippixn
 * Website:   https://trippixn.com
 * Discord:   discord.gg/syria
 */

import { DEFAULT_ENDPOINT } from './config.mjs';

/**
 * The endpoint PSNP++ shipped as its default before the rename.
 *
 * A stored value equal to this one was never a choice the user made — it is the
 * old prefilled default they pressed OK on — and the path it names stops
 * existing once the sidecar moves to /api/psnppp. Anything else is left alone:
 * a hand-typed endpoint is a customisation, and silently overwriting it would
 * point the user at a server they deliberately moved away from.
 */
export const OLD_DEFAULT_ENDPOINT = 'https://trippixn.com/api/psnp-sync';

const OLD_PREFIX = 'psnpsync.';
const NEW_PREFIX = 'psnppp.';

/**
 * Suffixes that move by a straight copy.
 *
 * `backups` is absent on purpose: its value names other keys, so it is handled
 * by migrateBackups, which rewrites the ids inside it instead of copying it
 * verbatim.
 */
const COPIED_SUFFIXES = ['endpoint', 'key', 'base'];

const OLD_BACKUP_PREFIX = `${OLD_PREFIX}backup.`;
const NEW_BACKUP_PREFIX = `${NEW_PREFIX}backup.`;
const OLD_INDEX_KEY = `${OLD_PREFIX}backups`;
const NEW_INDEX_KEY = `${NEW_PREFIX}backups`;
const OLD_ENDPOINT_KEY = `${OLD_PREFIX}endpoint`;
const NEW_ENDPOINT_KEY = `${NEW_PREFIX}endpoint`;

/**
 * `null` is the "not stored" sentinel throughout.
 *
 * GM.getValue's second argument is returned when the key is absent, and none of
 * the five values above can legitimately BE null — endpoint and key are
 * strings, base is a JSON string, the index is an array, a blob is a JSON
 * string. So `== null` cleanly separates absent from present without needing a
 * separate existence probe.
 */
const read = async key => GM.getValue(key, null);

/** Copy old -> new unless new already holds something, then drop old. */
async function moveKey(oldKey, newKey) {
  const oldValue = await read(oldKey);
  if (oldValue == null) return false;
  // Never clobber a value already sitting under the new name. If both exist the
  // new one is authoritative: it is either a completed migration or something
  // the user entered since the update, and both beat a stale pre-rename copy.
  if ((await read(newKey)) == null) await GM.setValue(newKey, oldValue);
  await GM.deleteValue(oldKey);
  return true;
}

/**
 * Move the backup index and every blob it names.
 *
 * Returns the number of blobs carried across. Entries whose id does not carry
 * the old prefix are passed through untouched, and an entry whose blob is
 * already missing keeps its (rewritten) id rather than being dropped: a
 * dangling entry restored the same way before this migration — `restoreBackup`
 * throws "No such backup" — and quietly shortening the menu would hide that
 * the data was already gone rather than lost here.
 */
async function migrateBackups() {
  const oldIndex = await read(OLD_INDEX_KEY);
  if (!Array.isArray(oldIndex)) return 0;
  // A new index already present means a previous run got as far as writing it,
  // and by the ordering rule below that only happens once every blob is across.
  if ((await read(NEW_INDEX_KEY)) != null) return 0;

  const newIndex = [];
  const oldBlobKeys = [];
  let moved = 0;

  for (const entry of oldIndex) {
    if (entry == null || typeof entry.id !== 'string' || !entry.id.startsWith(OLD_BACKUP_PREFIX)) {
      newIndex.push(entry);
      continue;
    }
    const newId = NEW_BACKUP_PREFIX + entry.id.slice(OLD_BACKUP_PREFIX.length);
    const blob = await read(entry.id);
    if (blob != null) {
      await GM.setValue(newId, blob);
      oldBlobKeys.push(entry.id);
      moved += 1;
    }
    newIndex.push({ ...entry, id: newId });
  }

  // Blobs first, index second, deletions last — see the module docstring.
  await GM.setValue(NEW_INDEX_KEY, newIndex);
  for (const key of oldBlobKeys) await GM.deleteValue(key);
  await GM.deleteValue(OLD_INDEX_KEY);
  return moved;
}

/**
 * Rewrite a stored endpoint that is still the pre-rename default.
 *
 * Runs against the NEW key and unconditionally, not just after a migration:
 * the same stale value can arrive either by being carried over above or by
 * having been typed into a fresh install from old notes, and both point at a
 * path that will stop answering.
 */
async function rewriteDefaultEndpoint() {
  const current = await read(NEW_ENDPOINT_KEY);
  if (current == null) return false;
  // The client strips trailing slashes before building request URLs, so both
  // spellings are the same endpoint and both are equally the old default.
  if (current !== OLD_DEFAULT_ENDPOINT && current !== `${OLD_DEFAULT_ENDPOINT}/`) return false;
  await GM.setValue(NEW_ENDPOINT_KEY, DEFAULT_ENDPOINT);
  return true;
}

/**
 * Run the migration. Idempotent, and a no-op on a fresh install.
 *
 * Returns a small summary purely so tests and the console can tell "migrated
 * something" from "found nothing to do" — no caller branches on it.
 */
export async function migrateGmStorage() {
  let keys = 0;
  for (const suffix of COPIED_SUFFIXES) {
    if (await moveKey(OLD_PREFIX + suffix, NEW_PREFIX + suffix)) keys += 1;
  }
  const blobs = await migrateBackups();
  const endpointRewritten = await rewriteDefaultEndpoint();
  return { keys, blobs, endpointRewritten };
}

export const MIGRATION_KEYS = {
  OLD_ENDPOINT_KEY, NEW_ENDPOINT_KEY, OLD_INDEX_KEY, NEW_INDEX_KEY,
  OLD_BACKUP_PREFIX, NEW_BACKUP_PREFIX, OLD_PREFIX, NEW_PREFIX
};
