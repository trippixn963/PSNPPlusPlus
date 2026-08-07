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

/**
 * Serialize an object to JSON with keys sorted recursively.
 * Arrays retain their order (order-bearing), only object keys are sorted.
 * This ensures structural equality is independent of key insertion order.
 */
function stableStringify(obj) {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(stableStringify).join(',') + ']';
  }
  const sorted = Object.keys(obj).sort().map(k => `"${k}":${stableStringify(obj[k])}`);
  return '{' + sorted.join(',') + '}';
}

/** Structural equality, ignoring the internal updatedAt field.
 * Comparison is key-order independent: two objects with identical content
 * but different key insertion order are treated as equal.
 */
function sameRecord(a, b) {
  if (a == null || b == null) return false;
  const { updatedAt: _a, ...left } = a;
  const { updatedAt: _b, ...right } = b;
  return stableStringify(left) === stableStringify(right);
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

    // Carry forward tombstones we already know about (excluding games that reappeared),
    // then add newly missing games.
    node.deletedGames = {};
    for (const [gameId, timestamp] of Object.entries(baseList?.deletedGames ?? {})) {
      if (localList.games[gameId] == null) {
        node.deletedGames[gameId] = timestamp;
      }
    }
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

/** Per-game-id maximum of two tombstone maps. */
function mergeTombstones(left = {}, right = {}) {
  const out = { ...left };
  for (const [gameId, deletedAt] of Object.entries(right)) {
    if (out[gameId] == null || deletedAt > out[gameId]) out[gameId] = deletedAt;
  }
  return out;
}

/** The most recent activity on a list — used to judge a deletion against edits. */
function latestActivity(node) {
  if (node == null) return 0;
  let latest = Math.max(node.meta?.updatedAt ?? 0, node.orderUpdatedAt ?? 0);
  for (const game of Object.values(node.games ?? {})) {
    if (game.updatedAt > latest) latest = game.updatedAt;
  }
  return latest;
}

function mergeList(localNode, remoteNode) {
  if (localNode == null) return clone(remoteNode);
  if (remoteNode == null) return clone(localNode);

  // A deletion only stands if nothing newer happened on the other side.
  const deletedAt = Math.max(localNode.deletedAt ?? 0, remoteNode.deletedAt ?? 0);
  if (deletedAt > 0) {
    const survivor = localNode.deletedAt != null ? remoteNode : localNode;
    if (deletedAt >= latestActivity(survivor)) {
      const meta = clone((localNode.meta?.updatedAt ?? 0) >= (remoteNode.meta?.updatedAt ?? 0)
        ? localNode.meta : remoteNode.meta);
      return {
        meta, games: {}, gameOrder: [],
        orderUpdatedAt: Math.max(localNode.orderUpdatedAt ?? 0, remoteNode.orderUpdatedAt ?? 0),
        deletedGames: mergeTombstones(localNode.deletedGames, remoteNode.deletedGames),
        deletedAt
      };
    }
    // Otherwise the list is resurrected by the newer edits and falls through.
  }

  const meta = clone(localNode.meta.updatedAt >= remoteNode.meta.updatedAt
    ? localNode.meta : remoteNode.meta);
  const deletedGames = mergeTombstones(localNode.deletedGames, remoteNode.deletedGames);

  const games = {};
  const gameIds = new Set([...Object.keys(localNode.games), ...Object.keys(remoteNode.games)]);
  for (const gameId of gameIds) {
    const localGame = localNode.games[gameId];
    const remoteGame = remoteNode.games[gameId];
    const winner = localGame == null ? remoteGame
      : remoteGame == null ? localGame
      : (localGame.updatedAt >= remoteGame.updatedAt ? localGame : remoteGame);

    const tombstone = deletedGames[gameId];
    if (tombstone != null && tombstone > winner.updatedAt) continue;
    // The record is newer than the delete: it was re-added, so retire the tombstone.
    if (tombstone != null) delete deletedGames[gameId];
    games[gameId] = clone(winner);
  }

  const orderSource = (localNode.orderUpdatedAt ?? 0) >= (remoteNode.orderUpdatedAt ?? 0)
    ? localNode : remoteNode;
  const gameOrder = orderSource.gameOrder.filter(id => games[id] != null);
  const seen = new Set(gameOrder);
  for (const gameId of Object.keys(games)) {
    if (!seen.has(gameId)) gameOrder.push(gameId);
  }

  return {
    meta, games, gameOrder,
    orderUpdatedAt: Math.max(localNode.orderUpdatedAt ?? 0, remoteNode.orderUpdatedAt ?? 0),
    deletedGames,
    deletedAt: null
  };
}

/**
 * Three-way merge. `local` must already have been through stampChanges, so its
 * timestamps and tombstones are populated.
 *
 * `base` and `now` are accepted for call-site symmetry with `stampChanges` (and
 * because Task 10 calls this with all four arguments), but are intentionally
 * unused here: `local` already carries the base-derived stamps and tombstones,
 * and every resolution below is driven by timestamps already baked into the
 * two documents rather than by wall-clock time.
 */
export function mergeDoc(base, local, remote, now) {
  const out = { version: DOC_VERSION, lists: {} };
  const listIds = new Set([...Object.keys(local.lists), ...Object.keys(remote.lists)]);
  for (const listId of listIds) {
    out.lists[listId] = mergeList(local.lists[listId], remote.lists[listId]);
  }
  return out;
}

/** Drop tombstones and deleted lists that are older than the TTL. */
export function gcTombstones(doc, now, ttl = TOMBSTONE_TTL_MS) {
  const out = { version: DOC_VERSION, lists: {} };
  for (const [listId, node] of Object.entries(doc.lists)) {
    if (node.deletedAt != null && now - node.deletedAt > ttl) continue;
    const copy = clone(node);
    for (const [gameId, deletedAt] of Object.entries(copy.deletedGames)) {
      if (now - deletedAt > ttl) delete copy.deletedGames[gameId];
    }
    out.lists[listId] = copy;
  }
  return out;
}
