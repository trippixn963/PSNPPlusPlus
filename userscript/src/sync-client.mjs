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
 * Developer: Trippixn
 * Website:   https://trippixn.com
 * Discord:   discord.gg/syria
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

/**
 * How many server revisions the panel asks for.
 *
 * The server retains 100 and will return all of them if not told otherwise.
 * This is a display depth, not a retention change: the deeper history stays on
 * the server and is still reachable by raising this.
 */
export const HISTORY_PAGE = 5;

function assertDocVersion(doc) {
  if (doc == null || doc.version !== DOC_VERSION) {
    throw new Error(`Unsupported document version: ${doc?.version}`);
  }
}

/**
 * A client for the sidecar's `lists` document.
 *
 * Every URL here is built without a `?document=` query string, which the
 * sidecar reads as `lists`. This client used to take a `documentKey` to name a
 * second document, but production has served exactly one since `settings`,
 * `progress` and `compare` went with the features that wrote them, and nothing
 * ever passed it. The sidecar keeps its multi-document machinery — that side is
 * still exercised, against a document the tests register for their own
 * duration — so re-adding a key here is a small change if a second document
 * ever comes back.
 */
export function createSyncClient({
  endpoint, key, request = gmRequest, timeoutMs = 15000
}) {
  const base = String(endpoint).replace(/\/+$/, '');
  const headers = { 'X-Sync-Key': key, 'Content-Type': 'application/json' };
  const url = `${base}/state`;

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

    /**
     * The server's own revision history for this document, newest first.
     *
     * Metadata only — revision, when, and size. Fetching 40 full documents to
     * draw a list would be tens of thousands of bytes to render three columns.
     * The one being restored is fetched separately, and only when asked for.
     *
     * `limit` is sent rather than left to the server's default, which is its
     * full retention of 100. The panel renders every row it is handed, so the
     * default turned the Backups tab into a hundred-row scroll — the server
     * keeps that depth as the safety net, but nobody scrolls to r7 to undo
     * something from ten minutes ago.
     */
    async getHistory(limit = HISTORY_PAGE) {
      const response = await request({
        method: 'GET',
        url: `${base}/state/history?limit=${encodeURIComponent(limit)}`,
        headers,
        timeout: timeoutMs
      });
      if (response.status !== 200) {
        throw new Error(`Sync server returned ${response.status}`);
      }
      const body = parseBody(response);
      return Array.isArray(body.revisions) ? body.revisions : [];
    },

    /** One past revision in full, for showing what a restore would change. */
    async getRevision(revision) {
      const response = await request({
        method: 'GET',
        url: `${base}/state/history/${encodeURIComponent(revision)}`,
        headers,
        timeout: timeoutMs
      });
      if (response.status === 404) return null;
      if (response.status !== 200) {
        throw new Error(`Sync server returned ${response.status}`);
      }
      const body = parseBody(response);
      assertDocVersion(body.doc);
      return { revision: body.revision, updatedAt: body.updatedAt, doc: body.doc };
    },

    /**
     * Make a past revision current again, as a NEW revision.
     *
     * Carries `baseRevision` and reports a 409 the same way putState does, and
     * for the same reason: a restore IS a write. Undoing while another device
     * is mid-push must lose the race and re-read rather than silently
     * overwrite an edit this device never saw.
     */
    async restoreRevision(baseRevision, revision) {
      const response = await request({
        method: 'POST',
        url: `${base}/state/restore`,
        headers,
        timeout: timeoutMs,
        data: JSON.stringify({ baseRevision, revision })
      });
      if (response.status === 409) {
        const body = parseBody(response);
        return { ok: false, conflict: true, revision: body.revision };
      }
      if (response.status !== 200) {
        throw new Error(`Sync server returned ${response.status}`);
      }
      return { ok: true, revision: parseBody(response).revision };
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
