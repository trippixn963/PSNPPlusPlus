/**
 * Transport to the sync sidecar.
 *
 * The `request` function is injected so the client can be tested in node. In the
 * browser it is `gmRequest`, a promise wrapper over GM_xmlhttpRequest — which is
 * used instead of fetch because the sidecar is on a different origin than
 * psnprofiles.com and sends no CORS headers.
 */

import { DOC_VERSION } from './doc.mjs';

export function gmRequest(options) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      ...options,
      onload: response => resolve({ status: response.status, responseText: response.responseText }),
      onerror: () => reject(new Error('Network error')),
      ontimeout: () => reject(new Error('Request timed out')),
      onabort: () => reject(new Error('Request aborted'))
    });
  });
}

function parseBody(response) {
  try {
    return JSON.parse(response.responseText);
  } catch {
    const snippet = String(response.responseText ?? '').slice(0, 120);
    throw new Error(`Malformed response body (HTTP ${response.status}): ${snippet}`);
  }
}

function assertDocVersion(doc) {
  if (doc == null || doc.version !== DOC_VERSION) {
    throw new Error(`Unsupported document version: ${doc?.version}`);
  }
}

export function createSyncClient({ endpoint, key, request = gmRequest, timeoutMs = 15000 }) {
  const base = String(endpoint).replace(/\/+$/, '');
  const headers = { 'X-Sync-Key': key, 'Content-Type': 'application/json' };

  return {
    async getState() {
      const response = await request({
        method: 'GET', url: `${base}/state`, headers, timeout: timeoutMs
      });
      if (response.status !== 200) {
        throw new Error(`Sync server returned ${response.status}`);
      }
      const body = parseBody(response);
      assertDocVersion(body.doc);
      return { revision: body.revision, updatedAt: body.updatedAt, doc: body.doc };
    },

    async putState(baseRevision, doc) {
      const response = await request({
        method: 'PUT', url: `${base}/state`, headers, timeout: timeoutMs,
        data: JSON.stringify({ baseRevision, doc })
      });
      if (response.status === 409) {
        const body = parseBody(response);
        assertDocVersion(body.doc);
        return { ok: false, conflict: true, revision: body.revision, doc: body.doc };
      }
      if (response.status !== 200) {
        throw new Error(`Sync server returned ${response.status}`);
      }
      return { ok: true, revision: parseBody(response).revision };
    }
  };
}
