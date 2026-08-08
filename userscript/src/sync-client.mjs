/**
 * PSNP++ - Sync Client
 * ====================
 *
 * Transport to the sync sidecar.
 *
 * The `request` function is injected so the client can be tested in node. In the
 * browser it is `gmRequest`, a promise wrapper over GM_xmlhttpRequest — which is
 * used instead of fetch because the sidecar is on a different origin than
 * psnprofiles.com and sends no CORS headers.
 *
 * Author: Trippixn
 * Server: discord.gg/syria
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

/**
 * A client for one sidecar document.
 *
 * `documentKey` selects which document this client speaks for. Omitting it
 * builds the URL exactly as this client always has — no query string at all —
 * because the sidecar reads an absent `document` as `lists`, and the lists path
 * must keep sending byte-identical requests. A named key adds
 * `?document=<key>`, which is the only difference between the two clients.
 *
 * The document is fixed per client rather than passed per call on purpose: a
 * caller that could name the document on each request could pull `lists` and
 * push it back over `settings`, which is precisely the mix-up the sidecar's
 * closed allowlist and this project's separate paths exist to make impossible.
 */
export function createSyncClient({
  endpoint, key, request = gmRequest, timeoutMs = 15000, documentKey = null
}) {
  const base = String(endpoint).replace(/\/+$/, '');
  const headers = { 'X-Sync-Key': key, 'Content-Type': 'application/json' };
  const url = documentKey == null
    ? `${base}/state`
    : `${base}/state?document=${encodeURIComponent(documentKey)}`;

  return {
    async getState() {
      const response = await request({
        method: 'GET', url, headers, timeout: timeoutMs
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
        method: 'PUT', url, headers, timeout: timeoutMs,
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
