import test from 'node:test';
import assert from 'node:assert/strict';

import { sendTree, sendTreeWithin, createTreeLog } from '../src/treelog.mjs';

/**
 * The contract these pin is not "logging works" but "logging cannot hurt".
 * Every event worth logging is raised while something is already going wrong,
 * so a logger that could reject, throw, or block would convert a bad sync into
 * a lost write.
 */

const capture = () => {
  const calls = [];
  const request = async opts => { calls.push(opts); return { status: 204 }; };
  return { calls, request };
};

test('posts to /log with the sync key and an ordered item list', async () => {
  const { calls, request } = capture();
  await sendTree({
    endpoint: 'https://example.test/api/psnppp', key: 'k',
    title: 'Game Added', items: [['Game', 'Bloodborne'], ['List', 'Backlog']], emoji: '➕', request
  });
  assert.equal(calls[0].url, 'https://example.test/api/psnppp/log');
  assert.equal(calls[0].headers['X-Sync-Key'], 'k');
  const body = JSON.parse(calls[0].data);
  assert.equal(body.emoji, '➕');
  assert.deepEqual(body.items, [['Game', 'Bloodborne'], ['List', 'Backlog']],
    'row order carries meaning and must survive the wire');
});

test('sends nothing when there is no endpoint or key', async () => {
  const { calls, request } = capture();
  assert.equal(await sendTree({ endpoint: '', key: 'k', title: 'X', request }), false);
  assert.equal(await sendTree({ endpoint: 'https://e.test', key: '', title: 'X', request }), false);
  assert.equal(calls.length, 0, 'an unconfigured device must not fire requests every cycle');
});

test('a rejecting request resolves false instead of throwing', async () => {
  const request = async () => { throw new Error('offline'); };
  assert.equal(await sendTree({
    endpoint: 'https://e.test', key: 'k', title: 'X', request
  }), false);
});

test('a non-2xx response is reported as not sent, not as an error', async () => {
  const request = async () => ({ status: 500 });
  assert.equal(await sendTree({ endpoint: 'https://e.test', key: 'k', title: 'X', request }), false);
});

test('a value that cannot serialise costs one row, not the tree', async () => {
  const { calls, request } = capture();
  const circular = {};
  circular.self = circular;
  await sendTree({
    endpoint: 'https://e.test', key: 'k', title: 'X',
    items: [['Bad', circular], ['Good', 'kept']], request
  });
  const body = JSON.parse(calls[0].data);
  assert.equal(body.items[0][1], '<unrenderable>');
  assert.equal(body.items[1][1], 'kept', 'the rest of the tree survives');
});

test('createTreeLog never returns a promise and never rejects', async () => {
  const log = createTreeLog({
    endpoint: 'https://e.test', key: 'k',
    request: async () => { throw new Error('exploded'); }
  });
  assert.equal(log('X', [['A', 1]]), undefined, 'call sites must not be able to await it');
  // An unhandled rejection here would surface in the page console next to the
  // real error the user can act on.
  await new Promise(resolve => setImmediate(resolve));
});



test('a trailing slash on the endpoint does not silently 404 every log line', async () => {
  // sync-client strips it, applyConfig only trims, so an endpoint saved with a
  // slash syncs fine. Logging never reports failure, so this would be invisible.
  const calls = [];
  await sendTree({
    endpoint: 'https://e.test/api/psnppp/', key: 'k', title: 'X',
    request: async o => { calls.push(o.url); return { status: 204 }; }
  });
  assert.equal(calls[0], 'https://e.test/api/psnppp/log');
});

// --- the device row ----------------------------------------------------------

test('a known device leads every tree, ahead of the rows the caller gave', async () => {
  const { calls, request } = capture();
  await sendTree({
    endpoint: 'https://example.test/api/psnppp', key: 'k', device: 'Chrome on macOS',
    title: 'Games Added', items: [['Count', 2]], request
  });
  assert.deepEqual(JSON.parse(calls[0].data).items, [['Device', 'Chrome on macOS'], ['Count', '2']]);
});

test('no device means no device row, not an empty one', async () => {
  const { calls, request } = capture();
  await sendTree({ endpoint: 'https://example.test/api/psnppp', key: 'k', title: 'X', items: [['A', 1]], request });
  assert.deepEqual(JSON.parse(calls[0].data).items, [['A', '1']]);
});

test('the bound logger carries its device onto every line', async () => {
  const { calls, request } = capture();
  const log = createTreeLog({ endpoint: 'https://example.test/api/psnppp', key: 'k', device: 'Firefox on Windows', request });
  log('Sync Completed', [['Revision', 7]]);
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(JSON.parse(calls[0].data).items[0], ['Device', 'Firefox on Windows']);
});

// --- the bounded send, for the line before a reload --------------------------

test('sendTreeWithin resolves true when the post lands inside the bound', async () => {
  const { request } = capture();
  const sent = await sendTreeWithin({ endpoint: 'https://example.test/api/psnppp', key: 'k', title: 'X', request }, 500);
  assert.equal(sent, true);
});

test('sendTreeWithin gives up on a hanging request rather than holding the caller', async () => {
  const hang = () => new Promise(() => {});
  const started = Date.now();
  const sent = await sendTreeWithin({ endpoint: 'https://example.test/api/psnppp', key: 'k', title: 'X', request: hang }, 50);
  assert.equal(sent, false);
  assert.ok(Date.now() - started < 1000, 'must return at the bound, not at the request timeout');
});
