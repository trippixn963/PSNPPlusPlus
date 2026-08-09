/**
 * PSNP++ - List ID Adoption
 * =========================
 *
 * First-run reconciliation of per-device list IDs.
 *
 * PSNP+ mints list IDs with uuidv4 on whichever device created the list, so the
 * same logical list has a different ID everywhere. Merging purely by ID would
 * leave the user with two lists called "Wishlist". Matching by name once, on a
 * device's first sync, fixes that.
 *
 * Only unambiguous matches are proposed: the name must occur exactly once on
 * each side, and neither list may already be present on the other side by ID.
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */

const clone = value => JSON.parse(JSON.stringify(value));

/**
 * Normalize a list name for comparison: trim whitespace and lowercase.
 * Empty or whitespace-only names collapse to the empty string.
 * PSNP+ enforces non-empty list names in its UI ("This field cannot be empty."),
 * so we rely on that and do not validate empty names here.
 */
const normalize = name => String(name ?? '').trim().toLowerCase();

function indexByName(doc) {
  const byName = new Map();
  for (const [listId, node] of Object.entries(doc.lists)) {
    if (node.deletedAt != null) continue;
    const key = normalize(node.meta?.name);
    if (!byName.has(key)) byName.set(key, []);
    byName.get(key).push(listId);
  }
  return byName;
}

export function planAdoptions(localDoc, remoteDoc) {
  const remoteByName = indexByName(remoteDoc);
  const localByName = indexByName(localDoc);
  const adoptions = [];

  for (const [key, localIds] of localByName) {
    const remoteIds = remoteByName.get(key);
    if (localIds.length !== 1 || remoteIds == null || remoteIds.length !== 1) continue;

    const localId = localIds[0];
    const remoteId = remoteIds[0];
    if (localId === remoteId) continue;
    // The remote list already exists here under its own ID — not a rename target.
    if (localDoc.lists[remoteId] != null) continue;
    if (remoteDoc.lists[localId] != null) continue;

    adoptions.push({ localId, remoteId, name: localDoc.lists[localId].meta.name });
  }
  return adoptions;
}

/**
 * Rewrite local list IDs to remote IDs according to adoptions.
 *
 * CRITICAL: adoptions must be the unmodified return value of planAdoptions(localDoc, remoteDoc)
 * called against this same localDoc. Passing a stale, modified, or hand-built adoption array
 * can silently drop lists (e.g. if a remoteId collides with an existing local ID that is not
 * being renamed). This function guards against the most obvious collision but cannot prevent
 * every misuse — the caller must respect the plan→apply pairing invariant.
 *
 * Returns the input doc unchanged if adoptions is empty (identity, not a rebuild).
 */
export function applyAdoptions(localDoc, adoptions) {
  if (adoptions.length === 0) return localDoc;

  const rename = new Map(adoptions.map(a => [a.localId, a.remoteId]));

  // Guard against collisions: a remoteId that already exists locally and is not
  // being renamed away is a sign of a stale adoption or a violation of the plan→apply contract.
  for (const { remoteId } of adoptions) {
    if (localDoc.lists[remoteId] != null && !rename.has(remoteId)) {
      throw new Error(`Collision: remoteId "${remoteId}" already exists in local and is not being renamed`);
    }
  }

  const out = { version: localDoc.version, lists: {} };
  for (const [listId, node] of Object.entries(localDoc.lists)) {
    const newId = rename.get(listId) ?? listId;
    out.lists[newId] = clone(node);
  }
  return out;
}

/**
 * PSNP+ bookmarks the list you last used, by id, in its own storage key.
 *
 * Renaming a list id — which is exactly what an adoption does — leaves that
 * bookmark pointing at an id that no longer exists. PSNP+ does not survive
 * that: the small green add-to-list button beside every game is built with
 *
 *     const name = this._listStorage.getById(this._listId).name;
 *
 * and `getById` returns undefined for an id that is gone, so `.name` throws
 * inside the constructor and the button silently never renders. On every row,
 * on every page, until the user happens to open the lists page and click a
 * list. (Its lists page has a `?? lists[0]` fallback for this; the button path
 * does not.) Observed on one device and not another, which is the signature of
 * per-device state going stale — the two devices adopt at different times, so
 * only the one whose ids LOST the adoption ends up dangling.
 *
 * We caused it, so we repair it: the pointer follows the rename we performed.
 *
 * Deliberately narrow. It rewrites the bookmark ONLY when it names a list this
 * very adoption renamed, and never repoints a bookmark that dangles for any
 * other reason — a list the user genuinely deleted has a legitimately dead
 * bookmark, and silently choosing a different active list for them would be us
 * deciding something that is theirs to decide.
 *
 * Never throws. This is a courtesy repair to another script's private state on
 * a path that has already done the work that matters; failing the sync over it
 * would be absurd.
 */
export const SCRIPT_STATE_KEY = 'psnpp-scriptstate';
export const ACTIVE_LIST_FIELD = 'lastActiveGameList';

export function repointActiveList(storage, adoptions) {
  if (!Array.isArray(adoptions) || adoptions.length === 0) return false;
  try {
    const raw = storage.getItem(SCRIPT_STATE_KEY);
    if (raw == null) return false;
    const state = JSON.parse(raw);
    if (state == null || typeof state !== 'object' || Array.isArray(state)) return false;

    const current = state[ACTIVE_LIST_FIELD];
    if (typeof current !== 'string' || current === '') return false;

    const renamed = adoptions.find(a => a.localId === current);
    if (renamed == null) return false;

    state[ACTIVE_LIST_FIELD] = renamed.remoteId;
    storage.setItem(SCRIPT_STATE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
