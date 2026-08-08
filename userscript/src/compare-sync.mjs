/**
 * PSNP++ - Compare+ sync
 * ======================
 *
 * Carries PSNP+'s Compare+ entries between devices: the PSN IDs you compare a
 * given trophy list against, so setting them up on the laptop means they are
 * already there on the PC.
 *
 * The merge is NOT written again here. Compare+ is the same shape settings are
 * — a flat map of key to value, with no tombstones, where a key that vanished
 * went back to a default rather than being deleted — so it reuses
 * settings-sync's stamp and merge verbatim, imported under neutral names. A
 * second hand-written copy of per-key last-write-wins is exactly how the two
 * would drift, and this project has already paid for that lesson once.
 *
 * The document's map lives under `settings` for the same reason: it is the
 * shared shape those two functions read and write. It is a generic keyed map
 * that settings happened to need first, not settings data.
 *
 * SEPARATE DOCUMENT, not folded into the settings one. Settings are a small
 * fixed set of fields; Compare+ grows by one entry per game you compare, so
 * merging them would mean rewriting an unbounded blob every time a checkbox
 * changed, and one path's conflict could strand the other's base.
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */

import {
  stampSettings as stampKeyed,
  mergeSettings as mergeKeyed,
  toStoreValues,
  SETTINGS_DOC_VERSION
} from './settings-sync.mjs';
import { readCompareValues, writeCompareValues } from './compare-bridge.mjs';

export const COMPARE_DOCUMENT = 'compare';

/** The single store name the flat map is nested under for stamping. */
const STORE = 'compare';

export function emptyCompareDoc() {
  return { version: SETTINGS_DOC_VERSION, settings: {} };
}

/**
 * One Compare+ sync: read, stamp, pull, merge, write back, push.
 *
 * Same shape as syncSettings, and deliberately as unprotected: no retry loop
 * and no compare-and-swap. The worst case is one game's compare IDs reverting
 * for a cycle, which the user fixes by retyping four PSN IDs. The machinery
 * that guards the lists would be dead weight here, and every moving part on
 * this path is one that could reach the lists path.
 *
 * `gm` and `storage` are injected so the whole cycle runs under node against a
 * fake GM and a Map, the way the lists cycle runs against a fake server.
 */
export async function syncCompare({
  client, loadBase, saveBase, now = Date.now(),
  gm = globalThis.GM, storage = globalThis.localStorage
}) {
  const base = (await loadBase()) ?? emptyCompareDoc();
  const remote = await client.getState();

  const values = await readCompareValues({ gm, storage });
  const stamped = stampKeyed(base, { [STORE]: values }, now);
  const merged = mergeKeyed(stamped, remote.doc, { preferRemote: stamped.firstSync });

  const mergedValues = toStoreValues(merged)[STORE] ?? {};
  // Compared before writing, so `changed` reports whether the MERGE moved
  // anything rather than whether a write was attempted — the chip's detail line
  // says "Compare+ updated", and saying it after a no-op merge would be noise on
  // every single cycle.
  const changed = JSON.stringify(mergedValues) !== JSON.stringify(values);
  if (changed) await writeCompareValues(mergedValues, { gm, storage });

  const result = await client.putState(remote.revision, merged);
  if (result.ok) await saveBase(merged);

  return { status: result.ok ? 'synced' : 'conflict', changed };
}
