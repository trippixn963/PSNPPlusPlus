/**
 * PSNP++ - Progress History
 * =========================
 *
 * Turns PSNP+'s throwaway scrape cache into a record.
 *
 * PSNP+ scrapes your own profile rows into `psnpp-gameslist` — progress
 * percentage, trophy counts, last activity — and then overwrites each entry on
 * your next visit. The current value is always there; every value it ever had
 * is gone. That makes questions like "what moved this week" or "how long has
 * that 87% game been sitting there" unanswerable, from data the browser already
 * had and threw away.
 *
 * What this is NOT: a complete daily census. PSNP+ only scrapes your own
 * profile, only the rows rendered on the page you loaded. So this is a diary
 * you write by visiting, not a log that runs on its own — and anything built on
 * it has to say when each game was last actually seen rather than implying
 * continuous coverage.
 *
 * Read-only with respect to PSNP+: this never writes `psnpp-gameslist`. PSNP+
 * treats that key as its own scrape output, and a second writer would be
 * fighting it for authorship of data we only want to observe.
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */

export const GAMES_LIST_KEY = 'psnpp-gameslist';
export const PROGRESS_DOCUMENT = 'progress';
export const PROGRESS_DOC_VERSION = 1;

/**
 * Points kept per game. Fifty observations of one game is already far more
 * history than anyone reads, and the document is pushed whole on every change —
 * an unbounded list would grow until it became the thing that filled the quota
 * this project warns about elsewhere.
 */
export const MAX_POINTS_PER_GAME = 50;

export function emptyProgressDoc() {
  return { version: PROGRESS_DOC_VERSION, games: {} };
}

const isPlainObject = value =>
  value != null && typeof value === 'object' && !Array.isArray(value);

/**
 * The scraped rows, or an empty array.
 *
 * Never throws and never repairs: an unreadable cache is PSNP+'s to rebuild on
 * the next profile visit, and this module has no business writing that key.
 */
export function readScrapedGames(storage) {
  try {
    const raw = storage.getItem(GAMES_LIST_KEY);
    if (typeof raw !== 'string') return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isPlainObject) : [];
  } catch {
    return [];
  }
}

const trophiesOf = game => {
  const t = isPlainObject(game.trophies) ? game.trophies : {};
  return {
    platinum: Number(t.platinum) || 0,
    gold: Number(t.gold) || 0,
    silver: Number(t.silver) || 0,
    bronze: Number(t.bronze) || 0
  };
};

/** The fields worth keeping. Deliberately drops image, url, region and platforms — static per game, and this document is pushed whole on every change. */
export function observationOf(game) {
  return {
    progress: Number(game.progress) || 0,
    trophies: trophiesOf(game),
    lastActivity: Number(game.lastActivity) || 0
  };
}

const sameObservation = (a, b) =>
  a != null && b != null
  && a.progress === b.progress
  && a.lastActivity === b.lastActivity
  && a.trophies.platinum === b.trophies.platinum
  && a.trophies.gold === b.trophies.gold
  && a.trophies.silver === b.trophies.silver
  && a.trophies.bronze === b.trophies.bronze;

/**
 * Fold a fresh scrape into the history, returning the new document and whether
 * anything was actually recorded.
 *
 * A point is appended only when the observation DIFFERS from the newest one
 * already held. PSNP+ re-scrapes on every profile visit and the values are
 * usually identical, so recording unconditionally would bury the handful of
 * real changes under hundreds of duplicates and blow the per-game cap within a
 * week of ordinary browsing.
 *
 * `scrapetime` deliberately does not count as a change. It moves on every
 * visit whether or not the game did, so treating it as signal would defeat the
 * whole point of the comparison.
 */
export function recordScrape(doc, games, now) {
  const base = isPlainObject(doc?.games) ? doc.games : {};
  const next = { ...base };
  let recorded = 0;

  for (const game of games) {
    const id = game?.id;
    if (id == null || id === '') continue;
    const key = String(id);

    const observation = observationOf(game);
    const existing = next[key];
    const points = Array.isArray(existing?.points) ? existing.points : [];
    const newest = points.length > 0 ? points[points.length - 1] : null;

    // A title that changed (a re-release, a regional variant) is worth keeping
    // current, but on its own it is not a progress event.
    const title = typeof game.title === 'string' && game.title !== ''
      ? game.title
      : (existing?.title ?? '');

    if (sameObservation(newest, observation)) {
      if (title !== existing?.title) next[key] = { ...existing, title };
      continue;
    }

    const appended = [...points, { at: now, ...observation }];
    next[key] = {
      title,
      points: appended.length > MAX_POINTS_PER_GAME
        ? appended.slice(appended.length - MAX_POINTS_PER_GAME)
        : appended
    };
    recorded += 1;
  }

  return { doc: { version: PROGRESS_DOC_VERSION, games: next }, recorded };
}

/**
 * Merge two histories by unioning each game's points on their timestamp.
 *
 * Deliberately not last-write-wins. Two machines observe the same profile
 * independently, so each holds real points the other never saw — picking a
 * winner would throw away half the record. Points are immutable observations of
 * a moment, so a union is both safe and the only thing that preserves what each
 * device actually witnessed.
 */
export function mergeProgress(localDoc, remoteDoc) {
  const local = isPlainObject(localDoc?.games) ? localDoc.games : {};
  const remote = isPlainObject(remoteDoc?.games) ? remoteDoc.games : {};
  const games = {};

  for (const key of new Set([...Object.keys(local), ...Object.keys(remote)])) {
    const mine = local[key];
    const theirs = remote[key];
    const byTime = new Map();
    for (const point of [...(mine?.points ?? []), ...(theirs?.points ?? [])]) {
      if (point == null || typeof point.at !== 'number') continue;
      // Same instant from both sides is the same observation; keep one.
      if (!byTime.has(point.at)) byTime.set(point.at, point);
    }
    const points = [...byTime.values()].sort((a, b) => a.at - b.at);
    games[key] = {
      title: theirs?.title || mine?.title || '',
      points: points.length > MAX_POINTS_PER_GAME
        ? points.slice(points.length - MAX_POINTS_PER_GAME)
        : points
    };
  }
  return { version: PROGRESS_DOC_VERSION, games };
}

/**
 * One progress sync: pull, union, fold in whatever this page happened to
 * scrape, push if that changed anything.
 *
 * Shorter than the other two cycles because this one never writes to PSNP+.
 * There is no local write to guard, so there is no backup, no compare-and-swap
 * and no write-after-push ordering to get right — the only thing at stake is
 * the archive on the server, and the merge is a union, so a lost round trip
 * costs nothing that the next one will not pick up.
 *
 * Skips the push when the result is byte-identical to what the server already
 * holds, which is the common case: most page loads scrape nothing new.
 */
export async function syncProgress({ storage, client, loadBase, saveBase, now = Date.now() }) {
  const base = (await loadBase()) ?? emptyProgressDoc();
  const remote = await client.getState();

  // Union first, then record — so a point this device observed while offline
  // survives alongside everything the other device has seen since.
  const merged = mergeProgress(base, remote.doc);
  const { doc, recorded } = recordScrape(merged, readScrapedGames(storage), now);

  if (JSON.stringify(doc) === JSON.stringify(remote.doc)) {
    await saveBase(doc);
    return { status: 'synced', recorded: 0, pushed: false };
  }

  const result = await client.putState(remote.revision, doc);
  if (result.ok) await saveBase(doc);
  return { status: result.ok ? 'synced' : 'conflict', recorded, pushed: result.ok };
}

/**
 * Games that moved since `since`, newest movement first.
 *
 * Reports `lastSeen` alongside the change precisely because coverage is uneven:
 * a game absent from this list did not necessarily stand still, it may simply
 * not have been on a page you loaded.
 */
export function movedSince(doc, since) {
  const out = [];
  for (const [id, game] of Object.entries(doc?.games ?? {})) {
    const points = Array.isArray(game?.points) ? game.points : [];
    if (points.length === 0) continue;
    const newest = points[points.length - 1];
    const before = [...points].reverse().find(p => p.at <= since);
    if (newest.at <= since) continue;
    const from = before ?? points[0];
    if (from === newest) continue;
    out.push({
      id,
      title: game.title,
      from: from.progress,
      to: newest.progress,
      platinum: newest.trophies.platinum - from.trophies.platinum,
      lastSeen: newest.at
    });
  }
  return out.sort((a, b) => b.lastSeen - a.lastSeen);
}
