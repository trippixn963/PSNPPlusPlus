/**
 * PSNP++ - Sync History
 * =====================
 *
 * A bounded log of what recent syncs actually changed.
 *
 * The chip can only say what the LAST cycle did, and it says it in a tooltip
 * that is gone the moment the state changes. When a device turns up with a game
 * missing, the question is always "did a sync do that, and when" — this is the
 * only place that answers it. It is a log, not a mechanism: nothing in the sync
 * path reads it back, so it can be wrong or empty without endangering data.
 *
 * Lives in GM storage alongside the backups rather than in localStorage, so a
 * PSNP+ reset (or the "Clear" button) cannot take the evidence with it.
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */

const HISTORY_KEY = 'psnppp.history';

/**
 * Kept small on purpose. This is a "what just happened" log meant to be read at
 * a glance, not an audit trail — and every entry is one more thing living in
 * extension storage next to the backups that actually matter.
 *
 * Ten, down from twenty: twenty rows is a scroll, and anything older than the
 * last handful is answered better by the server's own revision history, which
 * goes back further and can actually restore.
 */
export const MAX_HISTORY = 10;

/**
 * Recent syncs, newest first.
 *
 * Anything that is not an array reads as empty rather than throwing. The only
 * caller is the settings menu and the tail of a finished sync, and neither has
 * any business failing because a log entry is malformed.
 */
export async function listSyncHistory() {
  const stored = await GM.getValue(HISTORY_KEY, []);
  return Array.isArray(stored) ? stored : [];
}

/** Prepend one entry, evicting the oldest past MAX_HISTORY. */
export async function recordSync({ revision, delta }, now = Date.now()) {
  const entries = await listSyncHistory();
  const next = [{ at: now, revision, delta }, ...entries].slice(0, MAX_HISTORY);
  await GM.setValue(HISTORY_KEY, next);
  return next;
}
