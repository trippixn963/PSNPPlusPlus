import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SHUTDOWNS_KEY, UNOBTAINABLES_KEY, SHUTDOWN_HORIZON_DAYS,
  readFeed, gamesInLists, shutdownWatch, unobtainableWatch,
  checkWatch, describeWatch, describeWatchDetail
} from '../src/watch.mjs';
import { LISTS_KEY } from '../src/lists-bridge.mjs';

const DAY = 24 * 60 * 60 * 1000;
const NOW = 1_800_000_000_000;

const fakeStorage = (initial = {}) => {
  const data = {};
  for (const [k, v] of Object.entries(initial)) {
    data[k] = typeof v === 'string' ? v : JSON.stringify(v);
  }
  return { getItem: k => (k in data ? data[k] : null), setItem: (k, v) => { data[k] = String(v); } };
};

/** PSNP+ wraps every cached feed as { timestamp, data: { version, list } }. */
const feed = list => ({ timestamp: NOW, data: { version: 1, list } });

const list = (name, games, over = {}) => ({
  id: `list-${name}`, name, tags: [], games, ...over
});
const game = (id, title) => ({ id, title, platforms: { ps5: true }, tags: [] });

// --- reading PSNP+'s caches -------------------------------------------------

test('the feed is unwrapped from PSNP+ own envelope', () => {
  const storage = fakeStorage({ [SHUTDOWNS_KEY]: feed({ '887': { title: 'inFamous 2' } }) });
  assert.deepEqual(readFeed(storage, SHUTDOWNS_KEY), { '887': { title: 'inFamous 2' } });
});

test('an unreadable, absent or misshapen cache reads as empty, never throws', () => {
  assert.deepEqual(readFeed(fakeStorage(), SHUTDOWNS_KEY), {});
  assert.deepEqual(readFeed(fakeStorage({ [SHUTDOWNS_KEY]: '{ not json' }), SHUTDOWNS_KEY), {});
  assert.deepEqual(readFeed(fakeStorage({ [SHUTDOWNS_KEY]: { data: { list: [] } } }), SHUTDOWNS_KEY), {});
  assert.deepEqual(readFeed(fakeStorage({ [SHUTDOWNS_KEY]: { nope: 1 } }), SHUTDOWNS_KEY), {});
});

// --- collecting the games ---------------------------------------------------

test('a game in two lists is reported once, naming both', () => {
  const storage = fakeStorage({ [LISTS_KEY]: [
    list('Wishlist', [game('100', 'Bloodborne')]),
    list('Backlog', [game('100', 'Bloodborne')])
  ] });
  const games = gamesInLists(storage);
  assert.equal(games.length, 1);
  assert.deepEqual(games[0].lists, ['Wishlist', 'Backlog']);
});

test('remote lists are included — they are still lists you keep', () => {
  const storage = fakeStorage({ [LISTS_KEY]: [
    list('Feed', [game('200', 'Elden Ring')], { url: 'https://example.test/feed.json' })
  ] });
  assert.equal(gamesInLists(storage).length, 1);
});

test('malformed entries are skipped rather than keyed as undefined', () => {
  const storage = fakeStorage({ [LISTS_KEY]: [
    list('Wishlist', [game('1', 'Good'), null, 'junk', { title: 'no id' }])
  ] });
  assert.deepEqual(gamesInLists(storage).map(g => g.id), ['1']);
});

// --- shutdowns --------------------------------------------------------------

test('an upcoming shutdown is reported with days remaining', () => {
  const games = [{ id: '887', title: 'inFamous 2', lists: ['Backlog'] }];
  const { soon } = shutdownWatch(games, { '887': { shutdownTimestamp: NOW + 30 * DAY, note: 'UGC' } }, NOW);
  assert.equal(soon.length, 1);
  assert.equal(soon[0].days, 30);
  assert.equal(soon[0].note, 'UGC');
});

test('a shutdown beyond the horizon is not mentioned yet', () => {
  const games = [{ id: '887', title: 'inFamous 2', lists: [] }];
  const far = { '887': { shutdownTimestamp: NOW + (SHUTDOWN_HORIZON_DAYS + 30) * DAY } };
  assert.equal(shutdownWatch(games, far, NOW).soon.length, 0);
});

test('an already-closed server is reported separately, not hidden', () => {
  // Not actionable, but it is the answer to "why will this never platinum".
  const games = [{ id: '887', title: 'inFamous 2', lists: [] }];
  const result = shutdownWatch(games, { '887': { shutdownTimestamp: NOW - 10 * DAY } }, NOW);
  assert.equal(result.soon.length, 0);
  assert.equal(result.passed.length, 1);
});

test('the soonest shutdown comes first', () => {
  const games = [
    { id: 'a', title: 'Later', lists: [] },
    { id: 'b', title: 'Sooner', lists: [] }
  ];
  const f = { a: { shutdownTimestamp: NOW + 60 * DAY }, b: { shutdownTimestamp: NOW + 5 * DAY } };
  assert.deepEqual(shutdownWatch(games, f, NOW).soon.map(g => g.title), ['Sooner', 'Later']);
});

test('a game with no shutdown entry, or a zero timestamp, is ignored', () => {
  const games = [{ id: 'a', title: 'Fine', lists: [] }, { id: 'b', title: 'Zero', lists: [] }];
  assert.deepEqual(shutdownWatch(games, { b: { shutdownTimestamp: 0 } }, NOW).soon, []);
});

// --- unobtainables ----------------------------------------------------------

test('unobtainable trophies are counted, worst first', () => {
  const games = [{ id: 'a', title: 'Few', lists: [] }, { id: 'b', title: 'Many', lists: [] }];
  const out = unobtainableWatch(games, { a: [1, 2], b: [1, 2, 3, 4, 5] });
  assert.deepEqual(out.map(g => g.title), ['Many', 'Few']);
  assert.equal(out[0].count, 5);
});

test('an empty unobtainable array is not a warning', () => {
  assert.deepEqual(unobtainableWatch([{ id: 'a', title: 'Clean', lists: [] }], { a: [] }), []);
});

// --- what the chip says -----------------------------------------------------

test('nothing closing means the chip says nothing', () => {
  const storage = fakeStorage({ [LISTS_KEY]: [list('Wishlist', [game('1', 'Fine')])] });
  assert.equal(describeWatch(checkWatch({ storage, now: NOW })), null);
});

test('the chip names the soonest and counts the rest', () => {
  const storage = fakeStorage({
    [LISTS_KEY]: [list('Backlog', [game('a', 'Closing Soon'), game('b', 'Also Closing')])],
    [SHUTDOWNS_KEY]: feed({
      a: { shutdownTimestamp: NOW + 3 * DAY },
      b: { shutdownTimestamp: NOW + 40 * DAY }
    })
  });
  const message = describeWatch(checkWatch({ storage, now: NOW }));
  assert.match(message, /Closing Soon/);
  assert.match(message, /in 3 days/);
  assert.match(message, /\+1 more/);
});

test('unobtainables alone never interrupt — they are permanent, not urgent', () => {
  const storage = fakeStorage({
    [LISTS_KEY]: [list('Backlog', [game('a', 'Broken')])],
    [UNOBTAINABLES_KEY]: feed({ a: [1, 2, 3] })
  });
  const watch = checkWatch({ storage, now: NOW });
  assert.equal(watch.unobtainable.length, 1, 'still known');
  assert.equal(describeWatch(watch), null, 'but not shouted about');
  assert.equal(describeWatchDetail(watch).length, 1, 'and visible in the panel');
});

test('the detail view covers all three kinds', () => {
  const storage = fakeStorage({
    [LISTS_KEY]: [list('Backlog', [game('a', 'Soon'), game('b', 'Gone'), game('c', 'Broken')])],
    [SHUTDOWNS_KEY]: feed({
      a: { shutdownTimestamp: NOW + 2 * DAY, note: 'servers' },
      b: { shutdownTimestamp: NOW - 5 * DAY }
    }),
    [UNOBTAINABLES_KEY]: feed({ c: [1] })
  });
  const lines = describeWatchDetail(checkWatch({ storage, now: NOW }));
  assert.equal(lines.length, 3);
  assert.match(lines.join('\n'), /Soon — shuts down in 2 days/);
  assert.match(lines.join('\n'), /Gone — servers already closed/);
  assert.match(lines.join('\n'), /Broken — 1 unobtainable trophy/);
});

test('a hostile storage yields an empty watch rather than throwing', () => {
  const hostile = { getItem() { throw new Error('nope'); } };
  assert.doesNotThrow(() => checkWatch({ storage: hostile, now: NOW }));
  assert.equal(describeWatch(checkWatch({ storage: hostile, now: NOW })), null);
});
