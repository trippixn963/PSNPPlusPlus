/**
 * PSNP++ - Settings Bridge
 * ========================
 *
 * The only module that touches localStorage['psnpp-settings'] and
 * localStorage['psnpp-scriptstate'].
 *
 * It answers one question — which fields of those two objects leave this
 * machine — and it is the single place that answer is written down. Storage is
 * passed in rather than reached for globally, so the logic is testable in node
 * without a DOM, exactly as lists-bridge.mjs is.
 *
 * Deliberately imports NOTHING from the lists sync engine. The two paths share
 * a transport and nothing else.
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */

/** PSNP+'s preferences object (SettingsStorage). */
export const SETTINGS_KEY = 'psnpp-settings';

/** PSNP+'s mixed working state (ScriptStateStorage). */
export const SCRIPT_STATE_KEY = 'psnpp-scriptstate';

/** The two keys this module manages, in the order a document lists them. */
export const STORE_KEYS = [SETTINGS_KEY, SCRIPT_STATE_KEY];

/**
 * The one preference that never leaves this machine.
 *
 * `platPricesApiKey` is a third-party credential for PlatPrices.com. Nothing
 * about syncing needs it, and the moment it is in the document it is also in
 * the sidecar's database, in 100 revisions of that document's history, and in
 * any 409 body that comes back — four places it has no business being. This
 * project already takes care that OUR key travels only in a header and never
 * into a log or an error message; holding somebody else's to the same standard
 * is the consistent choice, not an extra one.
 *
 * The cost of holding it back is that the owner types it twice, once per
 * machine. That is the whole cost.
 *
 * A DENYLIST here, rather than an allowlist, on purpose: `psnpp-settings` is
 * PSNP+'s preferences object and nothing else, so every field in it is a
 * preference by construction and a preference PSNP+ adds tomorrow should sync
 * without this file being edited. See SYNCED_SCRIPT_STATE_FIELDS for the key
 * where that reasoning does NOT hold.
 */
export const UNSYNCED_SETTINGS_FIELDS = Object.freeze(['platPricesApiKey']);

/**
 * The fields of `psnpp-scriptstate` that are worth carrying between machines.
 *
 * An ALLOWLIST, and it has to be one. Unlike `psnpp-settings`, this key is a
 * mixed bag: PSNP+ keeps nine durable user choices in it alongside nine fields
 * that are scraped page content, cache signatures, a cooldown clock, its own
 * version number and a pointer at the last list you clicked. Syncing the whole
 * object would push kilobytes of frontpage scrape on every cycle — data that is
 * re-fetched on a TTL anyway, differs per machine by design, and would flip
 * back and forth forever between two devices that each just loaded the
 * frontpage. Worse, it churns a revision every time, for zero benefit.
 *
 * Every name here was read out of PSNP+'s own DEFAULT_SCRIPT_STATE and traced
 * to the checkbox or control that writes it (see the report):
 *
 *   activeChecklist                 guide checklist progress — real user work
 *   guideSimpleMatching             guide "simple matching" checkbox
 *   hideLowOwners                   game list "hide low owners" checkbox
 *   hideUnobtainableTrophiesInLog   trophy log "hide unobtainables" checkbox
 *   lowOwnersThreshold              that checkbox's threshold
 *   mySeriesCollapseNoStage         my-series collapse option
 *   mySeriesCollapseNumberedStages  my-series collapse option
 *   seriesAutoCollapse              series page collapse option
 *   seriesDoNotCollapseNoStage      series page collapse option
 *
 * NOT here, and each for a reason:
 *
 *   version, newListsSignature, popularListsSignature, newDLCSignature,
 *   latestGames, popularGames, dlcImages, platPricesCooldownTriggerTime
 *     — cache and its bookkeeping. TTL'd junk; see above.
 *   lastActiveGameList
 *     — which list tab you had open. It is a foreign key into `psnpp-lists`,
 *       whose ids the lists engine can REWRITE during an adoption, and it
 *       changes on every list switch. Syncing it would couple the two documents
 *       (the coupling this design exists to avoid) and push on every click, to
 *       move a cursor between two machines that are never looked at at once.
 *       PSNP+ already falls back to the first list when the id is unknown.
 */
export const SYNCED_SCRIPT_STATE_FIELDS = Object.freeze([
  'activeChecklist',
  'guideSimpleMatching',
  'hideLowOwners',
  'hideUnobtainableTrophiesInLog',
  'lowOwnersThreshold',
  'mySeriesCollapseNoStage',
  'mySeriesCollapseNumberedStages',
  'seriesAutoCollapse',
  'seriesDoNotCollapseNoStage'
]);

const UNSYNCED_SETTINGS = new Set(UNSYNCED_SETTINGS_FIELDS);
const SYNCED_SCRIPT_STATE = new Set(SYNCED_SCRIPT_STATE_FIELDS);

/**
 * May this field of this store be sent to the server and written back from it?
 *
 * The single gate. It is applied in three places — when values are read off the
 * page, when the merged document is assembled, and again when values are
 * written back — so a field that must not travel has to get past all three, and
 * a server document that somehow already carries one is cleaned rather than
 * obeyed.
 */
export function isSyncedField(store, field) {
  if (store === SETTINGS_KEY) return !UNSYNCED_SETTINGS.has(field);
  if (store === SCRIPT_STATE_KEY) return SYNCED_SCRIPT_STATE.has(field);
  return false;
}

/**
 * One store's object as PSNP+ left it, or null if it cannot be read.
 *
 * Null covers three cases that are treated identically on purpose — the key is
 * absent, the bytes do not parse, or they parse to something that is not a
 * plain object. In all three this machine has no readable opinion about any
 * field, which is exactly what null means to every caller.
 */
function readStore(storage, key) {
  let raw;
  try {
    raw = storage.getItem(key);
  } catch {
    return null;
  }
  if (raw == null) return null;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (parsed == null || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
  return parsed;
}

/**
 * Whether a store's bytes exist but are unreadable.
 *
 * The distinction matters at the WRITE end, not the read end. An absent key is
 * the ordinary state of a machine PSNP+ has not saved a preference on yet, and
 * creating it from the server is the whole point. Bytes that will not parse are
 * something else: they may be a truncated quota write or another script's
 * doing, and this module's answer to data it cannot read is the same as the
 * lists engine's — leave it exactly where it is. PSNP+ itself already ignores
 * them (its loader catches and falls back to defaults), so nothing is broken by
 * waiting for its next save to replace them.
 */
function isUnreadable(storage, key) {
  let raw;
  try {
    raw = storage.getItem(key);
  } catch {
    return true;
  }
  return raw != null && readStore(storage, key) == null;
}

/**
 * Every field this build syncs, as the page currently has them.
 *
 * Shape is `{ 'psnpp-settings': {...}, 'psnpp-scriptstate': {...} }`, with a
 * store omitted entirely when it cannot be read. A field that is simply absent
 * from a store is absent here too — that is "PSNP+ has never written this one",
 * not "the user cleared it", and the merge treats it as no opinion rather than
 * as a deletion.
 *
 * Never throws: a storage that refuses to answer yields an empty result, which
 * every caller already handles as "nothing local to say".
 */
export function readSettingsValues(storage) {
  const out = {};
  for (const store of STORE_KEYS) {
    const parsed = readStore(storage, store);
    if (parsed == null) continue;
    const fields = {};
    for (const [field, value] of Object.entries(parsed)) {
      if (isSyncedField(store, field)) fields[field] = value;
    }
    out[store] = fields;
  }
  return out;
}

/**
 * Write merged values back into the two PSNP+ objects, and say whether that
 * actually changed anything.
 *
 * The write is an OVERLAY, never a replacement, and that is the whole of its
 * safety. It re-reads the store, assigns only fields `isSyncedField` allows,
 * and hands back every other key untouched — so `platPricesApiKey` survives, a
 * TTL cache survives, and a preference a newer PSNP+ added that this build has
 * never heard of survives. Both of PSNP+'s loaders do
 * `Object.assign({}, DEFAULTS, JSON.parse(...))`, so a field they no longer
 * know is ignored and one they added is defaulted; preserving what we do not
 * recognise keeps us on the tolerant side of that contract instead of relying
 * on it.
 *
 * A store whose bytes exist but will not parse is skipped entirely. A store
 * that is absent is created — that is a second machine receiving its first
 * settings, and the fields it does not receive default exactly as they would
 * have.
 *
 * Compares the serialized result against what is already there and writes only
 * on a difference, so a quiet cycle does not wake the page's own storage
 * listeners for nothing.
 */
export function writeSettingsValues(storage, values) {
  let wrote = false;
  for (const store of STORE_KEYS) {
    const fields = values?.[store];
    if (fields == null || Object.keys(fields).length === 0) continue;
    if (isUnreadable(storage, store)) continue;

    const current = readStore(storage, store) ?? {};
    const next = { ...current };
    for (const [field, value] of Object.entries(fields)) {
      if (isSyncedField(store, field)) next[field] = value;
    }

    const serialized = JSON.stringify(next);
    if (serialized === storage.getItem(store)) continue;
    storage.setItem(store, serialized);
    wrote = true;
  }
  return wrote;
}

/**
 * The raw bytes of both stores, read in one synchronous turn.
 *
 * The settings equivalent of readSnapshot in the lists cycle, and it exists for
 * the same reason: localStorage is shared with the page and with every other
 * psnprofiles.com tab, and it can change under us across any `await`. Holding
 * the bytes a merge was computed from lets the caller prove, immediately before
 * writing, that it is still writing over what it read.
 */
export function readRawStores(storage) {
  const raw = {};
  for (const store of STORE_KEYS) {
    try {
      raw[store] = storage.getItem(store);
    } catch {
      raw[store] = null;
    }
  }
  return raw;
}

/** Do both stores still hold the bytes this snapshot was taken from? */
export function rawStoresUnchanged(storage, raw) {
  const current = readRawStores(storage);
  return STORE_KEYS.every(store => current[store] === raw[store]);
}
