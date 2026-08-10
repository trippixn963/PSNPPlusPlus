import test from 'node:test';
import assert from 'node:assert/strict';
import { createSyncClient } from '../src/sync-client.mjs';

const okDoc = { version: 1, lists: {} };

/** Records calls and replies with the queued responses. */
const fakeRequest = responses => {
  const calls = [];
  const fn = async options => { calls.push(options); return responses.shift(); };
  fn.calls = calls;
  return fn;
};

test('getState sends the key header and parses the body', async () => {
  const request = fakeRequest([
    { status: 200, responseText: JSON.stringify({ revision: 3, updatedAt: 9, doc: okDoc }) }
  ]);
  const client = createSyncClient({ endpoint: 'https://host/api/psnppp', key: 'k', request });
  const state = await client.getState();
  assert.deepEqual(state, { revision: 3, updatedAt: 9, doc: okDoc });
  assert.equal(request.calls[0].url, 'https://host/api/psnppp/state');
  assert.equal(request.calls[0].headers['X-Sync-Key'], 'k');
});

test('a trailing slash on the endpoint does not double up', async () => {
  const request = fakeRequest([
    { status: 200, responseText: JSON.stringify({ revision: 0, updatedAt: 0, doc: okDoc }) }
  ]);
  const client = createSyncClient({ endpoint: 'https://host/api/psnppp/', key: 'k', request });
  await client.getState();
  assert.equal(request.calls[0].url, 'https://host/api/psnppp/state');
});

test('putState reports success with the new revision', async () => {
  const request = fakeRequest([
    { status: 200, responseText: JSON.stringify({ revision: 4, updatedAt: 9 }) }
  ]);
  const client = createSyncClient({ endpoint: 'https://host/api/psnppp', key: 'k', request });
  assert.deepEqual(await client.putState(3, okDoc), { ok: true, revision: 4 });
  assert.equal(request.calls[0].method, 'PUT');
  assert.deepEqual(JSON.parse(request.calls[0].data), { baseRevision: 3, doc: okDoc });
});

test('putState reports a 409 as a conflict, not an error', async () => {
  const request = fakeRequest([
    { status: 409, responseText: JSON.stringify({ revision: 7, updatedAt: 9, doc: okDoc }) }
  ]);
  const client = createSyncClient({ endpoint: 'https://host/api/psnppp', key: 'k', request });
  const result = await client.putState(3, okDoc);
  assert.equal(result.ok, false);
  assert.equal(result.conflict, true);
  assert.equal(result.revision, 7);
});

test('putState receiving a 409 with a wrong doc version rejects rather than returning a conflict', async () => {
  const request = fakeRequest([
    { status: 409, responseText: JSON.stringify({ revision: 7, updatedAt: 9, doc: { version: 99, lists: {} } }) }
  ]);
  const client = createSyncClient({ endpoint: 'https://host/api/psnppp', key: 'k', request });
  await assert.rejects(() => client.putState(3, okDoc), /version/i);
});

test('a 401 rejects', async () => {
  const request = fakeRequest([{ status: 401, responseText: '{"detail":"Invalid sync key"}' }]);
  const client = createSyncClient({ endpoint: 'https://host/api/psnppp', key: 'bad', request });
  await assert.rejects(() => client.getState(), /401/);
});

test('a malformed body rejects', async () => {
  const request = fakeRequest([{ status: 200, responseText: 'not json' }]);
  const client = createSyncClient({ endpoint: 'https://host/api/psnppp', key: 'k', request });
  await assert.rejects(() => client.getState());
});

test('a wrong doc version rejects rather than returning it', async () => {
  const request = fakeRequest([
    { status: 200, responseText: JSON.stringify({ revision: 1, updatedAt: 9, doc: { version: 99, lists: {} } }) }
  ]);
  const client = createSyncClient({ endpoint: 'https://host/api/psnppp', key: 'k', request });
  await assert.rejects(() => client.getState(), /version/i);
});

/**
 * The server's revision history, and restoring from it.
 *
 * These three endpoints existed, were tested server-side, and were called by
 * nothing for two weeks. The client half is new; these pin its contract.
 */

test('getHistory returns the revision list, newest first as the server sends it', async () => {
  const calls = [];
  const client = createSyncClient({
    endpoint: 'https://e.test/api/psnppp', key: 'k',
    request: async opts => {
      calls.push(opts);
      return { status: 200, responseText: JSON.stringify({
        revisions: [{ revision: 9, updatedAt: 200, size: 20 }, { revision: 8, updatedAt: 100, size: 10 }]
      }) };
    }
  });
  const history = await client.getHistory();
  assert.equal(calls[0].url, 'https://e.test/api/psnppp/state/history');
  assert.equal(calls[0].method, 'GET');
  assert.deepEqual(history.map(r => r.revision), [9, 8]);
});

test('a history response without a revisions array reads as empty, not as a crash', async () => {
  const client = createSyncClient({
    endpoint: 'https://e.test', key: 'k',
    request: async () => ({ status: 200, responseText: '{}' })
  });
  assert.deepEqual(await client.getHistory(), []);
});

test('restoreRevision carries the base revision and reports a conflict rather than forcing', async () => {
  // A restore IS a write. If another device pushed while the panel sat open,
  // the right answer is to lose the race and re-read — never to overwrite an
  // edit this device has never seen.
  const calls = [];
  const client = createSyncClient({
    endpoint: 'https://e.test', key: 'k',
    request: async opts => {
      calls.push(JSON.parse(opts.data));
      return { status: 409, responseText: JSON.stringify({ revision: 42 }) };
    }
  });
  const result = await client.restoreRevision(41, 7);
  assert.deepEqual(calls[0], { baseRevision: 41, revision: 7 });
  assert.equal(result.conflict, true);
  assert.equal(result.ok, false);
  assert.equal(result.revision, 42, 'the caller needs the revision it lost to');
});

test('a successful restore reports the NEW revision it created', async () => {
  // History is append-only: restoring r7 over r41 produces r42 holding r7's
  // content. Reporting 7 back would be a lie about where the document now is.
  const client = createSyncClient({
    endpoint: 'https://e.test', key: 'k',
    request: async () => ({ status: 200, responseText: JSON.stringify({ revision: 42 }) })
  });
  assert.deepEqual(await client.restoreRevision(41, 7), { ok: true, revision: 42 });
});

test('getRevision returns null for a revision that has been pruned', async () => {
  const client = createSyncClient({
    endpoint: 'https://e.test', key: 'k',
    request: async () => ({ status: 404, responseText: '{}' })
  });
  assert.equal(await client.getRevision(3), null);
});

test('a server error on any of them throws rather than reading as empty', async () => {
  const client = createSyncClient({
    endpoint: 'https://e.test', key: 'k',
    request: async () => ({ status: 500, responseText: '{}' })
  });
  await assert.rejects(() => client.getHistory(), /500/);
  await assert.rejects(() => client.restoreRevision(1, 1), /500/);
  await assert.rejects(() => client.getRevision(1), /500/);
});
