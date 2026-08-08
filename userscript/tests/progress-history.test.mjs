import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GAMES_LIST_KEY, PROGRESS_DOCUMENT, MAX_POINTS_PER_GAME,
  emptyProgressDoc, readScrapedGames, observationOf, recordScrape, mergeProgress, movedSince,
  syncProgress
} from '../src/progress-history.mjs';

const fakeStorage = (initial = {}) => {
  const data = {};
  for (const [k, v] of Object.entries(initial)) {
    data[k] = typeof v === 'string' ? v : JSON.stringify(v);
  }
  return {
    getItem: k => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = String(v); },
    raw: k => data[k]
  };
};

const game = (id, progress, over = {}) => ({
  id, title: `Game ${id}`, url: `/game/${id}`, image: 'x.png', region: 'EU',
  scrapetime: 1, progress,
  lastActivity: 1000,
  trophies: { platinum: 0, gold: 1, silver: 2, bronze: 3 },
  platforms: { ps5: true },
  ...over
});

test('the document key is a distinct one', () => {
  assert.equal(PROGRESS_DOCUMENT, 'progress');
});

// --- reading ----------------------------------------------------------------

test('an unreadable cache reads as empty and never throws', () => {
  assert.deepEqual(readScrapedGames(fakeStorage({ [GAMES_LIST_KEY]: '{ not json' })), []);
  assert.deepEqual(readScrapedGames(fakeStorage({ [GAMES_LIST_KEY]: '{"a":1}' })), []);
  assert.deepEqual(readScrapedGames(fakeStorage()), []);
});

test('non-object entries are dropped rather than carried', () => {
  const storage = fakeStorage({ [GAMES_LIST_KEY]: [game('1', 10), null, 'junk', 5] });
  assert.equal(readScrapedGames(storage).length, 1);
});

test('reading never writes back to PSNP+ own key', () => {
  const storage = fakeStorage({ [GAMES_LIST_KEY]: [game('1', 10)] });
  const before = storage.raw(GAMES_LIST_KEY);
  readScrapedGames(storage);
  assert.equal(storage.raw(GAMES_LIST_KEY), before);
});

test('only the volatile fields are kept', () => {
  const observation = observationOf(game('1', 42));
  assert.deepEqual(Object.keys(observation).sort(), ['lastActivity', 'progress', 'trophies']);
});

// --- recording --------------------------------------------------------------

test('a first scrape records every game', () => {
  const { doc, recorded } = recordScrape(emptyProgressDoc(), [game('1', 10), game('2', 20)], 500);
  assert.equal(recorded, 2);
  assert.equal(doc.games['1'].points.length, 1);
  assert.equal(doc.games['1'].points[0].progress, 10);
});

test('re-scraping unchanged games records nothing', () => {
  // PSNP+ re-scrapes on every profile visit. Recording unconditionally would
  // bury the real changes under hundreds of duplicates.
  const first = recordScrape(emptyProgressDoc(), [game('1', 10)], 500).doc;
  const again = recordScrape(first, [game('1', 10)], 900);
  assert.equal(again.recorded, 0);
  assert.equal(again.doc.games['1'].points.length, 1);
});

test('a moving scrapetime alone is not a change', () => {
  const first = recordScrape(emptyProgressDoc(), [game('1', 10, { scrapetime: 111 })], 500).doc;
  const again = recordScrape(first, [game('1', 10, { scrapetime: 999999 })], 900);
  assert.equal(again.recorded, 0, 'scrapetime moves on every visit whether the game did or not');
});

test('real movement is recorded, and keeps the earlier point', () => {
  const first = recordScrape(emptyProgressDoc(), [game('1', 10)], 500).doc;
  const second = recordScrape(first, [game('1', 55)], 900).doc;
  assert.deepEqual(second.games['1'].points.map(p => p.progress), [10, 55]);
});

test('a trophy earned at the same percentage still counts', () => {
  const first = recordScrape(emptyProgressDoc(), [game('1', 90)], 500).doc;
  const withPlat = recordScrape(first, [game('1', 90, {
    trophies: { platinum: 1, gold: 1, silver: 2, bronze: 3 }
  })], 900);
  assert.equal(withPlat.recorded, 1);
});

test('a game with no id is skipped rather than keyed as undefined', () => {
  const { doc } = recordScrape(emptyProgressDoc(), [{ title: 'no id', progress: 5 }], 500);
  assert.deepEqual(Object.keys(doc.games), []);
});

test('points per game are capped, dropping the oldest', () => {
  let doc = emptyProgressDoc();
  for (let i = 0; i < MAX_POINTS_PER_GAME + 10; i += 1) {
    doc = recordScrape(doc, [game('1', i)], 1000 + i).doc;
  }
  const points = doc.games['1'].points;
  assert.equal(points.length, MAX_POINTS_PER_GAME);
  assert.equal(points[points.length - 1].progress, MAX_POINTS_PER_GAME + 9, 'newest kept');
  assert.equal(points[0].progress, 10, 'oldest dropped');
});

test('a renamed game updates its title without recording a movement', () => {
  const first = recordScrape(emptyProgressDoc(), [game('1', 10)], 500).doc;
  const renamed = recordScrape(first, [game('1', 10, { title: 'Game 1 Remastered' })], 900);
  assert.equal(renamed.recorded, 0);
  assert.equal(renamed.doc.games['1'].title, 'Game 1 Remastered');
});

// --- merging ----------------------------------------------------------------

test('two machines union their observations rather than one winning', () => {
  // Each device only sees what its own browsing rendered. Last-write-wins would
  // throw away half the record.
  const a = recordScrape(emptyProgressDoc(), [game('1', 10)], 100).doc;
  const b = recordScrape(emptyProgressDoc(), [game('1', 40)], 200).doc;
  const merged = mergeProgress(a, b);
  assert.deepEqual(merged.games['1'].points.map(p => p.progress), [10, 40]);
});

test('the same instant from both sides is kept once', () => {
  const a = recordScrape(emptyProgressDoc(), [game('1', 10)], 100).doc;
  assert.equal(mergeProgress(a, a).games['1'].points.length, 1);
});

test('merged points come back in time order and stay capped', () => {
  let a = emptyProgressDoc();
  let b = emptyProgressDoc();
  for (let i = 0; i < 40; i += 1) a = recordScrape(a, [game('1', i)], 1000 + i * 2).doc;
  for (let i = 0; i < 40; i += 1) b = recordScrape(b, [game('1', 100 + i)], 1001 + i * 2).doc;
  const points = mergeProgress(a, b).games['1'].points;
  assert.equal(points.length, MAX_POINTS_PER_GAME);
  assert.deepEqual([...points].sort((x, y) => x.at - y.at), points, 'in time order');
});

test('a malformed document merges as empty rather than throwing', () => {
  assert.doesNotThrow(() => mergeProgress(null, undefined));
  assert.doesNotThrow(() => mergeProgress({ games: 'nope' }, { games: [] }));
});

// --- reporting --------------------------------------------------------------

test('movedSince reports what changed, with when it was last seen', () => {
  let doc = recordScrape(emptyProgressDoc(), [game('1', 10), game('2', 50)], 100).doc;
  doc = recordScrape(doc, [game('1', 75), game('2', 50)], 900).doc;
  const moved = movedSince(doc, 500);
  assert.equal(moved.length, 1, 'only the game that actually moved');
  assert.equal(moved[0].id, '1');
  assert.equal(moved[0].from, 10);
  assert.equal(moved[0].to, 75);
  assert.equal(moved[0].lastSeen, 900);
});

test('movedSince counts platinums earned in the window', () => {
  let doc = recordScrape(emptyProgressDoc(), [game('1', 99)], 100).doc;
  doc = recordScrape(doc, [game('1', 100, {
    trophies: { platinum: 1, gold: 1, silver: 2, bronze: 3 }
  })], 900).doc;
  assert.equal(movedSince(doc, 500)[0].platinum, 1);
});

test('a game observed only once is not reported as movement', () => {
  const doc = recordScrape(emptyProgressDoc(), [game('1', 10)], 900).doc;
  assert.deepEqual(movedSince(doc, 500), []);
});

// --- the cycle --------------------------------------------------------------

const fakeServer = (doc = emptyProgressDoc(), revision = 0) => ({
  doc, revision, puts: 0,
  async getState() { return { revision: this.revision, updatedAt: 0, doc: this.doc }; },
  async putState(baseRevision, doc) {
    this.puts += 1;
    if (baseRevision !== this.revision) {
      return { ok: false, conflict: true, revision: this.revision, doc: this.doc };
    }
    this.doc = doc; this.revision += 1;
    return { ok: true, revision: this.revision };
  }
});

const runSync = (storage, server, base) => {
  let saved = base ?? emptyProgressDoc();
  return {
    promise: syncProgress({
      storage, client: server, now: 1000,
      loadBase: async () => saved, saveBase: async d => { saved = d; }
    }),
    get base() { return saved; }
  };
};

test('a scrape reaches the server', async () => {
  const server = fakeServer();
  const storage = fakeStorage({ [GAMES_LIST_KEY]: [game('1', 30)] });
  const result = await runSync(storage, server).promise;
  assert.equal(result.recorded, 1);
  assert.equal(server.doc.games['1'].points[0].progress, 30);
});

test('a page that scraped nothing new does not push', async () => {
  const server = fakeServer();
  const storage = fakeStorage({ [GAMES_LIST_KEY]: [game('1', 30)] });
  const first = runSync(storage, server);
  await first.promise;
  const putsAfterFirst = server.puts;

  const second = await syncProgress({
    storage, client: server, now: 2000,
    loadBase: async () => first.base, saveBase: async () => {}
  });
  assert.equal(second.pushed, false);
  assert.equal(server.puts, putsAfterFirst, 'most page loads scrape nothing new');
});

test('the other device\'s observations are never overwritten', async () => {
  const theirs = recordScrape(emptyProgressDoc(), [game('2', 80)], 100).doc;
  const server = fakeServer(theirs, 1);
  const storage = fakeStorage({ [GAMES_LIST_KEY]: [game('1', 30)] });
  await runSync(storage, server).promise;
  assert.deepEqual(Object.keys(server.doc.games).sort(), ['1', '2']);
});

test('never writes to PSNP+ own scrape cache', async () => {
  const server = fakeServer();
  const storage = fakeStorage({ [GAMES_LIST_KEY]: [game('1', 30)] });
  const before = storage.raw(GAMES_LIST_KEY);
  await runSync(storage, server).promise;
  assert.equal(storage.raw(GAMES_LIST_KEY), before);
});

test('a conflicting push leaves the base unadvanced', async () => {
  const server = fakeServer();
  server.putState = async () => ({ ok: false, conflict: true, revision: 9, doc: emptyProgressDoc() });
  const storage = fakeStorage({ [GAMES_LIST_KEY]: [game('1', 30)] });
  const h = runSync(storage, server);
  assert.equal((await h.promise).status, 'conflict');
  assert.deepEqual(h.base, emptyProgressDoc());
});
