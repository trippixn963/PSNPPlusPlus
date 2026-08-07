/**
 * First-run reconciliation of per-device list IDs.
 *
 * PSNP+ mints list IDs with uuidv4 on whichever device created the list, so the
 * same logical list has a different ID everywhere. Merging purely by ID would
 * leave the user with two lists called "Wishlist". Matching by name once, on a
 * device's first sync, fixes that.
 *
 * Only unambiguous matches are proposed: the name must occur exactly once on
 * each side, and neither list may already be present on the other side by ID.
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
