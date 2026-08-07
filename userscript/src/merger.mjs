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
 *
 * `undefined` is handled exactly as JSON.stringify handles it — an
 * undefined-valued object key is omitted, an undefined array element becomes
 * null — because this function is the comparison side of a pair whose other
 * side is JSON.stringify. `doc.mjs` copies all 8 META_FIELDS unconditionally,
 * so a list that never had (say) `removeGames` gets `meta.removeGames =
 * undefined`; the base document is persisted with JSON.stringify, which DROPS
 * that key. Emitting `"removeGames":undefined` for the live side and nothing
 * for the persisted side made `sameRecord` false on every single cycle, so
 * `meta.updatedAt` re-stamped to `now` forever: renames flipped between devices
 * without ever converging, and a deleted list came back permanently because
 * `latestActivity` always beat the deletion timestamp. PSNP+ itself carries
 * `!= null` fallbacks for removeGames/orderBy/direction, so such lists exist.
 */
function stableStringify(obj) {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    // JSON.stringify renders a hole/undefined element as null; match it.
    return '[' + obj.map(v => (v === undefined ? 'null' : stableStringify(v))).join(',') + ']';
  }
  const sorted = Object.keys(obj)
    .filter(k => obj[k] !== undefined)
    .sort()
    .map(k => `"${k}":${stableStringify(obj[k])}`);
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

/**
 * Pick the newer of two records by their own `updatedAt`. On an exact tie (a
 * same-millisecond concurrent edit) break deterministically by content, so
 * both devices land on the same answer regardless of which one calls itself
 * "local" — otherwise each side would keep favoring its own copy forever and
 * the merge would never converge.
 */
function pickNewer(localItem, remoteItem) {
  const localTs = localItem?.updatedAt ?? 0;
  const remoteTs = remoteItem?.updatedAt ?? 0;
  if (localTs !== remoteTs) return localTs > remoteTs ? localItem : remoteItem;
  return stableStringify(localItem) >= stableStringify(remoteItem) ? localItem : remoteItem;
}

/**
 * Pick which side's gameOrder governs the merged list. A still-deleted node
 * always defers to the other side, regardless of its own orderUpdatedAt —
 * stampChanges empties a deleted node's gameOrder but leaves its
 * orderUpdatedAt pointing at base, so treating that stamp as authoritative
 * would hand order control to an empty array and scramble numeric-string
 * game ids (which JS enumerates in ascending numeric order, not insertion
 * order) whenever the surviving side's edit happened not to touch order.
 * An exact orderUpdatedAt tie between two live nodes breaks by content, for
 * the same convergence reason as pickNewer.
 */
function pickOrderSource(localNode, remoteNode) {
  if (localNode.deletedAt != null) return remoteNode;
  if (remoteNode.deletedAt != null) return localNode;
  const localTs = localNode.orderUpdatedAt ?? 0;
  const remoteTs = remoteNode.orderUpdatedAt ?? 0;
  if (localTs !== remoteTs) return localTs > remoteTs ? localNode : remoteNode;
  return stableStringify(localNode.gameOrder) >= stableStringify(remoteNode.gameOrder)
    ? localNode : remoteNode;
}

function mergeList(localNode, remoteNode) {
  if (localNode == null) return clone(remoteNode);
  if (remoteNode == null) return clone(localNode);

  // A deletion only stands if nothing newer happened on the other side. A tie
  // (activity at exactly the deletion's timestamp) favors the activity, not
  // the deletion: resurrecting a list that should have stayed deleted is
  // recoverable (delete it again), but dropping a genuine add is not.
  const deletedAt = Math.max(localNode.deletedAt ?? 0, remoteNode.deletedAt ?? 0);
  if (deletedAt > 0) {
    const survivor = localNode.deletedAt != null ? remoteNode : localNode;
    if (deletedAt > latestActivity(survivor)) {
      const meta = clone(pickNewer(localNode.meta, remoteNode.meta));
      // Carry the deleting side's own order stamp, not a max of both — the
      // surviving side's real orderUpdatedAt has nothing to do with this
      // now-empty gameOrder and must not be allowed to look authoritative
      // if the list is ever resurrected later.
      const deletingNode = localNode.deletedAt != null ? localNode : remoteNode;
      return {
        meta, games: {}, gameOrder: [],
        orderUpdatedAt: deletingNode.orderUpdatedAt ?? 0,
        deletedGames: mergeTombstones(localNode.deletedGames, remoteNode.deletedGames),
        deletedAt
      };
    }
    // Otherwise the list is resurrected by the newer edits and falls through.
  }

  const meta = clone(pickNewer(localNode.meta, remoteNode.meta));
  const deletedGames = mergeTombstones(localNode.deletedGames, remoteNode.deletedGames);

  const games = {};
  const gameIds = new Set([...Object.keys(localNode.games), ...Object.keys(remoteNode.games)]);
  for (const gameId of gameIds) {
    const localGame = localNode.games[gameId];
    const remoteGame = remoteNode.games[gameId];
    const winner = localGame == null ? remoteGame
      : remoteGame == null ? localGame
      : pickNewer(localGame, remoteGame);

    const tombstone = deletedGames[gameId];
    if (tombstone != null && tombstone > winner.updatedAt) continue;
    // The record is newer than the delete: it was re-added, so retire the tombstone.
    if (tombstone != null) delete deletedGames[gameId];
    games[gameId] = clone(winner);
  }

  const orderSource = pickOrderSource(localNode, remoteNode);
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
