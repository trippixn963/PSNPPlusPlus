/**
 * PSNP++ - Watch
 * ==============
 *
 * Tells you when a game in one of your lists is about to become unplayable, or
 * has quietly become unplatinumable.
 *
 * PSNP+ already knows both facts — it fetches a shutdown list and an
 * unobtainable-trophy list and caches them — but it only ever surfaces them on
 * a game you are ALREADY looking at, as a badge on that row or a banner on that
 * trophy list. Nothing aggregates across your lists, so a server closing on a
 * game sitting in your backlog is information you get by coincidence, if at all.
 * This asks the question the other way round: of the games I have chosen to
 * care about, which ones are on a clock.
 *
 * Reads PSNP+'s OWN caches rather than fetching anything. There is no network
 * here, nothing to rate-limit, and no second copy of a feed to keep fresh —
 * PSNP+ refreshes both on its own TTLs and this reads whatever it last stored.
 * Being pinned to PSNP+ v11.14 by the build is what makes that safe: the cache
 * shape cannot change underneath this without a deliberate vendor update.
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */

import { readLists } from './lists-bridge.mjs';

export const SHUTDOWNS_KEY = 'psnpp-shutdowns';
export const UNOBTAINABLES_KEY = 'psnpp-unobtainabletrophies';

/** How far ahead a shutdown is worth mentioning. */
export const SHUTDOWN_HORIZON_DAYS = 120;

const DAY_MS = 24 * 60 * 60 * 1000;

const isPlainObject = value =>
  value != null && typeof value === 'object' && !Array.isArray(value);

/**
 * The `list` map out of one of PSNP+'s expirable caches.
 *
 * Its stored shape is `{ timestamp, data: { version, list } }`. Anything else —
 * absent, unparseable, a version this build does not know — reads as an empty
 * map, because a watch that cannot read its input must say nothing rather than
 * claim nothing is wrong.
 */
export function readFeed(storage, key) {
  try {
    const raw = storage.getItem(key);
    if (typeof raw !== 'string') return {};
    const parsed = JSON.parse(raw);
    const list = parsed?.data?.list;
    return isPlainObject(list) ? list : {};
  } catch {
    return {};
  }
}

/**
 * Every game across every list, with the lists it appears in.
 *
 * Deliberately includes 📡 remote lists. They are excluded from SYNC because
 * they are derived from a feed and syncing them would fight their own refresh —
 * but they are still lists the user chose to keep, and a game shutting down
 * inside one matters exactly as much.
 */
export function gamesInLists(storage) {
  const games = new Map();
  for (const list of readLists(storage)) {
    if (!Array.isArray(list?.games)) continue;
    for (const game of list.games) {
      if (!isPlainObject(game) || game.id == null) continue;
      const id = String(game.id);
      const entry = games.get(id) ?? { id, title: game.title ?? '', lists: [] };
      if (typeof list.name === 'string' && !entry.lists.includes(list.name)) {
        entry.lists.push(list.name);
      }
      if (!entry.title && typeof game.title === 'string') entry.title = game.title;
      games.set(id, entry);
    }
  }
  return [...games.values()];
}

/**
 * Games in your lists whose servers are closing, or already have.
 *
 * Already-closed is reported separately rather than filtered out: "this one is
 * already gone" is not a warning you can act on, but it is the answer to why a
 * game will not platinum, and hiding it would make the list look clean while
 * being wrong.
 */
export function shutdownWatch(games, feed, now, horizonDays = SHUTDOWN_HORIZON_DAYS) {
  const soon = [];
  const passed = [];
  for (const game of games) {
    const entry = feed[game.id];
    if (!isPlainObject(entry)) continue;
    const at = Number(entry.shutdownTimestamp);
    if (!Number.isFinite(at) || at === 0) continue;

    const days = Math.round((at - now) / DAY_MS);
    const found = { ...game, at, days, note: typeof entry.note === 'string' ? entry.note : '' };
    if (at <= now) passed.push(found);
    else if (days <= horizonDays) soon.push(found);
  }
  soon.sort((a, b) => a.at - b.at);
  passed.sort((a, b) => b.at - a.at);
  return { soon, passed };
}

/**
 * Games in your lists that carry unobtainable trophies.
 *
 * The feed maps a trophy-list id to the indices of its unobtainable trophies,
 * so the count is all that can honestly be reported from here — naming them
 * would mean resolving indices against a trophy list this code never sees.
 */
export function unobtainableWatch(games, feed) {
  const out = [];
  for (const game of games) {
    const trophies = feed[game.id];
    if (!Array.isArray(trophies) || trophies.length === 0) continue;
    out.push({ ...game, count: trophies.length });
  }
  return out.sort((a, b) => b.count - a.count);
}

/** Both checks against PSNP+'s caches. Never throws. */
export function checkWatch({ storage, now = Date.now(), horizonDays = SHUTDOWN_HORIZON_DAYS }) {
  try {
    const games = gamesInLists(storage);
    const shutdowns = shutdownWatch(games, readFeed(storage, SHUTDOWNS_KEY), now, horizonDays);
    const unobtainable = unobtainableWatch(games, readFeed(storage, UNOBTAINABLES_KEY));
    return { shutdowns, unobtainable, gamesChecked: games.length };
  } catch {
    return { shutdowns: { soon: [], passed: [] }, unobtainable: [], gamesChecked: 0 };
  }
}

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/**
 * A line for the chip, or null when there is nothing to say.
 *
 * Only the closing servers are urgent enough to interrupt with. Unobtainables
 * are permanent and already happened — worth being able to look up, not worth
 * a message every page load — so they are reported only through the panel.
 */
export function describeWatch(watch) {
  const soon = watch?.shutdowns?.soon ?? [];
  if (soon.length === 0) return null;

  const next = soon[0];
  const when = next.days <= 0 ? 'today' : `in ${plural(next.days, 'day')}`;
  const rest = soon.length > 1 ? ` (+${soon.length - 1} more)` : '';
  return `${next.title || 'A game'} in your lists shuts down ${when}${rest}.`;
}

/** The full picture, for the settings panel. */
export function describeWatchDetail(watch) {
  const lines = [];
  for (const game of watch?.shutdowns?.soon ?? []) {
    const when = game.days <= 0 ? 'today' : `${plural(game.days, 'day')}`;
    lines.push(`⏳ ${game.title} — shuts down in ${when}${game.note ? ` · ${game.note}` : ''}`);
  }
  for (const game of watch?.shutdowns?.passed ?? []) {
    lines.push(`⛔ ${game.title} — servers already closed`);
  }
  for (const game of watch?.unobtainable ?? []) {
    lines.push(`⚠️ ${game.title} — ${plural(game.count, 'unobtainable trophy')}`.replace('trophys', 'trophies'));
  }
  return lines;
}
