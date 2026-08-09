/**
 * PSNP++ - PSNP+ Compatibility Self-Check
 * =======================================
 *
 * Does PSNP+ still save its lists in a shape this build understands?
 *
 * PSNP+ is HusKyCode's script, it auto-updates itself from psnp-plus.huskycode.dev,
 * and we deliberately never patch it. The entire dependency is one surface —
 * `localStorage['psnpp-lists']` — which is exactly why their releases do not
 * break us. But if that surface ever DOES change, the failure this project
 * would otherwise present is the worst kind: sync quietly does the wrong thing
 * to the only copy of the user's lists. This turns their update into a visible
 * event that pauses syncing instead.
 *
 * Every check below corresponds to a line in doc.mjs / lists-bridge.mjs that
 * would misbehave if the assumption were false — nothing is asserted for
 * tidiness. Where the real shape is genuinely permissive (PSNP+ carries its own
 * `!= null` fallbacks for removeGames / orderBy / direction / url, so lists
 * missing those exist in the wild) this stays silent, because a guard that
 * halts a healthy user is a defect, not a safe default.
 *
 * BOUNDARY WITH sync-cycle.mjs's `looksCorrupt` — read that before changing
 * anything here. It asks "did these bytes survive intact", by cross-checking
 * the raw string against the lists actually recovered, and it halts with the
 * message that fits DAMAGE: your data looks unreadable, restore a backup. This
 * asks a different question — "is the shape of the lists we recovered one our
 * converter understands" — and halts with the message that fits a FORMAT
 * CHANGE. Their domains are deliberately disjoint: anything that fails to parse,
 * is not an array, or holds entries that are not lists belongs to looksCorrupt
 * and this file says nothing about it, so a truncated quota write is never
 * blamed on HusKyCode. None of looksCorrupt's logic is repeated here.
 *
 * THE BAR FOR ADDING A CHECK: this file's only verb is HALT SYNCING. It stops
 * all two-way traffic and tells the user their lists are frozen until PSNP++ is
 * updated. That is the right price for a shape change that would otherwise
 * corrupt their data, and a grossly wrong one for anything whose failure mode is
 * a cosmetic annoyance. A dependency that already fails safe on its own belongs
 * at its own call site, not here.
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */

import { LISTS_KEY } from './lists-bridge.mjs';
import { isRemoteList } from './doc.mjs';

/**
 * Where PSNP+ records which version of itself last ran.
 *
 * v11.14's Base module calls `_checkUpdate()` on every page load, which does
 * `scriptStateStorage.set('version', "11.14")` — so this is PSNP+ reporting its
 * own version, not a guess of ours. (`GM_info` describes OUR script and says
 * nothing about theirs.)
 */
export const SCRIPT_STATE_KEY = 'psnpp-scriptstate';

/** A value that can key a document and survive `String()` round trips. */
const isIdentity = value => typeof value === 'string' || typeof value === 'number';

/** A JSON object — not null, and not an array. */
const isPlainObject = value =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

/** Read a key, tolerating a storage that is missing, hostile, or disabled. */
function readRaw(storage, key) {
  try {
    const raw = storage?.getItem?.(key);
    return typeof raw === 'string' ? raw : null;
  } catch {
    return null;
  }
}

/**
 * Which PSNP+ ran here last, or null if that cannot be read.
 *
 * Null is an honest answer and is treated as one everywhere: the key is absent
 * on a fresh profile, PSNP+ skips `_checkUpdate()` on a PSNP outage page, and a
 * future PSNP+ may stop writing it. None of that is a compatibility verdict, so
 * nothing here ever invents a version.
 */
export function readPsnpPlusVersion(storage) {
  const raw = readRaw(storage, SCRIPT_STATE_KEY);
  if (raw == null) return null;
  try {
    const state = JSON.parse(raw);
    if (!isPlainObject(state)) return null;
    const version = state.version;
    return typeof version === 'string' && version !== '' ? version : null;
  } catch {
    return null;
  }
}

/**
 * The assumptions, in the order a list is walked.
 *
 * Each `reason` is written to be read by a human on a chip tooltip, so it names
 * the thing that changed rather than the predicate that failed.
 */
const REASONS = {
  'list-id': 'a list whose id is no longer a plain value',
  'list-url': 'a list whose feed url is no longer plain text',
  'games-not-array': 'a list whose games are no longer stored as a list',
  'game-not-object': 'a game entry that is no longer a record',
  'game-id': 'a game with no usable id',
  'game-updated-at': 'a game carrying a new updatedAt field, which PSNP++ uses for its own bookkeeping',
  'list-name': 'lists that no longer carry a name'
};

const compatible = version => ({ ok: true, code: null, reason: null, version });
const incompatible = (code, version) => ({ ok: false, code, reason: REASONS[code], version });

/** This entry belongs to looksCorrupt, not to us. */
const DEFER = Symbol('defer');
/** A 📡 list: split off, written back verbatim, never converted. */
const REMOTE = Symbol('remote');

/**
 * Check one recovered list. Returns a code, DEFER, REMOTE, or null (understood).
 *
 * Only lists PSNP++ actually CONVERTS are inspected. A 📡 remote list is split
 * off by `splitRemote` and written back byte-for-byte by `writeSyncable`, so
 * its interior is never interpreted and nothing about it can be a compatibility
 * problem.
 */
function checkList(list) {
  // No id at all is looksCorrupt's exact test (`syncable.some(l => l.id == null)`),
  // and it halts on it. Handing that entry back untouched — rather than reading
  // it as a list that lost its meta fields — is what stops the two guards from
  // racing to explain the same `[{}]` in two different ways.
  if (list.id == null) return DEFER;

  // isRemoteList is `typeof list.url === 'string' && list.url !== ''`. A url
  // that became structured (an object, an array) would read as NOT remote, and
  // every feed list on the device would start being merged and overwritten.
  // `null` is not a violation: PSNP+ writes `list.url == null ? '' : list.url`
  // itself, so a null url is its own idiom.
  const url = list.url;
  if (url != null && typeof url !== 'string') return 'list-url';
  if (isRemoteList(list)) return REMOTE;

  // toDoc keys `doc.lists` by `list.id`, and the delta and the fingerprint both
  // take `String(l.id)`. An object id collapses to "[object Object]", silently
  // merging every such list into one.
  if (!isIdentity(list.id)) return 'list-id';

  // toDoc does `for (const game of list.games ?? [])`. A keyed object throws a
  // raw TypeError out of the whole cycle; a string iterates its CHARACTERS and
  // turns a list of games into a list of letters. Absent or null is fine — the
  // `?? []` covers it and lists without games exist.
  const games = list.games;
  if (games == null) return null;
  if (!Array.isArray(games)) return 'games-not-array';

  for (const game of games) {
    // `{ ...game, updatedAt: 0 }` on a string spreads its character indices,
    // and on a number spreads nothing at all — either way the game is gone.
    if (!isPlainObject(game)) return 'game-not-object';
    // Every id-less game is stored under the literal key "undefined", so a list
    // of them collapses to ONE game and the merge pushes the rest away as
    // deletions on every device.
    if (!isIdentity(game.id)) return 'game-id';
    // toDoc writes `updatedAt: 0` over whatever was there and fromDoc strips
    // the key back off. If PSNP+ ever adds its own updatedAt to a game, this
    // build would destroy it on every game on every sync.
    if (Object.hasOwn(game, 'updatedAt')) return 'game-updated-at';
  }
  return null;
}

/**
 * Are PSNP+'s saved lists still a shape this build understands?
 *
 * Never throws — it runs at startup inside a page we do not own, alongside the
 * sync, and a check that can itself fail is worse than no check at all. Every
 * unreadable or unrecognised input resolves to `{ ok: true }`, because "I
 * cannot tell" must never be reported as "they changed it".
 */
export function checkPsnpPlusCompat(storage) {
  const version = readPsnpPlusVersion(storage);
  try {
    const raw = readRaw(storage, LISTS_KEY);
    // Absent key: a brand-new install, or PSNP+'s own Clear button. Ordinary.
    if (raw == null) return compatible(version);

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Damage, not a format change. looksCorrupt owns this.
      return compatible(version);
    }
    if (!Array.isArray(parsed)) return compatible(version);

    // Entries that are not records are dropped by readLists and then caught by
    // looksCorrupt's length cross-check, which halts the cycle with the message
    // that fits damaged data. Skipping them here is what keeps the two guards
    // from telling the same user two different stories.
    const lists = parsed.filter(isPlainObject);

    let syncable = 0;
    let named = 0;
    for (const list of lists) {
      const verdict = checkList(list);
      if (verdict === DEFER || verdict === REMOTE) continue;
      if (verdict !== null) return incompatible(verdict, version);
      syncable += 1;
      if (Object.hasOwn(list, 'name')) named += 1;
    }

    // fromDoc rebuilds a list out of `id` + META_FIELDS and nothing else, so a
    // meta field PSNP+ renamed is DELETED from the user's data by the next
    // write-back. `name` is the one meta field this project actively relies on
    // (adopt.mjs matches lists across devices by it, and says so).
    //
    // Asked of the POPULATION, never of a single list, and that is the whole
    // point: PSNP+'s own importList() builds a list out of an arbitrary JSON
    // file, so one nameless list is something a real user can have and must not
    // halt them. A rename in PSNP+ takes the name off ALL of them at once.
    //
    // The other seven meta fields are deliberately NOT required: PSNP+ carries
    // `!= null` fallbacks for removeGames / orderBy / direction / url, and
    // merger.mjs records that lists missing them exist, so demanding them would
    // halt healthy users on day one.
    if (syncable > 0 && named === 0) return incompatible('list-name', version);

    return compatible(version);
  } catch (error) {
    // Unreachable by construction; kept because the cost of being wrong about
    // that is a throw at startup on someone else's page.
    console.error('[psnppp] compatibility check failed:', error);
    return compatible(version);
  }
}

/**
 * What the chip says when syncing is paused.
 *
 * Three things it has to carry, because the user can neither see the cause nor
 * fix it themselves: that PSNP+ is what changed (not their data, and not this
 * script misbehaving), that nothing of theirs was touched, and that the pause
 * lasts until PSNP++ is updated. The version is included only when PSNP+
 * actually reported one.
 */
export function describeIncompatibility(result) {
  const version = typeof result?.version === 'string' && result.version !== ''
    ? ` v${result.version}` : '';
  const reason = typeof result?.reason === 'string' && result.reason !== ''
    ? ` — ${result.reason}` : '';
  return `PSNP+${version} has changed how it saves your lists${reason}. ` +
    'PSNP++ has paused syncing: nothing was uploaded and nothing on this device was ' +
    'changed, so your lists are untouched. Syncing resumes once PSNP++ understands ' +
    'the new format.';
}
