import test from 'node:test';
import assert from 'node:assert/strict';

import { sendTree, createTreeLog } from '../src/treelog.mjs';

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
