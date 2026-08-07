/**
 * PSNP++ - Sync Document
 * ======================
 *
 * Conversion between the PSNP+ on-disk shape and the sync document.
 *
 * PSNP+ stores lists as an array, with each list's games as an array. That shape
 * cannot express "this game was deleted" or "this record changed at time T",
 * both of which the merge needs. The sync document keys games by id, adds
 * updatedAt stamps and tombstones, and keeps the display order in a separate
 * gameOrder array so custom sorting survives the round trip.
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */

export const DOC_VERSION = 1;

/** Fields PSNP+ keeps on a list, excluding `id` and `games`. */
const META_FIELDS = [
  'name', 'tags', 'removeStartedGames', 'removeGames',
  'orderBy', 'direction', 'note', 'timestamp'
];

export function emptyDoc() {
  return { version: DOC_VERSION, lists: {} };
}

/** A list with a non-empty `url` is a PSNP+ remote list — never synced. */
export function isRemoteList(list) {
  return typeof list.url === 'string' && list.url !== '';
}

export function splitRemote(lists) {
  const syncable = [];
  const remote = [];
  for (const list of lists) {
    (isRemoteList(list) ? remote : syncable).push(list);
  }
  return { syncable, remote };
}

export function toDoc(lists) {
  const doc = emptyDoc();
  for (const list of splitRemote(lists).syncable) {
    const meta = { updatedAt: 0 };
    for (const field of META_FIELDS) meta[field] = list[field];

    const games = {};
    const gameOrder = [];
    for (const game of list.games ?? []) {
      games[game.id] = { ...game, updatedAt: 0 };
      gameOrder.push(game.id);
    }

    doc.lists[list.id] = {
      meta, games, gameOrder,
      orderUpdatedAt: 0,
      deletedGames: {},
      deletedAt: null
    };
  }
  return doc;
}

export function fromDoc(doc) {
  const lists = [];
  for (const [listId, node] of Object.entries(doc.lists)) {
    if (node.deletedAt != null) continue;

    // gameOrder is advisory: it can name games that are gone, and can omit
    // games a merge just brought in. Filter it, then append the strays.
    const ordered = node.gameOrder.filter(id => node.games[id] != null);
    const seen = new Set(ordered);
    for (const id of Object.keys(node.games)) {
      if (!seen.has(id)) ordered.push(id);
    }

    const list = { id: listId };
    for (const field of META_FIELDS) list[field] = node.meta[field];
    list.games = ordered.map(id => {
      const { updatedAt, ...game } = node.games[id];
      return game;
    });
    lists.push(list);
  }
  return lists;
}
