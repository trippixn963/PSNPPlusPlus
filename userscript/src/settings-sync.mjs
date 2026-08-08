/**
 * PSNP++ - Settings Sync
 * ======================
 *
 * Keeps PSNP+'s preferences the same on every machine.
 *
 * Deliberately much simpler than the list sync next door. Lists needed a
 * three-way merge with tombstones because a game missing from one device is
 * ambiguous — deleted here, or not pulled yet? — and guessing wrong destroys
 * something the user cannot get back. A setting has no such state: "deleted"
 * means "back to the default", and a lost one is re-set in two seconds. So this
 * is per-key last-write-wins and nothing more. Nothing from the lists engine is
 * imported here, and a failure on this path cannot reach it.
 *
 * `settings-bridge.mjs` owns which fields leave the machine; this file owns when
 * one value beats another.
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */

import { readSettingsValues, writeSettingsValues } from './settings-bridge.mjs';

/** The sidecar document these live in. The lists path uses the default. */
export const SETTINGS_DOCUMENT = 'settings';
export const SETTINGS_DOC_VERSION = 1;

export function emptySettingsDoc() {
  return { version: SETTINGS_DOC_VERSION, settings: {} };
}

/** `store.field`, so both PSNP+ objects share one flat document without colliding. */
const nameOf = (store, field) => `${store}.${field}`;

/**
 * Key-order-insensitive serialization, for deciding whether a value CHANGED.
 *
 * A plain JSON.stringify would report a re-serialized object with its keys in a
 * different order as a new value, restamp it, and hand this device a spurious
 * win over the other one. The lists engine learned the same lesson the hard way.
 */
const stable = value => {
  const walk = obj => {
    if (Array.isArray(obj)) return obj.map(walk);
    if (obj == null || typeof obj !== 'object') return obj;
    const out = {};
    for (const key of Object.keys(obj).sort()) {
      if (obj[key] !== undefined) out[key] = walk(obj[key]);
    }
    return out;
  };
  return JSON.stringify(walk(value));
};

/**
 * Stamp each field with when it last changed, carrying the base's stamp forward
 * for anything that did not.
 *
 * The per-field stamp is what lets two machines change two different settings
 * and keep both: each field is judged on its own timestamp, not the document's.
 *
 * The `firstSync` case is the one that matters. A device that has never synced
 * has no evidence it changed anything — what it holds is whatever PSNP+
 * defaulted to. Stamping that with `now` would make a fresh install outrank
 * every real preference already on the server, so installing on a second
 * machine would push its untouched defaults over your configured settings on
 * every device. Stamp 0 instead and let the server win; `preferRemote` in
 * mergeSettings settles the ties that leaves.
 */
export function stampSettings(base, values, now) {
  const previous = base?.settings ?? {};
  const firstSync = Object.keys(previous).length === 0;
  const settings = {};

  for (const [store, fields] of Object.entries(values ?? {})) {
    for (const [field, value] of Object.entries(fields ?? {})) {
      const key = nameOf(store, field);
      const before = previous[key];
      const unchanged = before != null && stable(before.value) === stable(value);
      settings[key] = {
        value,
        updatedAt: firstSync ? 0 : (unchanged ? before.updatedAt : now)
      };
    }
  }
  return { version: SETTINGS_DOC_VERSION, settings, firstSync };
}

/**
 * Per-field last-write-wins.
 *
 * A field on one side only is kept: there is no tombstone and nothing to infer,
 * because a setting that vanished from PSNP+ went back to a default, which is a
 * value like any other rather than an absence.
 */
export function mergeSettings(localDoc, remoteDoc, { preferRemote = false } = {}) {
  const local = localDoc?.settings ?? {};
  const remote = remoteDoc?.settings ?? {};
  const settings = {};

  for (const key of new Set([...Object.keys(local), ...Object.keys(remote)])) {
    const mine = local[key];
    const theirs = remote[key];
    if (mine == null) { settings[key] = theirs; continue; }
    if (theirs == null) { settings[key] = mine; continue; }
    if (theirs.updatedAt > mine.updatedAt) { settings[key] = theirs; continue; }
    if (theirs.updatedAt < mine.updatedAt) { settings[key] = mine; continue; }

    // Equal stamps, different values. `preferRemote` covers a device's first
    // sync. Otherwise decide by content, because each machine sees the OTHER as
    // "theirs" — a rule like "prefer remote" would flip depending on who is
    // asking and the two would trade the value forever. Smallest serialization
    // wins is arbitrary, but both sides compute the same answer, which is the
    // entire requirement.
    if (preferRemote) { settings[key] = theirs; continue; }
    settings[key] = stable(theirs.value) <= stable(mine.value) ? theirs : mine;
  }
  return { version: SETTINGS_DOC_VERSION, settings };
}

/** Flat `store.field` document back into the nested shape the bridge writes. */
export function toStoreValues(doc) {
  const values = {};
  for (const [key, entry] of Object.entries(doc?.settings ?? {})) {
    if (entry == null || !Object.hasOwn(entry, 'value')) continue;
    const cut = key.indexOf('.');
    if (cut <= 0) continue;
    const store = key.slice(0, cut);
    const field = key.slice(cut + 1);
    (values[store] ??= {})[field] = entry.value;
  }
  return values;
}

/**
 * One settings sync: read, stamp, pull, merge, write back, push.
 *
 * Dependencies are injected so the whole cycle runs in Node against a fake
 * server, the way the lists cycle does. No retry loop and no compare-and-swap
 * on purpose: the worst case here is a preference reverting for one cycle, so
 * the machinery that protects the lists would be dead weight — and every extra
 * moving part on this path is one that could reach the lists path.
 */
export async function syncSettings({ storage, client, loadBase, saveBase, now = Date.now() }) {
  const base = (await loadBase()) ?? emptySettingsDoc();
  const remote = await client.getState();
  const stamped = stampSettings(base, readSettingsValues(storage), now);
  const merged = mergeSettings(stamped, remote.doc, { preferRemote: stamped.firstSync });

  const changed = writeSettingsValues(storage, toStoreValues(merged));
  const result = await client.putState(remote.revision, merged);
  if (result.ok) await saveBase(merged);

  return { status: result.ok ? 'synced' : 'conflict', changed };
}
