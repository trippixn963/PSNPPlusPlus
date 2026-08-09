import test from 'node:test';
import assert from 'node:assert/strict';
import { checkPsnpPlusCompat, readPsnpPlusVersion, describeIncompatibility, SCRIPT_STATE_KEY }
  from '../src/compat.mjs';
import { LISTS_KEY, readLists } from '../src/lists-bridge.mjs';
import { runSyncCycle } from '../src/sync-cycle.mjs';
import { emptyDoc } from '../src/doc.mjs';
import { installFakeDocument, uninstallFakeDocument, installFakeWindow, uninstallFakeWindow,
  installFakeGM, uninstallFakeGM, fakeStorage } from './fake-dom.mjs';
import { saveConfig, DEFAULT_ENDPOINT } from '../src/config.mjs';
import { start, recordPsnpPlusVersion, createIndicatorPainter } from '../src/main.mjs';

/**
 * PSNP++ - PSNP+ compatibility self-check
 * =======================================
 *
 * PSNP+ is a third-party script that auto-updates itself, and this project
 * depends on exactly one surface of it: localStorage['psnpp-lists']. These
 * tests pin what happens on the day HusKyCode changes that shape — the sync
 * must PAUSE and say so, not quietly act on a shape it does not understand.
 *
 * Every fixture below is the real PSNP+ v11.14 shape, transcribed from its
 * bundle. There is no vendor/ copy any more — PSNP+ is installed separately and
 * updates itself — so these fixtures ARE the record of what this code expects.
 * When PSNP+ changes shape, the honest fix is to add the new fixture beside the
 * old one, not to edit this one until it passes
 * (ListCreatePanel's newList for lists, ListScraper.getFromTrophiesPage for
 * games), not a shape invented for the test.
 */

// --- fixtures ---------------------------------------------------------------

/** A game exactly as PSNP+'s scraper writes one. */
const realGame = (id, over = {}) => ({
  id,
  scrapetime: 1754500000000,
  title: `Game ${id}`,
  image: 'https://i.psnprofiles.com/games/00/x.png',
  url: `https://psnprofiles.com/trophies/${id}-game`,
  points: 1230,
  platforms: { ps5: true, ps4: false, ps3: false, psvita: false, psvr: false, pc: false },
  trophies: { platinum: 1, gold: 2, silver: 5, bronze: 20 },
  region: 'US',
  dlccount: 0,
  platinumpct: 12.3,
  completepct: 8.1,
  timestamp: 1754500000000,
  tags: ['@backlog'],
  note: '',
  ...over
});

/** A list exactly as PSNP+'s create/edit panel writes one. */
const realList = (id, name, games = [], over = {}) => ({
  id,
  name,
  timestamp: 1754500000000,
  tags: [],
  orderBy: 'custom',
  direction: 'ascending',
  removeGames: 'never',
  note: '',
  url: '',
  games,
  removeStartedGames: false,
  ...over
});

const storageOf = raw => {
  const data = {};
  if (raw !== undefined) {
    data[LISTS_KEY] = typeof raw === 'string' ? raw : JSON.stringify(raw);
  }
  return fakeStorage(data);
};

const checkOf = raw => checkPsnpPlusCompat(storageOf(raw));

/** Assert the check REFUSED, and for the reason we meant. */
const assertIncompatible = (raw, code) => {
  const result = checkOf(raw);
  assert.equal(result.ok, false, `expected an incompatibility (${code}), got ok`);
  assert.equal(result.code, code);
  assert.equal(typeof result.reason, 'string');
  assert.ok(result.reason.length > 0, 'an incompatibility must carry a human reason');
};

// --- today's real shape passes ----------------------------------------------

test("today's real PSNP+ v11.14 shape is compatible", () => {
  const lists = [
    realList('4a1f-1', 'Wishlist', [realGame('12345'), realGame('67890')]),
    realList('4a1f-2', 'Backlog', [realGame('11111')], { removeGames: 'platinum', tags: ['@rpg'] }),
    // A 📡 remote list, which PSNP+ fills from a feed URL and we never convert.
    realList('4a1f-3', 'Shared', [realGame('22222')], { url: 'https://example.test/list.json' })
  ];
  const result = checkPsnpPlusCompat(storageOf(lists));
  assert.equal(result.ok, true, `unexpected incompatibility: ${result.reason}`);
  assert.equal(result.code, null);
});

test('the shapes PSNP+ itself tolerates are compatible', () => {
  // PSNP+ carries `!= null` fallbacks for removeGames / orderBy / direction /
  // url (ListCreatePanel's EDIT branch), and merger.mjs's stableStringify
  // docstring records that such lists exist in the wild. Demanding all eight
  // meta fields on every list would halt those users.
  const spartan = { id: 'old-1', name: 'From an older PSNP+', games: [realGame('99999')] };
  assert.equal(checkOf([spartan]).ok, true);
  assert.equal(checkOf([{ ...spartan, url: null }]).ok, true, 'a null url is PSNP+\'s own idiom');
  assert.equal(checkOf([{ ...spartan, id: 7 }]).ok, true, 'a numeric id still keys a document');
  assert.equal(checkOf([{ ...spartan, games: [realGame(4242)] }]).ok, true, 'numeric game ids too');
});

// --- no false positives -----------------------------------------------------

test('a brand-new install (the key has never been written) is compatible', () => {
  const result = checkPsnpPlusCompat(storageOf(undefined));
  assert.equal(result.ok, true);
  assert.equal(result.code, null);
});

test('an empty list array is compatible', () => {
  assert.equal(checkOf([]).ok, true);
  assert.equal(checkOf('[]').ok, true);
  assert.equal(checkOf('[ ]').ok, true);
  assert.equal(checkOf('[\n]').ok, true);
});

test('a user with zero syncable lists is compatible', () => {
  // Every list is 📡 remote, so there is nothing for toDoc to convert. This is
  // an ordinary state, not a format change.
  const remoteOnly = [
    realList('r1', 'Feed A', [realGame('1')], { url: 'https://example.test/a.json' }),
    realList('r2', 'Feed B', [], { url: 'https://example.test/b.json' })
  ];
  assert.equal(checkOf(remoteOnly).ok, true);
});

test('a 📡 remote list is never judged on its interior', () => {
  // PSNP+ fills a 📡 list from an arbitrary third-party URL (gmFetchJson), and
  // PSNP++ never converts one: splitRemote sets it aside and writeSyncable
  // hands it back byte-for-byte. Judging a feed's contents would pause a
  // healthy user's sync over data this project does not even read.
  const alienFeed = {
    id: 'r1',
    name: 'Feed',
    url: 'https://example.test/a.json',
    games: { '1': { title: 'keyed, not an array' } },
    updatedAt: 999
  };
  assert.equal(checkOf([realList('a', 'Wishlist', [realGame('1')]), alienFeed]).ok, true);
  assert.equal(checkOf([{ ...alienFeed, games: ['a string game', 42] }]).ok, true);
  assert.equal(checkOf([{ ...alienFeed, games: [{ noId: true, updatedAt: 1 }] }]).ok, true);
  assert.equal(checkOf([{ ...alienFeed, id: { v: 2 } }]).ok, true);
});

test('a list with zero games is compatible', () => {
  assert.equal(checkOf([realList('a', 'Empty', [])]).ok, true);
  // `games` missing entirely is tolerated by toDoc (`list.games ?? []`).
  const { games, ...noGames } = realList('b', 'Also empty');
  assert.equal(games.length, 0);
  assert.equal(checkOf([noGames]).ok, true);
  assert.equal(checkOf([{ ...noGames, games: null }]).ok, true);
});

// --- each assumption, violated on its own ------------------------------------

test('a list id that is not a usable identity is caught', () => {
  // toDoc keys doc.lists by list.id; an object id collapses to the string
  // "[object Object]" and two of them silently merge into one list.
  assertIncompatible([realList({ v: 2, value: 'a' }, 'Wishlist', [realGame('1')])], 'list-id');
  assertIncompatible([realList(true, 'Wishlist', [realGame('1')])], 'list-id');
  assertIncompatible([realList(['a'], 'Wishlist', [realGame('1')])], 'list-id');
});

test('a games collection that is no longer an array is caught', () => {
  // toDoc does `for (const game of list.games ?? [])`: an object throws a raw
  // TypeError out of the cycle, and a string iterates its CHARACTERS.
  assertIncompatible([realList('a', 'Wishlist', { '1': realGame('1') })], 'games-not-array');
  assertIncompatible([realList('a', 'Wishlist', 'g1,g2')], 'games-not-array');
  assertIncompatible([realList('a', 'Wishlist', 7)], 'games-not-array');
});

test('a game entry that is not an object is caught', () => {
  // `{...game, updatedAt: 0}` on a string spreads its character indices.
  assertIncompatible([realList('a', 'Wishlist', ['12345'])], 'game-not-object');
  assertIncompatible([realList('a', 'Wishlist', [null])], 'game-not-object');
  assertIncompatible([realList('a', 'Wishlist', [realGame('1'), 42])], 'game-not-object');
});

test('a game without a usable id is caught', () => {
  // Every id-less game is keyed under the literal string "undefined", so a list
  // of them collapses to ONE game and the rest are pushed away as deletions.
  const { id, ...noId } = realGame('1');
  assert.equal(id, '1');
  assertIncompatible([realList('a', 'Wishlist', [noId])], 'game-id');
  assertIncompatible([realList('a', 'Wishlist', [realGame(null)])], 'game-id');
  assertIncompatible([realList('a', 'Wishlist', [realGame({ gameId: '1' })])], 'game-id');
});

test('a game that carries its own updatedAt is caught', () => {
  // toDoc writes `updatedAt: 0` over it and fromDoc strips it back off, so a
  // real PSNP+ updatedAt would be destroyed on every game on every sync.
  assertIncompatible([realList('a', 'Wishlist', [realGame('1', { updatedAt: 123 })])],
    'game-updated-at');
  // Even an explicit null is a key we would eat.
  assertIncompatible([realList('a', 'Wishlist', [realGame('1', { updatedAt: null })])],
    'game-updated-at');
});

test('a url that is no longer a string is caught', () => {
  // isRemoteList is `typeof list.url === 'string'`. A structured url would make
  // every 📡 list read as syncable, and PSNP++ would start overwriting feeds.
  assertIncompatible([realList('a', 'Feed', [], { url: { href: 'https://x.test/a.json' } })],
    'list-url');
  assertIncompatible([realList('a', 'Feed', [], { url: ['https://x.test/a.json'] })], 'list-url');
});

test('lists that no longer carry a name at all are caught', () => {
  // fromDoc rebuilds a list out of id + META_FIELDS, so a renamed meta field is
  // DELETED from the user's data on the next write-back. `name` is the one meta
  // field this project actively relies on (adopt.mjs matches lists by it).
  const { name, ...nameless } = realList('a', 'Wishlist', [realGame('1')]);
  assert.equal(name, 'Wishlist');
  assertIncompatible([nameless], 'list-name');
  assertIncompatible([nameless, { ...realList('b', 'x', []), name: undefined }], 'list-name');
});

test('one odd imported list among healthy ones does not halt a healthy user', () => {
  // PSNP+'s own importList() creates a list from an arbitrary JSON file, so a
  // single nameless list is a thing a real user can have. It must not be read
  // as "PSNP+ changed its format".
  const { name, ...nameless } = realList('imported', 'x', [realGame('1')]);
  assert.equal(name, 'x');
  assert.equal(checkOf([realList('a', 'Wishlist', [realGame('2')]), nameless]).ok, true);
});

// --- the boundary with looksCorrupt -----------------------------------------

/**
 * Damaged data is NOT this check's business.
 *
 * sync-cycle.mjs's `looksCorrupt` already refuses to sync bytes that did not
 * parse into the lists we recovered, and it halts with the message that fits
 * damage ("unreadable — restore a backup"). Speaking first, with "PSNP+ changed
 * its format", would tell a user with a truncated quota write the wrong story
 * and send them looking for an update that does not exist. So the compat check
 * stays silent on everything looksCorrupt owns — and these tests prove that
 * silence is safe by driving the real cycle over the same inputs.
 */
const CORRUPT_INPUTS = ['not json at all', '', '   ', '{"lists":[]}', '[null]', '[{}]',
  '["a list"]', '[[]]', '[1,2]'];

test('damage is left to looksCorrupt — the compat check stays silent on it', () => {
  for (const raw of CORRUPT_INPUTS) {
    const result = checkPsnpPlusCompat(storageOf(raw));
    assert.equal(result.ok, true, `compat must not speak for damaged data: ${JSON.stringify(raw)}`);
  }
});

test('and the cycle still halts on every one of those, writing nothing', async () => {
  for (const raw of CORRUPT_INPUTS) {
    const storage = storageOf(raw);
    const puts = [];
    const result = await runSyncCycle({
      storage,
      client: {
        async getState() { return { revision: 3, updatedAt: 0, doc: emptyDoc() }; },
        async putState(revision, doc) { puts.push({ revision, doc }); return { ok: true, revision: 4 }; }
      },
      loadBase: async () => emptyDoc(),
      saveBase: async () => {},
      saveBackup: async () => {},
      confirmAdoptions: async () => true,
      now: 1000
    });
    assert.equal(result.status, 'corrupt', `expected corrupt for ${JSON.stringify(raw)}`);
    assert.deepEqual(puts, [], `nothing may be pushed for ${JSON.stringify(raw)}`);
    assert.equal(storage.getItem(LISTS_KEY), raw, 'storage must be untouched');
  }
});

// --- the check itself can never throw ---------------------------------------

test('the check never throws, whatever is in storage', () => {
  const nasty = [
    undefined, '', ' ', 'null', 'true', '0', '"a string"', '{}', '[]', '[[[[]]]]',
    '[null,null]', '[{"id":"a","games":[[[]]]}]', '{"id":"a"}', 'undefined', '[',
    '[{"id":"a","games":[{"id":"g","tags":{"0":"x"}}]}]',
    '{"__proto__":{"polluted":true}}',
    '[{"__proto__":{"polluted":true},"id":"a","name":"n","games":[]}]',
    '[{"id":"a","name":"n","games":[{"id":"g","__proto__":{"polluted":true}}]}]',
    JSON.stringify([{ id: 'a', name: 'n', games: Array.from({ length: 500 }, (_, i) => ({ id: `g${i}` })) }])
  ];
  for (const raw of nasty) {
    let result;
    assert.doesNotThrow(() => { result = checkPsnpPlusCompat(storageOf(raw)); },
      `threw on ${JSON.stringify(raw)}`);
    assert.equal(typeof result.ok, 'boolean', `no verdict for ${JSON.stringify(raw)}`);
  }
  assert.equal({}.polluted, undefined, 'the check must not let a JSON payload pollute Object');
});

test('the check never throws on a hostile storage object', () => {
  const throwingStorage = { getItem() { throw new Error('localStorage is disabled'); } };
  assert.doesNotThrow(() => checkPsnpPlusCompat(throwingStorage));
  assert.equal(checkPsnpPlusCompat(throwingStorage).ok, true, 'an unreadable store is not a verdict');

  const weird = value => ({ getItem: () => value });
  for (const value of [123, {}, [], true, Symbol('x'), () => {},
    { toString() { throw new Error('nope'); } }]) {
    let result;
    assert.doesNotThrow(() => { result = checkPsnpPlusCompat(weird(value)); },
      `threw on a getItem returning ${String(typeof value)}`);
    assert.equal(typeof result.ok, 'boolean');
  }
  assert.doesNotThrow(() => checkPsnpPlusCompat(null));
  assert.doesNotThrow(() => checkPsnpPlusCompat(undefined));
  assert.doesNotThrow(() => checkPsnpPlusCompat({}));
});

// --- PSNP+'s own version ------------------------------------------------------

test("PSNP+'s version is read from the state key PSNP+ writes it into", () => {
  // PSNP+ v11.14's Base module runs `_checkUpdate()` on every page load, which
  // does scriptStateStorage.set('version', "11.14") — so this key holds the
  // version of the PSNP+ that last ran here.
  //
  // The literal key, not the module's own constant: a test written against
  // SCRIPT_STATE_KEY would rename its own fixture along with the code and pass
  // just as happily while reading a key PSNP+ never writes.
  assert.equal(SCRIPT_STATE_KEY, 'psnpp-scriptstate');
  const storage = fakeStorage({
    'psnpp-scriptstate': JSON.stringify({
      version: '11.14', lastActiveGameList: 'a', latestGames: []
    })
  });
  assert.equal(readPsnpPlusVersion(storage), '11.14');
  assert.equal(checkPsnpPlusCompat(storage).version, '11.14');
});

test('an unreadable or absent version is reported as unknown, never invented', () => {
  assert.equal(readPsnpPlusVersion(fakeStorage()), null);
  assert.equal(readPsnpPlusVersion(fakeStorage({ [SCRIPT_STATE_KEY]: 'not json' })), null);
  assert.equal(readPsnpPlusVersion(fakeStorage({ [SCRIPT_STATE_KEY]: '[]' })), null);
  assert.equal(readPsnpPlusVersion(fakeStorage({ [SCRIPT_STATE_KEY]: '{"version":11.14}' })), null);
  assert.equal(readPsnpPlusVersion(fakeStorage({ [SCRIPT_STATE_KEY]: '{"version":""}' })), null);
  assert.equal(readPsnpPlusVersion(fakeStorage({ [SCRIPT_STATE_KEY]: 'null' })), null);
  assert.doesNotThrow(() => readPsnpPlusVersion({ getItem() { throw new Error('no'); } }));
  assert.equal(readPsnpPlusVersion(null), null);
});

// --- what the user is told ---------------------------------------------------

test('the message names PSNP+, says the data is untouched, and never throws', () => {
  const known = describeIncompatibility({ ok: false, code: 'game-id', reason: 'a game with no id',
    version: '11.15' });
  assert.match(known, /PSNP\+/);
  assert.match(known, /11\.15/);
  assert.match(known, /untouched/i);
  assert.match(known, /a game with no id/);

  const unknown = describeIncompatibility({ ok: false, code: 'game-id', reason: 'a game with no id',
    version: null });
  assert.match(unknown, /PSNP\+/);
  assert.equal(unknown.includes('null'), false, 'an unknown version must not be printed');

  for (const input of [null, undefined, {}, { reason: 42, version: {} }, 'nope']) {
    let text;
    assert.doesNotThrow(() => { text = describeIncompatibility(input); });
    assert.equal(typeof text, 'string');
    assert.match(text, /PSNP\+/);
  }
});

test("PSNP+'s version is recorded, and a change is reported once", async () => {
  const store = installFakeGM();
  const notices = [];
  const realInfo = console.info;
  console.info = message => { notices.push(message); };
  try {
    // First sighting: recorded, but not news — there is nothing to compare to.
    await recordPsnpPlusVersion('11.14');
    assert.equal(store.get('psnppp.psnpPlusVersion'), '11.14');
    assert.deepEqual(notices, []);

    // Same version again: no write worth making, nothing to say.
    await recordPsnpPlusVersion('11.14');
    assert.deepEqual(notices, []);

    // They updated. That is the event this exists to make visible.
    await recordPsnpPlusVersion('11.15');
    assert.equal(store.get('psnppp.psnpPlusVersion'), '11.15');
    assert.equal(notices.length, 1);
    assert.match(notices[0], /11\.14 -> 11\.15/);

    // An unreadable version must never overwrite a known one with "unknown".
    for (const nothing of [null, undefined, '', 42, {}]) {
      await recordPsnpPlusVersion(nothing);
    }
    assert.equal(store.get('psnppp.psnpPlusVersion'), '11.15');
    assert.equal(notices.length, 1);
  } finally {
    console.info = realInfo;
    uninstallFakeGM();
  }
});

test('recording the version never rejects, whatever GM storage does', async () => {
  installFakeGM();
  const realError = console.error;
  console.error = () => {};
  try {
    globalThis.GM.getValue = async () => { throw new Error('storage exploded'); };
    await assert.doesNotReject(() => recordPsnpPlusVersion('11.15'));
    globalThis.GM.getValue = async () => null;
    globalThis.GM.setValue = async () => { throw new Error('quota'); };
    await assert.doesNotReject(() => recordPsnpPlusVersion('11.15'));
    delete globalThis.GM;
    await assert.doesNotReject(() => recordPsnpPlusVersion('11.15'));
  } finally {
    console.error = realError;
    uninstallFakeGM();
  }
});

test('a pending reload offer never hides a paused sync', () => {
  // createIndicatorPainter makes `reload` sticky against the quiet cycles our
  // own write provokes. An incompatibility is not a quiet cycle: it must show
  // through, exactly as 'offline' and 'conflict' already do.
  const painted = [];
  const paint = createIndicatorPainter((state, detail) => painted.push([state, detail]));
  paint('reload', 'reload me');
  paint('incompatible', 'PSNP+ changed');
  assert.deepEqual(painted[1], ['incompatible', 'PSNP+ changed']);
});

// --- the wiring: an incompatibility pauses the whole cycle -------------------

/**
 * Enough of a browser for start() to run one sync, with every request recorded.
 *
 * Executed rather than reasoned about: a check that is correct but never called
 * is indistinguishable from no check at all, and that is exactly the failure
 * this pins. The control test below proves the harness WOULD have seen a push.
 */
function installFakeBrowser(storage) {
  const dom = installFakeDocument();
  installFakeWindow({ localStorage: storage });
  const requests = [];
  globalThis.GM_xmlhttpRequest = options => {
    requests.push({ method: options.method, url: options.url, data: options.data });
    options.onload({
      status: 200,
      responseText: JSON.stringify(
        options.method === 'GET'
          ? { revision: 1, updatedAt: 0, doc: emptyDoc() }
          : { revision: 2 }
      )
    });
  };
  const realSetInterval = globalThis.setInterval;
  const realSetTimeout = globalThis.setTimeout;
  globalThis.setInterval = () => 0;
  globalThis.setTimeout = () => 0;
  return {
    requests,
    get chip() { return dom.chip; },
    label() {
      return dom.chip?.children.find(child => child.className === 'psnppp-label')?.textContent;
    },
    restore() {
      globalThis.setInterval = realSetInterval;
      globalThis.setTimeout = realSetTimeout;
      delete globalThis.GM_xmlhttpRequest;
      uninstallFakeWindow();
      uninstallFakeDocument();
    }
  };
}

/** localStorage that counts every write, so "nothing was written" is measurable. */
const recordingStorage = initial => {
  const inner = fakeStorage(initial);
  const writes = [];
  return {
    writes,
    getItem: key => inner.getItem(key),
    setItem: (key, value) => { writes.push({ key, value }); inner.setItem(key, value); },
    removeItem: key => { writes.push({ key, value: null }); inner.removeItem(key); }
  };
};

/** Drain the microtask/immediate queues so the fire-and-forget sync has settled. */
const settle = () => new Promise(resolve => { setImmediate(resolve); });

test('an incompatible PSNP+ pauses the sync: no push, no write, and the chip says so',
  async () => {
    const gm = installFakeGM();
    await saveConfig({ endpoint: DEFAULT_ENDPOINT, key: 'a-real-key' });
    const before = JSON.stringify([realList('a', 'Wishlist', [realGame('1', { updatedAt: 7 })])]);
    const storage = recordingStorage({
      [LISTS_KEY]: before,
      [SCRIPT_STATE_KEY]: JSON.stringify({ version: '99.0' })
    });
    const browser = installFakeBrowser(storage);
    try {
      await start();
      await settle();

      // The guarantee is that no LIST DATA leaves, not that the socket stays
      // shut. A halt is the loudest ordinary event there is — sync has stopped
      // and a chip colour is easy to miss — so it is logged. The log carries
      // the compat code and PSNP+'s version and nothing read out of storage,
      // which is checked here rather than assumed: this is the one path where
      // the shape of the user's data is explicitly not understood.
      const syncRequests = browser.requests.filter(r => !r.url.endsWith('/log'));
      assert.deepEqual(syncRequests, [], 'an incompatible PSNP+ must never reach the sync API');
      for (const logged of browser.requests) {
        assert.equal(logged.data.includes('Wishlist'), false, 'no list name may leave');
        assert.equal(logged.data.includes(before), false, 'no list payload may leave');
        assert.match(logged.data, /99\.0/, 'but the version that stopped it must');
      }
      assert.deepEqual(storage.writes, [], 'an incompatible PSNP+ must never write localStorage');
      assert.equal(storage.getItem(LISTS_KEY), before, "the user's lists are untouched");
      assert.equal(browser.label(), 'Sync paused');
      assert.match(browser.chip.title, /PSNP\+/);
      assert.match(browser.chip.title, /untouched/i);
      assert.match(browser.chip.title, /99\.0/);
      // The version PSNP+ reported is recorded even on the paused path — that
      // record is the evidence for "sync stopped the day PSNP+ went to 99.0".
      assert.equal(gm.get('psnppp.psnpPlusVersion'), '99.0');
    } finally {
      browser.restore();
      uninstallFakeGM();
    }
  });

test('the same harness DOES push when PSNP+ is compatible', async () => {
  // The control for the test above: without this, "no requests" would pass just
  // as well on a harness that could never make one.
  const gm = installFakeGM();
  await saveConfig({ endpoint: DEFAULT_ENDPOINT, key: 'a-real-key' });
  const storage = recordingStorage({
    [LISTS_KEY]: JSON.stringify([realList('a', 'Wishlist', [realGame('1')])]),
    [SCRIPT_STATE_KEY]: JSON.stringify({ version: '11.14' })
  });
  const browser = installFakeBrowser(storage);
  try {
    await start();
    await settle();

    assert.ok(browser.requests.length > 0, 'a compatible install must still sync');
    assert.ok(browser.requests.some(r => r.method === 'PUT'), 'the local lists must be pushed');
    assert.notEqual(browser.label(), 'Sync paused');
    assert.equal(readLists(storage).length, 1);
    assert.equal(gm.get('psnppp.psnpPlusVersion'), '11.14');
  } finally {
    browser.restore();
    uninstallFakeGM();
  }
});


test('the halt path logs a tree, not just a chip colour', async () => {
  // Pins the CALL SITE. Deleting the `Sync Halted` log from sync() left the
  // whole suite green: the test above only iterates browser.requests and
  // asserts negatives, so an empty list satisfies it vacuously.
  installFakeGM();
  await saveConfig({ endpoint: DEFAULT_ENDPOINT, key: 'a-real-key' });
  const storage = recordingStorage({
    [LISTS_KEY]: JSON.stringify([realList('a', 'Wishlist', [realGame('1', { updatedAt: 7 })])]),
    [SCRIPT_STATE_KEY]: JSON.stringify({ version: '11.16' })
  });
  const browser = installFakeBrowser(storage);
  try {
    await start();
    await settle();
    await settle();

    const logged = browser.requests
      .filter(r => r.url.endsWith('/log'))
      .map(r => JSON.parse(r.data));
    const halt = logged.find(t => t.title === 'Sync Halted');
    assert.ok(halt, `the halt must be logged; got ${JSON.stringify(logged.map(t => t.title))}`);
    assert.equal(halt.emoji, '⚠️', 'a halt is a fault, and must carry a fault glyph');
    const rows = Object.fromEntries(halt.items);
    assert.equal(rows.Code, 'game-updated-at');
    assert.equal(rows['PSNP+ Version'], '11.16');
    assert.equal(JSON.stringify(halt).includes('Wishlist'), false,
      'the halt path must still not leak list contents');
  } finally {
    browser.uninstall?.();
  }
});
