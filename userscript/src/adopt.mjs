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

export function applyAdoptions(localDoc, adoptions) {
  if (adoptions.length === 0) return localDoc;
  const rename = new Map(adoptions.map(a => [a.localId, a.remoteId]));
  const out = { version: localDoc.version, lists: {} };
  for (const [listId, node] of Object.entries(localDoc.lists)) {
    out.lists[rename.get(listId) ?? listId] = node;
  }
  return out;
}
