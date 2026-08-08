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
import { loadConfig, applyConfig, isAllowedEndpoint, DEFAULT_ENDPOINT,
  loadAutoConfirmRemove, saveAutoConfirmRemove, AUTO_CONFIRM_REMOVE_DEFAULT } from './config.mjs';
import { saveBackup, listBackups, restoreBackup } from './backup.mjs';
import { recordSync, listSyncHistory } from './history.mjs';
import { watchLists, writeSyncable, readSyncable, readGameTitles } from './lists-bridge.mjs';
import { installAutoConfirm } from './auto-confirm.mjs';
import { createIndicator } from './indicator.mjs';
import { createSettingsPanel, describeFailure } from './panel.mjs';
import { runSyncCycle } from './sync-cycle.mjs';
import { migrateGmStorage } from './migrate.mjs';
import { checkForUpdate } from './update-check.mjs';
import { checkPsnpPlusCompat, describeIncompatibility } from './compat.mjs';
import { emptyDoc } from './doc.mjs';
import { syncSettings, emptySettingsDoc, SETTINGS_DOCUMENT } from './settings-sync.mjs';
import { checkHealth, describeHealth } from './health.mjs';

const BASE_KEY = 'psnppp.base';
const SETTINGS_BASE_KEY = 'psnppp.settingsBase';
const CHANGE_DEBOUNCE_MS = 3000;
// Which PSNP+ this device last saw. Recorded so their update is a dated,
// visible event in the console rather than something inferred afterwards from
// a sync that started behaving oddly.
const PSNP_PLUS_VERSION_KEY = 'psnppp.psnpPlusVersion';

// The metadata file is the same tiny file @updateURL points at (see
// banner.txt / build.mjs) — Tampermonkey already polls it, this just reads it
// sooner. The install URL is the full script; opening it is what makes
// Tampermonkey show its own install prompt. Same host as the sync endpoint,
// so no new @connect directive is needed.
const UPDATE_META_URL = 'https://trippixn.com/psnppp.meta.js';
const UPDATE_INSTALL_URL = 'https://trippixn.com/psnppp.user.js';
const UPDATE_STATE_KEY = 'psnppp.updateCheck';

const loadUpdateState = () => GM.getValue(UPDATE_STATE_KEY, null);
const saveUpdateState = state => GM.setValue(UPDATE_STATE_KEY, state);

/**
 * Note in the console when PSNP+ itself has been updated.
 *
 * PSNP+ writes its own version into `psnpp-scriptstate` on every page load, so
 * this is their report, not our guess (see compat.mjs). Recording it is what
 * makes "PSNP+ updated on the day sync started behaving oddly" a fact rather
 * than a hunch — and the first thing to check when it does.
 *
 * Never rejects and never throws: it is called fire-and-forget from inside
 * sync(), which must never reject, and a GM storage failure here is worth
 * exactly nothing next to the sync it would otherwise take down. A `null`
 * version (PSNP+ has not run here yet, or stopped writing it) is not news and
 * is not recorded — overwriting a known version with "unknown" would lose the
 * only evidence this keeps.
 *
 * Exported so the behaviour is pinned directly, without a browser.
 */
export async function recordPsnpPlusVersion(version) {
  if (typeof version !== 'string' || version === '') return;
  try {
    const seen = await GM.getValue(PSNP_PLUS_VERSION_KEY, null);
    if (seen === version) return;
    await GM.setValue(PSNP_PLUS_VERSION_KEY, version);
    if (seen != null) {
      console.info(`[psnppp] PSNP+ changed version: ${seen} -> ${version}`);
    }
  } catch (error) {
    console.error('[psnppp] could not record the PSNP+ version:', error);
  }
}

/**
 * The version Tampermonkey/Violentmonkey installed this copy as.
 *
 * GM_info is a standard GM API but this file already treats every GM
 * capability as something that might be missing (see the migrateGmStorage
 * try/catch below) rather than assumed — `typeof` guards the read so a
 * manager that does not provide it, or provides a malformed one, returns null
 * instead of throwing out of start(). With no real current version there is
 * nothing honest to compare a fetched one against, so the caller skips the
 * check entirely rather than risk offering an update against a guess.
 */
export function currentScriptVersion() {
  return (typeof GM_info !== 'undefined' && GM_info?.script?.version) || null;
}

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

/**
 * The settings document as of this device's last successful settings sync.
 *
 * Kept under its OWN GM key, never folded into `psnppp.base`. The two documents
 * are merged by different rules against different servers' documents, and a
 * single blob holding both would mean one path's write could strand or corrupt
 * the other's base — the exact coupling this feature is built to avoid.
 *
 * Falls back to an empty document for anything unreadable, for the same reason
 * loadBase does: a base that parses but has no `settings` object would be
 * iterated by stampSettings on every cycle forever. The cost of the fallback is
 * one cycle that cannot tell a local edit from a fresh device, and for settings
 * that cost is a field stamped `now` that may win a merge it would otherwise
 * have lost — recoverable by changing the setting again, unlike a lost list.
 */
export const loadSettingsBase = async () => {
  const raw = await GM.getValue(SETTINGS_BASE_KEY, null);
  if (raw == null) return emptySettingsDoc();
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return emptySettingsDoc();
  }
  if (parsed == null || typeof parsed.settings !== 'object' || parsed.settings === null
      || Array.isArray(parsed.settings)) {
    return emptySettingsDoc();
  }
  return parsed;
};
const saveSettingsBase = async doc => GM.setValue(SETTINGS_BASE_KEY, JSON.stringify(doc));

async function confirmAdoptions(adoptions) {
  const names = adoptions.map(a => `• ${a.name}`).join('\n');
  return window.confirm(
    'PSNP++ found lists on the server with the same names as lists on this ' +
    `device:\n\n${names}\n\nLink them so they stay in sync? ` +
    'Choose Cancel to keep them separate.'
  );
}

/**
 * Which window object PSNP+'s bare `confirm(...)` actually resolves against.
 *
 * This is the whole reason auto-confirm.mjs takes its target as a parameter.
 * PSNP+ declares `@sandbox raw` / `@inject-into page`, so it runs in the PAGE's
 * JavaScript context and its unqualified `confirm(...)` reads the page's global.
 * This script declares `@grant`s, which puts it in the manager's sandbox, where
 * `window` is a wrapper — assigning `window.confirm` there is visible to us and
 * to nothing else. `unsafeWindow` is the page's real window and is the only
 * object an override can be installed on that PSNP+ will ever see.
 *
 * `typeof` rather than a bare reference: `unsafeWindow` is an undeclared
 * identifier under Node's test runner and in any manager that does not provide
 * it, and reading one directly is a ReferenceError. Falling back to `window`
 * costs nothing — in a manager without a sandbox the two ARE the same object,
 * and in one with a sandbox the fallback is simply inert (the dialog keeps
 * appearing, which is the harmless direction).
 *
 * NOT VERIFIED IN A BROWSER. Everything above is read off the two metadata
 * blocks and the managers' documented sandbox behaviour; none of it is
 * observable from Node. See the report.
 */
export function confirmTarget() {
  try {
    if (typeof unsafeWindow !== 'undefined' && unsafeWindow != null
        && typeof unsafeWindow.confirm === 'function') {
      return unsafeWindow;
    }
  } catch (error) {
    console.error('[psnppp] could not reach unsafeWindow:', error);
  }
  return typeof window !== 'undefined' ? window : null;
}

/**
 * The live auto-confirm override, or null when the setting is off.
 *
 * Null is the honest representation of "off": the override is UNINSTALLED, not
 * left in place answering `false` to everything. `confirm` goes back to exactly
 * the function it was, so nothing of ours remains in the chain to reason about
 * — which is what "off behaves normally" has to mean on a page we share.
 */
let autoConfirm = null;

/**
 * Switch the override on or off, right now. Answers whether the requested state
 * was actually reached.
 *
 * Never rejects and never throws: it is called from start() (which must reach
 * the chip) and from the settings panel's checkbox (whose own failure path
 * reverts the box). A failure here costs a convenience and nothing else, so it
 * is logged and reported as a return value rather than allowed to reach either
 * caller as a rejection.
 *
 * Returning `false` for a switch-on that did not take is what stops the panel
 * from ticking a box for a feature that is not running. Switching OFF always
 * succeeds: `uninstall` is specified to stop the override deciding anything even
 * when it cannot physically detach.
 *
 * Contains no `await` between reading and writing `autoConfirm`, so it cannot
 * interleave with itself. Exported so the wiring can be exercised without a
 * browser.
 */
export async function applyAutoConfirm(enabled, { target = confirmTarget() } = {}) {
  try {
    autoConfirm?.uninstall();
  } catch (error) {
    console.error('[psnppp] could not remove the auto-confirm override:', error);
  }
  autoConfirm = null;
  if (!enabled) return true;
  try {
    autoConfirm = installAutoConfirm({
      target,
      // Read at click time, not snapshotted here: the user is deleting games,
      // so a set captured at install would go stale within one click.
      knownTitles: () => readGameTitles(window.localStorage)
    });
    return autoConfirm.installed === true;
  } catch (error) {
    console.error('[psnppp] could not install the auto-confirm override:', error);
    return false;
  }
}

/**
 * The one panel that may be open at a time, so a second right-click closes the
 * panel instead of stacking another copy of it on the page.
 */
let activePanel = null;

/**
 * Held in `activePanel` from the moment openSettings commits to building a
 * panel until the real one exists, so an overlapping call cannot slip through
 * the guard while storage is being read. Closing it is a no-op by design —
 * there is nothing on screen yet.
 */
const PENDING_PANEL = { close() {} };

/**
 * Settings: re-enter credentials, review recent syncs, or roll back to a
 * pre-merge snapshot.
 *
 * Restore exists because the merge writes to the only copy of these lists on the
 * device. It is the escape hatch if a merge ever gets it wrong.
 *
 * Resolves when the panel CLOSES, which is what preserves the caller's existing
 * `await openSettings(); void sync();` shape from the days when this was a
 * blocking `window.prompt`.
 *
 * The whole body is wrapped in try/catch, and every failure inside it is routed
 * to a visible message: the only callers are the chip's `contextmenu` handler
 * and handleSyncNowClick, neither of which catches. An error swallowed here
 * would be a silent no-op on the one path that exists specifically for
 * recovery — the worst possible failure mode for an escape hatch. The panel's
 * message region is where those land now; `window.alert` survives ONLY as the
 * last resort for a panel that could not be built at all, because a failure
 * with nowhere to be displayed still has to be displayed.
 */
export async function openSettings({ chip = null } = {}) {
  let panel = null;
  let mounted = false;
  try {
    if (activePanel) {
      // Cleared BEFORE closing: a throw out of close() would otherwise strand
      // the reference and leave every later right-click toggling a panel that
      // is no longer on the page.
      const open = activePanel;
      activePanel = null;
      open.close();
      return;
    }
    // Claimed synchronously, before the first await. The guard above used to be
    // read three awaited storage reads before `activePanel` was assigned, so a
    // left-click and a right-click landing in that window both built a panel and
    // appended it — the exact stacking this guard exists to prevent, with the
    // first panel orphaned on the page and its promise pending forever.
    activePanel = PENDING_PANEL;

    // Read together, and independently. Sharing one try meant an unreadable
    // backup index also skipped loadConfig, so the form rendered the DEFAULT
    // endpoint over the user's real one — and saving would have committed it.
    const [backups, history, config, autoConfirmRemove, loadError] = await loadPanelData();

    await new Promise(resolve => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        activePanel = null;
        // resolve() must be beyond the reach of anything that can throw, or
        // `await openSettings()` hangs forever on a panel that already closed.
        try {
          chip?.setPanelOpen?.(false);
        } catch (error) {
          console.error('[psnppp] could not un-mark the chip:', error);
        }
        resolve();
      };

      panel = createSettingsPanel({
        anchor: chip?.element ?? null,
        side: chip?.getSide?.() ?? 'right',
        config,
        backups,
        history,
        describeDelta,
        autoConfirmRemove,
        // Three things have to agree afterwards: the checkbox, GM storage, and
        // what is actually installed on `confirm`. So switch the override
        // first, only record it once that worked, and undo it if the record
        // fails — every early exit reports `{ ok: false }`, which is what makes
        // the panel put the checkbox back.
        onToggleAutoConfirm: async next => {
          try {
            if (!await applyAutoConfirm(next)) {
              // `confirm` could not be replaced — a manager or a page that will
              // not allow it. Nothing was stored, so nothing disagrees, and the
              // user is told rather than shown a ticked box for a feature that
              // is not running.
              return {
                ok: false,
                message: 'PSNP++ could not take over that PSNP+ prompt on this page, ' +
                  'so it will keep asking. Nothing was changed.'
              };
            }
            try {
              await saveAutoConfirmRemove(next);
            } catch (error) {
              // Put the override back rather than leave this page behaving one
              // way and every future page the other.
              await applyAutoConfirm(!next);
              throw error;
            }
            return { ok: true };
          } catch (error) {
            console.error('[psnppp] could not save the auto-confirm setting:', error);
            return { ok: false, message: describeFailure(error, 'Could not save that setting') };
          }
        },
        onSave: async ({ endpoint, key }) => {
          try {
            return await applyConfig({ endpoint, key });
          } catch (error) {
            console.error('[psnppp] could not save settings:', error);
            return { ok: false, message: describeFailure(error, 'Could not save your settings') };
          }
        },
        onRestore: async id => {
          try {
            // Read the chosen snapshot into memory BEFORE taking the next
            // backup. backup.mjs caps storage at 5 slots and evicts the oldest
            // on the 6th save — and the oldest slot is exactly what a "restore"
            // tends to target once all 5 are full (it's usually the
            // pre-corruption one the user actually wants). Saving first would
            // evict the very entry being restored and turn it into a
            // `restoreBackup` failure, on the one slot most worth restoring.
            const restored = await restoreBackup(id);

            // This restore is itself a destructive write to the same storage
            // every other write in this file backs up first — it is the escape
            // hatch, and an escape hatch that can destroy the current lists
            // with no way back is not one. Now safe to take regardless of what
            // it evicts: `restored` is already in hand.
            const { syncable: currentLists } = readSyncable(window.localStorage);
            await saveBackup(currentLists);

            writeSyncable(window.localStorage, restored);
            window.location.reload();
            return { ok: true, message: 'Backup restored. Reloading.' };
          } catch (error) {
            console.error('[psnppp] could not restore a backup:', error);
            return { ok: false, message: describeFailure(error, 'Could not restore that backup') };
          }
        },
        onClose: finish
      });

      activePanel = panel;
      chip?.setPanelOpen?.(true);
      document.body.appendChild(panel.element);
      // Only now can the panel carry a message. `panel` being non-null is not
      // the same as the panel being ON SCREEN, and writing an error into a
      // detached node is indistinguishable from swallowing it.
      mounted = true;
      if (loadError) panel.showMessage(loadError, { error: true });
    });
  } catch (error) {
    console.error('[psnppp] settings failed:', error);
    if (mounted && panel) {
      panel.showMessage(describeFailure(error, 'Settings failed'), { error: true });
      return;
    }
    activePanel = null;
    chip?.setPanelOpen?.(false);
    // Nothing on screen can carry the message, so fall back to the dialog this
    // panel replaced rather than let the failure disappear.
    window.alert(`PSNP++ — ${describeFailure(error, 'settings failed')}`);
  }
}

/**
 * Everything the panel needs, read concurrently, with each read's failure
 * confined to its own value.
 *
 * Never rejects: a failure is reported as the fourth element so the panel can
 * still open. Opening IS the recovery path — refusing to appear because the
 * backup index is unreadable takes away the credential form too, and re-entering
 * credentials is a plausible fix for exactly that.
 */
async function loadPanelData() {
  const [backups, history, config, autoConfirmRemove] = await Promise.allSettled([
    listBackups(), listSyncHistory(), loadConfig(), loadAutoConfirmRemove()
  ]);
  const failures = [backups, history, config, autoConfirmRemove]
    .filter(result => result.status === 'rejected')
    .map(result => describeFailure(result.reason, 'Could not read your saved settings'));
  return [
    backups.status === 'fulfilled' ? backups.value : [],
    history.status === 'fulfilled' ? history.value : [],
    config.status === 'fulfilled' ? config.value : { endpoint: DEFAULT_ENDPOINT, key: '' },
    // Falls back to the DEFAULT, not to `false`: an unreadable toggle must not
    // render a box that says the feature is off while it is actually running.
    autoConfirmRemove.status === 'fulfilled'
      ? autoConfirmRemove.value : AUTO_CONFIRM_REMOVE_DEFAULT,
    failures[0] ?? ''
  ];
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

const countOf = (n, noun) => `${n} ${noun}${n === 1 ? '' : 's'}`;

/**
 * A cycle's delta as one short human phrase, e.g. "+3 games, -1 list linked".
 *
 * Zero counters are omitted rather than printed as "0 games": the whole value
 * of this line is that everything in it actually happened. When nothing
 * countable moved but the cycle still wrote — a rename, or a reorder, neither
 * of which the five counters track — it falls back to a vague-but-true phrase
 * instead of an inventory of zeros.
 *
 * Exported so the settings history can render entries with the same words the
 * tooltip used at the time, rather than a second dialect of the same data.
 */
export function describeDelta(delta) {
  if (delta == null) return 'lists updated';
  const parts = [];
  if (delta.gamesAdded > 0) parts.push(`+${countOf(delta.gamesAdded, 'game')}`);
  if (delta.gamesRemoved > 0) parts.push(`-${countOf(delta.gamesRemoved, 'game')}`);
  if (delta.listsAdded > 0) parts.push(`+${countOf(delta.listsAdded, 'list')}`);
  if (delta.listsRemoved > 0) parts.push(`-${countOf(delta.listsRemoved, 'list')}`);
  if (delta.listsLinked > 0) parts.push(`${countOf(delta.listsLinked, 'list')} linked`);
  return parts.length > 0 ? parts.join(', ') : 'lists updated';
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
 * Note this only decides what a SINGLE cycle reports. Keeping the reload offer
 * alive across the quiet cycle that follows is createIndicatorPainter's job.
 *
 * Pure and exported so this mapping is pinned directly, without needing a
 * real sync cycle or a DOM.
 */
export function describeSyncResult(result) {
  if (result.status === 'synced') {
    return result.changed
      ? {
          state: 'reload',
          detail: `Revision ${result.revision} — ${describeDelta(result.delta)} — ` +
            'reload the page to see your updated lists'
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

/**
 * Wraps `indicator.setState` so that `reload` and `update` are each STICKY
 * until something more important than a quiet cycle displaces them.
 *
 * `reload` is an affordance, not a status. Writing to localStorage goes through
 * the setItem patch this script installs, so our own write wakes watchLists,
 * which debounces 3s and runs a second cycle — one that correctly finds nothing
 * to do and reports `changed === false`. Letting that repaint the chip 'synced'
 * took the reload offer away about three seconds after making it, while PSNP+'s
 * drawn list was still stale. Executed end-to-end: the chip went
 * `reload -> synced` and the click silently reverted from "reload" to "sync".
 *
 * `update` is the same shape of problem: the update check runs once after the
 * first sync and every 30 minutes after, but every OTHER sync cycle in
 * between — on every load, focus and edit — would otherwise paint over the
 * offer with a plain 'synced' within seconds of it appearing.
 *
 * PRIORITY, when both are pending: reload wins. `reload` means a merge
 * already wrote real data to this device that PSNP+'s already-drawn page is
 * not showing yet — a correctness issue for the data on screen right now.
 * `update` is a discretionary offer for next time, and clicking it opens the
 * install page in a NEW tab (a userscript cannot self-install), so it does
 * nothing to get the stale page to reload. Showing 'update' instead would
 * make it easy to click "install" and forget the reload entirely, leaving
 * PSNP+ showing stale lists with no visible reminder. So: `update` is
 * recorded the instant it arrives (nothing is lost) but stays hidden behind a
 * pending `reload` until the page actually reloads and this whole closure is
 * destroyed — at which point the next session's check can offer it again.
 *
 * Only 'synced' and 'syncing' are ever suppressed by either sticky flag —
 * errors ('offline', 'conflict') always show through, exactly as before this
 * state existed. Neither flag is ever cleared by this function; the only
 * thing that should clear either is a page load.
 */
export function createIndicatorPainter(setState) {
  let awaitingReload = false;
  let reloadDetail = '';
  let updateAvailable = false;
  let updateDetail = '';
  return (state, detail = '') => {
    if (state === 'reload') {
      awaitingReload = true;
      reloadDetail = detail;
    }
    if (state === 'update') {
      updateAvailable = true;
      updateDetail = detail;
    }
    if (awaitingReload && (state === 'synced' || state === 'syncing' || state === 'update')) {
      setState('reload', reloadDetail);
      return;
    }
    if (updateAvailable && (state === 'synced' || state === 'syncing')) {
      setState('update', updateDetail);
      return;
    }
    setState(state, detail);
  };
}

// Names the panel, not the numbered prompt menu it replaced: "choose 1" was an
// instruction for a dialog that no longer exists, and this tooltip is the only
// place a grandfathered http endpoint is ever mentioned.
const INSECURE_ENDPOINT_WARNING =
  'WARNING: this endpoint is not https, so your sync key is sent unencrypted. ' +
  'Right-click the chip and change it on the Sync tab.';

/**
 * Prefix a chip detail with a warning when the endpoint is not https.
 *
 * `isAllowedEndpoint` is enforced when an endpoint is SAVED, which does nothing
 * for one that was already stored before the check existed — that install keeps
 * sending `X-Sync-Key` in cleartext on every cycle, silently and forever.
 *
 * Warn, do not block. Refusing to sync would break a working setup to punish a
 * setting the user cannot see, and the fix is two clicks away in the menu this
 * message names.
 */
export function decorateDetail(detail, endpoint, health = null) {
  // Warnings first, sync state after. Both are prefixes rather than separate
  // chip states because neither is about the sync: an insecure endpoint and a
  // full quota are both true whether the last cycle succeeded or failed, and
  // spending a chip state on them would hide whichever one came second.
  const lines = [];
  if (!isAllowedEndpoint(endpoint)) lines.push(INSECURE_ENDPOINT_WARNING);
  const healthLine = describeHealth(health);
  if (healthLine) lines.push(healthLine);
  if (detail) lines.push(detail);
  return lines.join('\n');
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

  // Before the chip, and independently of it. This only ever affects PSNP+'s
  // own "remove <game>?" dialog (see auto-confirm.mjs); every failure mode —
  // an unreadable setting, a `confirm` that will not be replaced — is caught
  // and costs nothing but the convenience, so it can never stop start() from
  // reaching the indicator or the sync.
  try {
    await applyAutoConfirm(await loadAutoConfirmRemove());
  } catch (error) {
    console.error('[psnppp] could not set up the remove-prompt setting:', error);
  }

  // `let`, and the handlers below read it rather than close over a value: they
  // only ever run after createIndicator has returned, and the panel needs the
  // chip element to anchor itself to now that the chip can be anywhere.
  let indicator;
  const settings = () => openSettings({ chip: indicator });

  indicator = createIndicator({
    onSyncNow: () => { void handleSyncNowClick({ loadConfig, openSettings: settings, sync }); },
    onSettings: async () => { await settings(); void sync(); },
    // Only ever reached from the `reload` state, i.e. after a cycle that
    // actually wrote to localStorage behind an already-drawn PSNP+ list view.
    // Never automatic — the user asks for it by clicking the chip that says so.
    onReload: () => { window.location.reload(); },
    // A userscript cannot silently self-install — Tampermonkey requires the
    // user's own click on its install page. window.open, not
    // window.location.assign: this never navigates the psnprofiles.com tab
    // itself away, only opens a new one.
    onUpdate: () => { window.open(UPDATE_INSTALL_URL, '_blank', 'noopener'); }
  });
  document.body.appendChild(indicator.element);

  // Fire-and-forget: the chip's default corner is a perfectly good corner, so a
  // storage failure here must cost the user a remembered position, never the
  // status widget itself. restorePosition already swallows and reports its own
  // errors; the catch is belt and braces for the promise itself.
  indicator.restorePosition().catch(error => {
    console.error('[psnppp] could not restore the chip position:', error);
  });

  // Every repaint in sync() goes through this, never indicator.setState
  // directly — that is what keeps the reload offer alive across the quiet
  // cycle our own write provokes.
  const paint = createIndicatorPainter(indicator.setState);

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
        paint('unconfigured', 'Click to set up sync (or right-click for settings)');
        return;
      }
      // Before anything is read for a merge, pushed, or written back: does
      // PSNP+ still save its lists in a shape this build understands? An
      // incompatibility FAILS CLOSED — the cycle never starts, so there is no
      // push and no write to localStorage, and the user's lists sit exactly
      // where PSNP+ left them. Acting on a shape we do not understand is the
      // one outcome worse than not syncing at all.
      //
      // Placed after the key check because an unconfigured install is not
      // syncing anyway, and before paint('syncing') so the chip never claims to
      // be doing work it has already decided not to do. checkPsnpPlusCompat is
      // specified never to throw; it is not wrapped again here because the
      // whole body of sync() is already inside the try that owns that promise.
      const compat = checkPsnpPlusCompat(window.localStorage);
      void recordPsnpPlusVersion(compat.version);

      // Measured once per cycle and threaded through every paint below, so the
      // reading the user sees always belongs to the same pass as the sync state
      // beside it. Cheap: one enumeration of localStorage, no parsing.
      const health = checkHealth({ storage: window.localStorage, doc: document });

      if (!compat.ok) {
        paint('incompatible', decorateDetail(describeIncompatibility(compat), config.endpoint, health));
        return;
      }

      paint('syncing');
      const client = createSyncClient({ ...config, request: gmRequest });
      const result = await runSyncCycle({
        storage: window.localStorage,
        client, loadBase, saveBase, saveBackup, confirmAdoptions,
        now: Date.now()
      });
      const { state, detail } = describeSyncResult(result);
      paint(state, decorateDetail(detail, config.endpoint, health));

      // Only cycles that actually wrote are logged. Syncs fire on every load,
      // every tab focus and every debounced edit, and the overwhelming majority
      // of them change nothing — recording those would push the 20-entry window
      // past the one interesting entry within minutes and leave a log that
      // cannot answer the question it exists for.
      //
      // Its own try/catch, INSIDE the state update: the history is a nicety and
      // the sync is the product, so a failure to write a log line must never
      // repaint a successful sync as "Offline".
      if (result.status === 'synced' && result.changed) {
        try {
          await recordSync({ revision: result.revision, delta: result.delta });
        } catch (error) {
          console.error('[psnppp] could not record sync history:', error);
        }
      }

      // PSNP+'s PREFERENCES, on a path of their own. Last, and after the chip
      // has already been painted from the lists result, so the product is
      // finished before the convenience starts. `syncSettings` is specified
      // never to throw or reject (the same contract checkForUpdate has), which
      // is what makes it safe to sit inside this try without a catch of its
      // own: there is no failure of it that can reach the handler below and
      // repaint a good lists sync as "Offline".
      //
      // Its own client and its own base key. The only thing the two paths share
      // is the transport module and the credentials.
      //
      // TIMING, and why a late write is harmless: PSNP+ reads both preference
      // objects at `window.load` to draw its controls, and this write lands
      // after a network round trip, so it will usually be later than that.
      // Nothing is lost by it. PSNP+'s storages re-read localStorage on EVERY
      // get and set (SettingsStorage._load / ScriptStateStorage._load), so a
      // preference it reads later in the session picks the new value up, and a
      // preference it writes is a read-modify-write over our bytes rather than
      // over a stale copy. What stays stale is the already-drawn UI — exactly
      // the situation the lists path already has — so the answer is the same
      // one: offer a reload and let the user take it. Only offered when the
      // lists cycle did not already ask for one, since that offer covers both.
      const settings = await syncSettings({
        storage: window.localStorage,
        client: createSyncClient({
          ...config, request: gmRequest, documentKey: SETTINGS_DOCUMENT
        }),
        loadBase: loadSettingsBase,
        saveBase: saveSettingsBase,
        now: Date.now()
      });
      if (settings.changed && !(result.status === 'synced' && result.changed)) {
        paint('reload', decorateDetail(
          'PSNP+ settings updated — reload the page to apply them', config.endpoint
        ));
      }
    } catch (error) {
      // Network or server trouble must never block the page or lose local edits;
      // the next load or focus retries. String(), not error.message: a thrown
      // non-Error (e.g. `throw null`) must not itself make sync() reject.
      paint('offline', describeFailure(error, 'Sync failed'));
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

  // checkForUpdate is specified to never throw or reject — every one of its
  // own failure modes (a dead endpoint, an HTML body, a malformed @version)
  // resolves to {available:false}. This try/catch is defense in depth only,
  // so that even a bug in it could never chain into the sync path above: this
  // runs strictly AFTER the first sync settles, entirely through `paint`
  // (never indicator.setState), and touches no sync-cycle state.
  async function checkUpdateAndPaint() {
    const currentVersion = currentScriptVersion();
    // No GM_info -> no honest baseline to compare a fetched version against.
    // Silently skip rather than risk offering an update against a guess.
    if (!currentVersion) return;
    try {
      const { available, latest } = await checkForUpdate({
        currentVersion, metaUrl: UPDATE_META_URL,
        loadState: loadUpdateState, saveState: saveUpdateState
      });
      if (available) {
        paint('update', `Version ${latest} is available`);
      }
    } catch (error) {
      console.error('[psnppp] update check failed:', error);
    }
  }

  // Only THIS first call chains into the update check — watchLists, the
  // focus listener and the chip's own click all call sync() directly. The
  // check is throttled to once per 30 minutes internally anyway, but this
  // keeps it to at most once per page load instead of racing every trigger.
  void sync().then(() => { void checkUpdateAndPaint(); });
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
