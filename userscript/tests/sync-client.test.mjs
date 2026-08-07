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
