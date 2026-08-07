/**
 * PSNP++ - Main Entry Point
 * =========================
 *
 * Entry point: wires the cycle to page events and the status chip.
 *
 * Triggers are page load, a debounced local change, tab focus, and the chip
 * itself. There is no idle polling loop.
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */

import { createSyncClient, gmRequest } from './sync-client.mjs';
import { loadConfig, promptForConfig } from './config.mjs';
import { saveBackup, listBackups, restoreBackup } from './backup.mjs';
import { watchLists, writeSyncable, readSyncable } from './lists-bridge.mjs';
import { createIndicator } from './indicator.mjs';
import { runSyncCycle } from './sync-cycle.mjs';
import { migrateGmStorage } from './migrate.mjs';
import { emptyDoc } from './doc.mjs';

const BASE_KEY = 'psnppp.base';
const CHANGE_DEBOUNCE_MS = 3000;

/**
 * The document as of this device's last successful sync.
 *
 * A base that parses but has no `lists` object is as unusable as one that does
 * not parse at all: every consumer (stampChanges, dropLists, the absent-key
 * guard in sync-cycle.mjs) iterates `base.lists`, so `{}` or `{version:1}`
 * throws a raw TypeError out of every cycle, forever, surfacing to the user as
 * an "Offline" chip with a stack-trace message and no way out. Falling back to
 * emptyDoc() makes it recoverable instead: the next cycle re-derives the base
 * from a normal merge. The cost is one cycle that cannot tell local deletions
 * from a fresh device — the same, accepted cost a genuinely new device pays.
 */
export const loadBase = async () => {
  const raw = await GM.getValue(BASE_KEY, null);
  if (raw == null) return emptyDoc();
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return emptyDoc();
  }
  if (parsed == null || typeof parsed.lists !== 'object' || parsed.lists === null
      || Array.isArray(parsed.lists)) {
    return emptyDoc();
  }
  return parsed;
};
const saveBase = async doc => GM.setValue(BASE_KEY, JSON.stringify(doc));

async function confirmAdoptions(adoptions) {
  const names = adoptions.map(a => `• ${a.name}`).join('\n');
  return window.confirm(
    'PSNP++ found lists on the server with the same names as lists on this ' +
    `device:\n\n${names}\n\nLink them so they stay in sync? ` +
    'Choose Cancel to keep them separate.'
  );
}

/**
 * Settings menu: re-enter credentials, or roll back to a pre-merge snapshot.
 *
 * Restore exists because the merge writes to the only copy of these lists on the
 * device. It is the escape hatch if a merge ever gets it wrong.
 *
 * The whole body is wrapped in try/catch: the only caller is indicator.mjs's
 * `contextmenu` handler, which calls `onSettings()` without awaiting or
 * catching it. An uncaught rejection here would be a silent no-op on the one
 * path that exists specifically for recovery — the worst possible failure
 * mode for an escape hatch — so every error surfaces as an alert instead.
 */
export async function openSettings() {
  try {
    const backups = await listBackups();
    const choice = window.prompt(
      'PSNP++\n\n1 — Enter endpoint and sync key\n' +
      `2 — Restore a pre-merge backup (${backups.length} available)\n\nChoose 1 or 2:`,
      '1'
    );
    if (choice === '1') {
      await promptForConfig();
      return;
    }
    if (choice !== '2') return;

    if (backups.length === 0) {
      window.alert('PSNP++ — no backups yet.');
      return;
    }
    const menu = backups
      .map((entry, index) => `${index + 1} — ${new Date(entry.at).toLocaleString()} (${entry.listCount} lists)`)
      .join('\n');
    const picked = window.prompt(`PSNP++ — restore which backup?\n\n${menu}\n\nEnter a number:`, '1');
    const index = Number(picked) - 1;
    if (!Number.isInteger(index) || index < 0 || index >= backups.length) return;

    const chosen = backups[index];
    const confirmed = window.confirm(
      `PSNP++ — restore the backup from ${new Date(chosen.at).toLocaleString()} ` +
      `(${chosen.listCount} lists)? This replaces your current lists.`
    );
    if (!confirmed) return;

    // Read the chosen snapshot into memory BEFORE taking the next backup.
    // backup.mjs caps storage at 5 slots and evicts the oldest on the 6th
    // save — and the oldest slot is exactly what a "restore" tends to target
    // once all 5 are full (it's usually the pre-corruption one the user
    // actually wants). Saving first would evict the very entry being
    // restored and turn it into a `restoreBackup` failure, on the one slot
    // most worth restoring.
    const restored = await restoreBackup(chosen.id);

    // This restore is itself a destructive write to the same storage every
    // other write in this file backs up first — it is the escape hatch, and
    // an escape hatch that can destroy the current lists with no way back is
    // not one. Now safe to take regardless of what it evicts: `restored` is
    // already in hand.
    const { syncable: currentLists } = readSyncable(window.localStorage);
    await saveBackup(currentLists);

    writeSyncable(window.localStorage, restored);
    window.alert('PSNP++ — backup restored. Reloading.');
    window.location.reload();
  } catch (error) {
    window.alert(`PSNP++ — settings/restore failed: ${String(error?.message ?? error)}`);
  }
}

/**
 * What a left-click on the chip does.
 *
 * A left-click used to always run sync(), which — with no key configured —
 * immediately bails out to the same 'unconfigured' label the chip already
 * showed, so the click looked like it did nothing (the only feedback was a
 * tooltip that required hovering to notice). So: no key -> open the settings
 * flow directly; a key -> sync, exactly as before.
 *
 * Dependency-injected rather than reaching into closure state, so it can be
 * pinned by a test without a DOM — the same reason openSettings/loadBase are
 * already exported for testing.
 */
export async function handleSyncNowClick({ loadConfig, openSettings, sync }) {
  const config = await loadConfig();
  if (!config.key) {
    await openSettings();
    return;
  }
  await sync();
}

/**
 * Maps a finished sync cycle to the indicator's state + tooltip detail.
 *
 * PSNP+ renders its list view from localStorage at render time, and this
 * script writes to localStorage behind it — an already-drawn page keeps
 * showing stale data until reload, by design (we do not reach into PSNP+'s
 * internals to force a re-render). `changed` is runSyncCycle's own truthful
 * report of whether the cycle actually wrote, so a sync that changed
 * something gets a state that says so; a sync that changed nothing (the
 * common case) keeps the plain "Synced" text unchanged.
 *
 * Pure and exported so this mapping is pinned directly, without needing a
 * real sync cycle or a DOM.
 */
export function describeSyncResult(result) {
  if (result.status === 'synced') {
    return result.changed
      ? {
          state: 'reload',
          detail: `Revision ${result.revision} — reload the page to see your updated lists`
        }
      : { state: 'synced', detail: `Revision ${result.revision}` };
  }
  if (result.status === 'corrupt') {
    return {
      state: 'conflict',
      detail: 'Your PSNP+ list data looks unreadable — nothing was synced. ' +
        'Right-click to restore a backup.'
    };
  }
  return { state: 'conflict', detail: 'Could not settle — try again' };
}

export async function start() {
  // Before anything reads GM storage. An install that predates the PSNP++
  // rename has its endpoint, key, base and backups under the old psnpsync.*
  // names; without this the first read after the update finds nothing and the
  // device presents as brand new.
  //
  // Caught rather than allowed to propagate: start() is called
  // fire-and-forget, so a throw here would abort start() entirely and the chip
  // would never be created — leaving the user with no visible sync, no
  // settings menu, and no restore menu. Continuing is safe because the
  // migration only ever deletes an old name after the new one is written, so a
  // failure part-way leaves every value readable under at least one name; the
  // worst case is a device that asks for its key again and re-derives its base
  // from one ordinary merge, the same cost a genuinely new device pays.
  try {
    await migrateGmStorage();
  } catch (error) {
    console.error('[psnppp] GM storage migration failed:', error);
  }

  const indicator = createIndicator({
    onSyncNow: () => { void handleSyncNowClick({ loadConfig, openSettings, sync }); },
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
        indicator.setState('unconfigured', 'Click to set up sync (or right-click for settings)');
        return;
      }
      indicator.setState('syncing');
      const client = createSyncClient({ ...config, request: gmRequest });
      const result = await runSyncCycle({
        storage: window.localStorage,
        client, loadBase, saveBase, saveBackup, confirmAdoptions,
        now: Date.now()
      });
      const { state, detail } = describeSyncResult(result);
      indicator.setState(state, detail);
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

// Auto-start only in a real browser. Guarded so this module can be imported
// under Node's test runner (to exercise openSettings against fake GM/window
// globals, the same way sync-cycle.mjs runs against fake storage and a fake
// server) without a `document` global — nothing above this line touches
// `document` at module-eval time, only inside functions that run when called.
//
// WARNING: this guard is what starts the userscript. esbuild emits the
// `typeof document` check verbatim into the IIFE bundle, and `document` exists
// at `@run-at document-start`, so it is true in the browser today — but adding
// `define: { document: ... }` to build.mjs would fold it to a constant and
// could silently disable the entire script with no build or test failure.
if (typeof document !== 'undefined') {
  // start() itself is not expected to reject (its own failure modes are inside
  // sync(), which cannot), but both call sites are fire-and-forget from an
  // event callback, so a `.catch()` is cheap insurance against an unhandled
  // rejection.
  const onStartError = error => console.error('[psnppp] start() failed:', error);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { start().catch(onStartError); });
  } else {
    start().catch(onStartError);
  }
}
