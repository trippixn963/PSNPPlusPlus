/**
 * Pure 3-way merge for PSNP+ game lists.
 *
 * No DOM, no network, no storage — every function here takes plain objects and
 * returns new ones. All the risk in this project lives in this file, so it is
 * kept isolated and exhaustively unit-tested.
 */

import { DOC_VERSION } from './doc.mjs';

export const TOMBSTONE_TTL_MS = 90 * 24 * 60 * 60 * 1000;

const clone = value => JSON.parse(JSON.stringify(value));

/** Structural equality, ignoring the internal updatedAt field. */
function sameRecord(a, b) {
  if (a == null || b == null) return false;
  const { updatedAt: _a, ...left } = a;
  const { updatedAt: _b, ...right } = b;
  return JSON.stringify(left) === JSON.stringify(right);
}

function sameOrder(a, b) {
  return a.length === b.length && a.every((id, i) => id === b[i]);
}

/**
 * Fill in updatedAt stamps and derive tombstones by diffing local against base.
 *
 * `base` is the document as of the last successful sync on this device. Anything
 * in base but missing from local was deleted here, and must be recorded as a
 * tombstone — otherwise the next merge would treat it as a remote addition and
 * hand it straight back.
 */
export function stampChanges(base, local, now) {
  const out = { version: DOC_VERSION, lists: {} };

  for (const [listId, localList] of Object.entries(local.lists)) {
    const baseList = base.lists[listId];
    const node = clone(localList);

    node.meta.updatedAt = sameRecord(localList.meta, baseList?.meta)
      ? baseList.meta.updatedAt
      : now;

    node.orderUpdatedAt = baseList != null && sameOrder(localList.gameOrder, baseList.gameOrder)
      ? baseList.orderUpdatedAt
      : now;

    for (const [gameId, localGame] of Object.entries(localList.games)) {
      const baseGame = baseList?.games?.[gameId];
      node.games[gameId].updatedAt = sameRecord(localGame, baseGame)
        ? baseGame.updatedAt
        : now;
    }

    // Carry forward tombstones we already know about, then add newly missing games.
    node.deletedGames = { ...(baseList?.deletedGames ?? {}) };
    for (const gameId of Object.keys(baseList?.games ?? {})) {
      if (localList.games[gameId] == null && node.deletedGames[gameId] == null) {
        node.deletedGames[gameId] = now;
      }
    }

    node.deletedAt = null;
    out.lists[listId] = node;
  }

  // Lists present at last sync but gone now were deleted on this device.
  for (const [listId, baseList] of Object.entries(base.lists)) {
    if (local.lists[listId] != null) continue;
    out.lists[listId] = {
      meta: clone(baseList.meta),
      games: {},
      gameOrder: [],
      orderUpdatedAt: baseList.orderUpdatedAt,
      deletedGames: clone(baseList.deletedGames ?? {}),
      deletedAt: baseList.deletedAt ?? now
    };
  }

  return out;
}
