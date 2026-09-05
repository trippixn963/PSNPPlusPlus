import test from 'node:test';
import assert from 'node:assert/strict';

import { countGames, restoreLogRows, outcomeFault, logOutcome, withBackupLog } from '../src/main.mjs';
import { DEFAULT_MAX_ATTEMPTS } from '../src/sync-cycle.mjs';

/**
 * The trees that were silent: a cycle that did not sync, and a backup that
 * was taken or put back. Each helper is pure so the words and the gating are
 * pinned without a browser, a server, or a Discord channel.
 */

const capture = () => {
  const trees = [];
  return { trees, log: (title, items, emoji) => trees.push({ title, items, emoji }) };
};

const lists = [
  { id: 'a', name: 'Backlog', games: [{ id: 1 }, { id: 2 }] },
  { id: 'b', name: 'Wishlist', games: [{ id: 3 }] },
  { id: 'c', name: 'Empty' }
];

// --- counting ------------------------------------------------------------------

test('games are counted across every list, and a list without games counts zero', () => {
  assert.equal(countGames(lists), 3);
  assert.equal(countGames([]), 0);
  assert.equal(countGames(null), 0);
});

// --- the cycle that did not sync ----------------------------------------------

test('a synced cycle is no fault, so the latch clears', () => {
  assert.equal(outcomeFault({ status: 'synced', revision: 3 }), null);
  assert.equal(outcomeFault(null), null);
});

test('a conflict is reported once per run of them, with the attempts it outlasted', () => {
  const { trees, log } = capture();
  const result = { status: 'conflict', revision: 41, changed: false };
  assert.equal(outcomeFault(result), 'conflict');
  logOutcome(log, result);
  assert.equal(trees.length, 1);
  assert.equal(trees[0].title, 'Sync Conflicted');
  assert.equal(trees[0].emoji, '⚠️', 'a fault glyph, so it survives a queue trim');
  assert.deepEqual(trees[0].items[0], ['Revision', 41]);
  assert.deepEqual(trees[0].items[1], ['Attempts', DEFAULT_MAX_ATTEMPTS]);
});

test('unreadable lists are a halt, named as one, with what to do next', () => {
  const { trees, log } = capture();
  const result = { status: 'corrupt', revision: 12, changed: false };
  assert.equal(outcomeFault(result), 'corrupt');
  logOutcome(log, result);
  assert.equal(trees[0].title, 'Sync Halted (Unreadable Lists)');
  assert.equal(trees[0].emoji, '❌');
  assert.ok(trees[0].items.some(([key, value]) => key === 'Next' && /restore a backup/.test(value)));
});

test('a synced cycle produces no outcome tree at all', () => {
  const { trees, log } = capture();
  logOutcome(log, { status: 'synced', revision: 3 });
  assert.equal(trees.length, 0);
});

// --- backups ------------------------------------------------------------------

test('a backup that was written is logged with its reason, lists and games', async () => {
  const { trees, log } = capture();
  const save = withBackupLog(async () => 'psnppp.backup.1700000000000', log);
  assert.equal(await save(lists, 1700000000000, { force: true }), 'psnppp.backup.1700000000000');
  assert.equal(trees.length, 1);
  assert.equal(trees[0].title, 'Backup Taken');
  assert.equal(trees[0].emoji, '💾');
  assert.deepEqual(trees[0].items, [
    ['Reason', 'the merge removes something on this device'],
    ['Lists', 3],
    ['Games', 3]
  ]);
});

test('a daily backup names the day as its reason', async () => {
  const { trees, log } = capture();
  await withBackupLog(async () => 'psnppp.backup.1', log)(lists, 1, {});
  assert.deepEqual(trees[0].items[0], ['Reason', 'first merge of the day']);
});

test('a skipped daily backup is not a backup and gets no line', async () => {
  const { trees, log } = capture();
  const save = withBackupLog(async () => null, log);
  assert.equal(await save(lists, 1, {}), null);
  assert.equal(trees.length, 0);
});

test('the wrapper hands the writer its arguments unchanged and returns what it returned', async () => {
  const seen = [];
  const save = withBackupLog(async (...args) => { seen.push(args); return 'id'; }, () => {});
  await save(lists, 99, { force: true });
  assert.deepEqual(seen[0], [lists, 99, { force: true }]);
});

// --- restores -----------------------------------------------------------------

test('a restore names the snapshot, when it was taken and what it held', () => {
  const rows = restoreLogRows('psnppp.backup.1700000000000', lists);
  assert.deepEqual(rows, [
    ['Backup', 'psnppp.backup.1700000000000'],
    ['Taken', '2023-11-14T22:13:20.000Z'],
    ['Lists', 3],
    ['Games', 3]
  ]);
});

test('an id without a timestamp reads as unknown rather than an invalid date', () => {
  const rows = restoreLogRows('psnppp.backup.x', []);
  assert.deepEqual(rows[1], ['Taken', 'unknown']);
  assert.deepEqual(rows[2], ['Lists', 0]);
});
