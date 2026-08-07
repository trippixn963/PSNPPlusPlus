/**
 * Entry point: wires the cycle to page events and the status chip.
 *
 * Triggers are page load, a debounced local change, tab focus, and the chip
 * itself. There is no idle polling loop.
 */

import { createSyncClient, gmRequest } from './sync-client.mjs';
import { loadConfig, promptForConfig } from './config.mjs';
import { saveBackup, listBackups, restoreBackup } from './backup.mjs';
import { watchLists, writeSyncable, readSyncable } from './lists-bridge.mjs';
import { createIndicator } from './indicator.mjs';
import { runSyncCycle } from './sync-cycle.mjs';
import { emptyDoc } from './doc.mjs';

const BASE_KEY = 'psnpsync.base';
const CHANGE_DEBOUNCE_MS = 3000;

const loadBase = async () => {
  const raw = await GM.getValue(BASE_KEY, null);
  if (raw == null) return emptyDoc();
  try {
    return JSON.parse(raw);
  } catch {
    return emptyDoc();
  }
};
const saveBase = async doc => GM.setValue(BASE_KEY, JSON.stringify(doc));

async function confirmAdoptions(adoptions) {
  const names = adoptions.map(a => `• ${a.name}`).join('\n');
  return window.confirm(
    'PSNPSync found lists on the server with the same names as lists on this ' +
    `device:\n\n${names}\n\nLink them so they stay in sync? ` +
    'Choose Cancel to keep them separate.'
  );
}

/**
 * Settings menu: re-enter credentials, or roll back to a pre-merge snapshot.
 *
 * Restore exists because the merge writes to the only copy of these lists on the
 * device. It is the escape hatch if a merge ever gets it wrong.
 */
async function openSettings() {
  const backups = await listBackups();
  const choice = window.prompt(
    'PSNPSync\n\n1 — Enter endpoint and sync key\n' +
    `2 — Restore a pre-merge backup (${backups.length} available)\n\nChoose 1 or 2:`,
    '1'
  );
  if (choice === '1') {
    await promptForConfig();
    return;
  }
  if (choice !== '2') return;

  if (backups.length === 0) {
    window.alert('PSNPSync — no backups yet.');
    return;
  }
  const menu = backups
    .map((entry, index) => `${index + 1} — ${new Date(entry.at).toLocaleString()} (${entry.listCount} lists)`)
    .join('\n');
  const picked = window.prompt(`PSNPSync — restore which backup?\n\n${menu}\n\nEnter a number:`, '1');
  const index = Number(picked) - 1;
  if (!Number.isInteger(index) || index < 0 || index >= backups.length) return;

  const chosen = backups[index];
  const confirmed = window.confirm(
    `PSNPSync — restore the backup from ${new Date(chosen.at).toLocaleString()} ` +
    `(${chosen.listCount} lists)? This replaces your current lists.`
  );
  if (!confirmed) return;

  // This restore is itself a destructive write to the same storage every other
  // write in this file backs up first — it is the escape hatch, and an escape
  // hatch that can destroy the current lists with no way back is not one.
  const { syncable: currentLists } = readSyncable(window.localStorage);
  await saveBackup(currentLists);

  const lists = await restoreBackup(chosen.id);
  writeSyncable(window.localStorage, lists);
  window.alert('PSNPSync — backup restored. Reloading.');
  window.location.reload();
}

export async function start() {
  const indicator = createIndicator({
    onSyncNow: () => { void sync(); },
    onSettings: async () => { await openSettings(); void sync(); }
  });
  document.body.appendChild(indicator.element);

  let running = false;
  let pending = false;
  let timer = null;

  // sync() must never reject: the indicator calls it fire-and-forget
  // (onSyncNow/onSettings above, and the watchLists/visibilitychange callbacks
  // below all do `void sync()`), so an uncaught rejection here becomes an
  // unhandled promise rejection and the chip can stick on "Syncing…" forever.
  // The try/catch/finally below guarantees a terminal indicator state and
  // clears `running` no matter what throws — including a collision thrown by
  // applyAdoptions inside runSyncCycle, which is allowed to propagate here on
  // purpose so a single bad cycle fails loudly (visible "Offline" state, retried
  // on the next trigger) rather than being swallowed and silently skipped.
  async function sync() {
    if (running) {
      // A trigger arrived mid-cycle — the client allows up to a 15s timeout,
      // longer than the 3s debounce below, so this is not rare. Remember it and
      // run once more after the current cycle finishes instead of dropping it:
      // watchLists's poll only fires on a storage *change*, so a dropped
      // request would otherwise stay unsynced until the next reload, focus, or
      // manual click.
      pending = true;
      return;
    }
    running = true;
    try {
      const config = await loadConfig();
      if (!config.key) {
        indicator.setState('unconfigured', 'Right-click to enter your sync key');
        return;
      }
      indicator.setState('syncing');
      const client = createSyncClient({ ...config, request: gmRequest });
      const result = await runSyncCycle({
        storage: window.localStorage,
        client, loadBase, saveBase, saveBackup, confirmAdoptions,
        now: Date.now()
      });
      indicator.setState(
        result.status === 'synced' ? 'synced' : 'conflict',
        result.status === 'synced' ? `Revision ${result.revision}` : 'Could not settle — try again'
      );
    } catch (error) {
      // Network or server trouble must never block the page or lose local edits;
      // the next load or focus retries. String(), not error.message: a thrown
      // non-Error (e.g. `throw null`) must not itself make sync() reject.
      indicator.setState('offline', String(error?.message ?? error));
    } finally {
      running = false;
      if (pending) {
        pending = false;
        void sync();
      }
    }
  }

  // Known, accepted quirk: onChange fires synchronously from the patched
  // setItem, but the debounce below means the actual writeSyncable() call (and
  // the sync it triggers) lands ~3s later — outside watchLists's own absorb
  // window. That delayed write reads as a fresh external change and wakes a
  // second sync cycle. This terminates rather than looping: the second cycle's
  // fingerprint comparison finds storage already equal to the merged result
  // (changed === false) and writes nothing. Net cost is one extra network
  // round-trip per user edit — bounded, not free, and not worth "fixing" by
  // e.g. reaching into watchLists's absorb state from here.
  watchLists(window.localStorage, () => {
    clearTimeout(timer);
    timer = setTimeout(() => { void sync(); }, CHANGE_DEBOUNCE_MS);
  });

  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void sync();
  });

  void sync();
}

// start() itself is not expected to reject (its own failure modes are inside
// sync(), which cannot), but both call sites are fire-and-forget from an event
// callback, so a `.catch()` is cheap insurance against an unhandled rejection.
const onStartError = error => console.error('[psnpsync] start() failed:', error);
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { start().catch(onStartError); });
} else {
  start().catch(onStartError);
}
