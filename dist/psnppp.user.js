// ==UserScript==
// @name         PSNP++
// @namespace    psnppp.trippixn
// @version      2.3.36
// @description  Two-way cross-device sync for your PSNP+ game lists
// @icon         https://raw.githubusercontent.com/trippixn963/PSNPPlusPlus/main/assets/icon-128.png
// @author       Trippixn
// @homepage     https://trippixn.com
// @supportURL   https://discord.gg/syria
// @match        https://psnprofiles.com/*
// @run-at       document-start
// @inject-into  page
// @sandbox      raw
// @noframes
// @grant        GM_xmlhttpRequest
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.deleteValue
// @connect      trippixn.com
// @downloadURL  https://trippixn.com/psnppp.user.js
// @updateURL    https://trippixn.com/psnppp.meta.js
// ==/UserScript==
(() => {
  // userscript/src/doc.mjs
  var DOC_VERSION = 1;
  var META_FIELDS = [
    "name",
    "tags",
    "removeStartedGames",
    "removeGames",
    "orderBy",
    "direction",
    "note",
    "timestamp"
  ];
  function emptyDoc() {
    return { version: DOC_VERSION, lists: {} };
  }
  function isRemoteList(list) {
    return typeof list.url === "string" && list.url !== "";
  }
  function splitRemote(lists) {
    const syncable = [];
    const remote = [];
    for (const list of lists) {
      (isRemoteList(list) ? remote : syncable).push(list);
    }
    return { syncable, remote };
  }
  function toDoc(lists) {
    const doc = emptyDoc();
    for (const list of splitRemote(lists).syncable) {
      const meta = { updatedAt: 0 };
      for (const field of META_FIELDS) meta[field] = list[field];
      const games = {};
      const gameOrder = [];
      for (const game of list.games ?? []) {
        games[game.id] = { ...game, updatedAt: 0 };
        gameOrder.push(game.id);
      }
      doc.lists[list.id] = {
        meta,
        games,
        gameOrder,
        orderUpdatedAt: 0,
        deletedGames: {},
        deletedAt: null
      };
    }
    return doc;
  }
  function fromDoc(doc) {
    const lists = [];
    for (const [listId, node] of Object.entries(doc.lists)) {
      if (node.deletedAt != null) continue;
      const ordered = node.gameOrder.filter((id) => node.games[id] != null);
      const seen = new Set(ordered);
      for (const id of Object.keys(node.games)) {
        if (!seen.has(id)) ordered.push(id);
      }
      const list = { id: listId };
      for (const field of META_FIELDS) list[field] = node.meta[field];
      list.games = ordered.map((id) => {
        const { updatedAt, ...game } = node.games[id];
        return game;
      });
      lists.push(list);
    }
    return lists;
  }

  // userscript/src/sync-client.mjs
  function gmRequest(options) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        ...options,
        onload: (response) => resolve({ status: response.status, responseText: response.responseText }),
        onerror: () => reject(new Error("Network error")),
        ontimeout: () => reject(new Error("Request timed out")),
        onabort: () => reject(new Error("Request aborted"))
      });
    });
  }
  function parseBody(response) {
    try {
      return JSON.parse(response.responseText);
    } catch {
      const snippet = String(response.responseText ?? "").slice(0, 120);
      throw new Error(`Malformed response body (HTTP ${response.status}): ${snippet}`);
    }
  }
  function assertDocVersion(doc) {
    if (doc == null || doc.version !== DOC_VERSION) {
      throw new Error(`Unsupported document version: ${doc?.version}`);
    }
  }
  function createSyncClient({
    endpoint,
    key,
    request = gmRequest,
    timeoutMs = 15e3
  }) {
    const base = String(endpoint).replace(/\/+$/, "");
    const headers = { "X-Sync-Key": key, "Content-Type": "application/json" };
    const url = `${base}/state`;
    return {
      async getState() {
        const response = await request({
          method: "GET",
          url,
          headers,
          timeout: timeoutMs
        });
        if (response.status !== 200) {
          throw new Error(`Sync server returned ${response.status}`);
        }
        const body = parseBody(response);
        assertDocVersion(body.doc);
        return { revision: body.revision, updatedAt: body.updatedAt, doc: body.doc };
      },
      async putState(baseRevision, doc) {
        const response = await request({
          method: "PUT",
          url,
          headers,
          timeout: timeoutMs,
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

  // userscript/src/treelog.mjs
  var REQUEST_TIMEOUT_MS = 1e4;
  async function sendTree({ endpoint, key, title, items = [], emoji = "\u{1F4E6}", request = gmRequest }) {
    if (!endpoint || !key || !title) return false;
    try {
      const response = await request({
        method: "POST",
        url: `${String(endpoint).replace(/\/+$/, "")}/log`,
        headers: { "Content-Type": "application/json", "X-Sync-Key": key },
        data: JSON.stringify({
          title: String(title),
          emoji: String(emoji),
          // Values are stringified HERE rather than server-side so a value that
          // cannot serialise costs one row, not the whole tree.
          items: items.map(([k, v]) => [String(k), safeValue(v)])
        }),
        timeout: REQUEST_TIMEOUT_MS
      });
      return response?.status >= 200 && response?.status < 300;
    } catch {
      return false;
    }
  }
  function safeValue(value) {
    try {
      if (value == null) return "";
      if (typeof value === "string") return value;
      if (typeof value === "number" || typeof value === "boolean") return String(value);
      return JSON.stringify(value) ?? String(value);
    } catch {
      return "<unrenderable>";
    }
  }
  function createTreeLog({ endpoint, key, request = gmRequest } = {}) {
    return function log(title, items, emoji = "\u{1F4E6}") {
      void sendTree({ endpoint, key, title, items, emoji, request });
    };
  }

  // userscript/src/config.mjs
  var ENDPOINT_KEY = "psnppp.endpoint";
  var SECRET_KEY = "psnppp.key";
  var DEFAULT_ENDPOINT = "https://trippixn.com/api/psnppp";
  async function loadConfig() {
    const endpoint = await GM.getValue(ENDPOINT_KEY, DEFAULT_ENDPOINT);
    const key = await GM.getValue(SECRET_KEY, "");
    return { endpoint, key };
  }
  async function saveConfig({ endpoint, key }) {
    await GM.setValue(ENDPOINT_KEY, endpoint);
    await GM.setValue(SECRET_KEY, key);
  }
  function isAllowedEndpoint(endpoint) {
    let parsed;
    try {
      parsed = new URL(String(endpoint));
    } catch {
      return false;
    }
    if (parsed.protocol === "https:") return true;
    if (parsed.protocol !== "http:") return false;
    return parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  }
  var INSECURE_ENDPOINT_MESSAGE = "That endpoint was not saved. The sync key is sent as a request header, so the endpoint must be https:// (http:// is allowed only for localhost or 127.0.0.1).";
  function describeStoredKey(key) {
    return key ? "One is already stored. Leave this blank to keep it." : "None stored yet.";
  }
  async function applyConfig(submitted) {
    const endpoint = String(submitted?.endpoint ?? "").trim();
    const rawKey = submitted?.key;
    if (!isAllowedEndpoint(endpoint)) {
      return { ok: false, message: INSECURE_ENDPOINT_MESSAGE };
    }
    const current = await loadConfig();
    const typedKey = String(rawKey ?? "").trim();
    const config = { endpoint, key: typedKey === "" ? current.key : typedKey };
    await saveConfig(config);
    return { ok: true, config };
  }

  // userscript/src/backup.mjs
  var INDEX_KEY = "psnppp.backups";
  var MAX_BACKUPS = 3;
  function trim(index) {
    const keep = [];
    const dropped = [];
    if (!Array.isArray(index)) return { keep, dropped };
    for (const [position, entry] of index.entries()) {
      if (position < MAX_BACKUPS || entry?.protected) keep.push(entry);
      else dropped.push(entry);
    }
    return { keep, dropped };
  }
  async function saveBackup(lists, now = Date.now(), { protect = null } = {}) {
    const index = await GM.getValue(INDEX_KEY, []);
    const id = `psnppp.backup.${now}`;
    await GM.setValue(id, JSON.stringify(lists));
    const next = [{ id, at: now, listCount: lists.length }, ...index].map((entry) => {
      const { protected: _cleared, ...rest } = entry;
      return entry.id === protect ? { ...rest, protected: true } : rest;
    });
    const { keep, dropped } = trim(next);
    await GM.setValue(INDEX_KEY, keep);
    for (const entry of dropped) {
      try {
        await GM.deleteValue(entry.id);
      } catch (error) {
        console.error("[psnppp] could not delete an evicted backup:", error);
      }
    }
    return id;
  }
  async function listBackups() {
    return trim(await GM.getValue(INDEX_KEY, [])).keep;
  }
  var easternDayFormat;
  function easternDay(at) {
    if (!Number.isFinite(at)) return null;
    try {
      easternDayFormat ??= new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      });
      return easternDayFormat.format(at);
    } catch (error) {
      console.error("[psnppp] could not read the Eastern date:", error);
      return null;
    }
  }
  async function saveDailyBackup(lists, now = Date.now(), { force = false } = {}) {
    if (force) return saveBackup(lists, now);
    const index = await GM.getValue(INDEX_KEY, []);
    const newest = Array.isArray(index) ? index[0] : null;
    const today = easternDay(now);
    const last = newest == null ? null : easternDay(newest.at);
    if (today != null && last === today) return null;
    return saveBackup(lists, now);
  }
  async function restoreBackup(id) {
    const raw = await GM.getValue(id, null);
    if (raw == null) throw new Error(`No such backup: ${id}`);
    try {
      return JSON.parse(raw);
    } catch (error) {
      throw new Error(`Backup ${id} is corrupt: ${error.message}`, { cause: error });
    }
  }

  // userscript/src/lists-bridge.mjs
  var LISTS_KEY = "psnpp-lists";
  function readLists(storage) {
    try {
      const raw = storage.getItem(LISTS_KEY);
      if (raw == null) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((l) => l != null && typeof l === "object");
    } catch {
      return [];
    }
  }
  function writeLists(storage, lists) {
    storage.setItem(LISTS_KEY, JSON.stringify(lists));
  }
  function readSyncable(storage) {
    return splitRemote(readLists(storage));
  }
  function writeSyncable(storage, syncedLists) {
    const { remote } = readSyncable(storage);
    const remoteIds = new Set(remote.map((l) => l.id));
    const cleaned = syncedLists.filter((l) => {
      if (isRemoteList(l)) {
        console.warn("[psnppp] writeSyncable: dropping remote list in syncedLists:", l.id);
        return false;
      }
      if (remoteIds.has(l.id)) {
        console.warn("[psnppp] writeSyncable: dropping syncedList with remote id collision:", l.id);
        return false;
      }
      return true;
    });
    writeLists(storage, [...cleaned, ...remote]);
  }
  function watchLists(storage, onChange, { intervalMs = 2e3, target = globalThis } = {}) {
    let last = storage.getItem(LISTS_KEY);
    let inCheck = false;
    const check = () => {
      if (inCheck) return;
      inCheck = true;
      try {
        const current = storage.getItem(LISTS_KEY);
        if (current === last) return;
        last = current;
        try {
          onChange();
        } catch (e) {
          console.error("[psnppp] Sync callback error:", e);
        }
      } finally {
        last = storage.getItem(LISTS_KEY);
        inCheck = false;
      }
    };
    const proto = target.Storage?.prototype;
    const originalSetItem = proto?.setItem;
    let patchedSetItem;
    if (originalSetItem) {
      patchedSetItem = function(key, value) {
        originalSetItem.call(this, key, value);
        if (key === LISTS_KEY) {
          try {
            check();
          } catch (e) {
            console.error("[psnppp] Storage patch error:", e);
          }
        }
      };
      proto.setItem = patchedSetItem;
    }
    const onStorageEvent = (event) => {
      if (event.key === LISTS_KEY) {
        try {
          check();
        } catch (e) {
          console.error("[psnppp] Storage event error:", e);
        }
      }
    };
    target.addEventListener?.("storage", onStorageEvent);
    const timer = setInterval(() => {
      try {
        check();
      } catch (e) {
        console.error("[psnppp] Poll error:", e);
      }
    }, intervalMs);
    return function stop() {
      if (originalSetItem && proto.setItem === patchedSetItem) {
        proto.setItem = originalSetItem;
      }
      target.removeEventListener?.("storage", onStorageEvent);
      clearInterval(timer);
    };
  }

  // userscript/src/theme.mjs
  var TOKENS = {
    plate: "#1b1d1f",
    sunken: "#141618",
    control: "#24272a",
    hairline: "#26292b",
    edge: "#33373a",
    quiet: "#646464",
    engrave: "#8a8d91",
    data: "#cfd2d5",
    bright: "#e0e0e0",
    bronze: "#dd8301",
    bronzeDim: "#a77b34",
    silver: "#c3c6cc",
    gold: "#f0c117",
    platinum: "#a9d6ea",
    fault: "#ba4b47",
    faultDim: "#5c3230",
    // The same red as `fault`, in the form rgba() needs. Written out because a
    // hand-converted `rgba(186, 75, 71, …)` elsewhere in the sheet would keep the
    // old colour after `fault` changed, with nothing to catch it.
    faultRgb: "186, 75, 71"
  };
  var TIERS = {
    locked: TOKENS.edge,
    bronze: TOKENS.bronze,
    silver: TOKENS.silver,
    gold: TOKENS.gold,
    platinum: TOKENS.platinum,
    fault: TOKENS.fault
  };
  var LOCKED_TIER = "locked";
  var INDICATOR_ID = "psnppp-indicator";
  var PANEL_ID = "psnppp-panel";
  var PANEL_WIDTH_PX = 300;
  var EDGE_INSET_PX = 12;
  var CHIP_FALLBACK_SIZE = { width: 120, height: 26 };
  var DOCK_SNAP_MS = 220;
  var Z_LAYER = 99999;
  var PLATE_SHADOW = "0 1px 4px rgba(0, 0, 0, .45)";
  var TYPE = {
    display: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    data: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
  };
  var STYLE_ID = "psnppp-style";
  var styled = /* @__PURE__ */ new WeakSet();
  var t = TOKENS;
  var tierRules = Object.entries(TIERS).map(
    ([tier, color]) => `
#${INDICATOR_ID}.psnppp-tier-${tier} .psnppp-rail { background: ${color}; }
#${INDICATOR_ID}.psnppp-tier-${tier} .psnppp-label { color: ${tier === LOCKED_TIER ? t.engrave : color}; }`
  ).join("");
  var litTiers = Object.keys(TIERS).filter((tier) => tier !== LOCKED_TIER).map((tier) => `#${INDICATOR_ID}.psnppp-tier-${tier}`).join(",\n");
  var CSS = `
/* A reset that cannot leak: the universal selector is fenced behind our own
   ids, so it only ever reaches our own descendants. psnprofiles.com sets
   margins, floats and text-shadows on plenty of generic elements, and any of
   them landing inside the widget would be a page style reaching in. */
#${INDICATOR_ID},
#${INDICATOR_ID} *,
#${PANEL_ID},
#${PANEL_ID} * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  text-align: left;
  float: none;
  text-shadow: none;
  /* border:0 is not tidiness. The mark is built from bare i elements, and i is
     exactly the tag an icon-font site styles globally \u2014 a page rule as ordinary
     as "i { border: 1px solid }" (no !important needed) puts a box around each
     arm and thickens it. Every intentional border in this sheet is declared
     later at equal-or-greater specificity, so all of them survive.

     background-color is here for the same reason and was missed: the chip's
     mark is a span carrying only a background-IMAGE, and the image shorthand
     does not clear a colour underneath it. A page rule as ordinary as
     "span { background: #fff }" therefore paints a white disc behind our dark
     one \u2014 observed live on psnprofiles.com, where the mark rendered as a white
     circle that no local preview could reproduce.
     NOTE: this whole sheet is a template literal. No backticks in comments. */
  border: 0;
  background-color: transparent;
}

/* ---- the chip ---------------------------------------------------------- */

#${INDICATOR_ID} {
  position: fixed;
  right: ${EDGE_INSET_PX}px;
  bottom: ${EDGE_INSET_PX}px;
  z-index: ${Z_LAYER};
  display: inline-flex;
  align-items: stretch;
  gap: 0;
  max-width: calc(100vw - ${EDGE_INSET_PX * 2}px);
  min-height: ${CHIP_FALLBACK_SIZE.height - 2}px;
  overflow: hidden;
  background: ${t.plate};
  border: 1px solid ${t.edge};
  border-radius: 3px;
  box-shadow: ${PLATE_SHADOW};
  cursor: pointer;
  user-select: none;
  touch-action: none;
  opacity: .55;
  transition: opacity .18s ease, border-color .18s ease;
}

/* PSNP+'s own floating menu sits at opacity .2 until you touch it. Fading at
   rest is this page's established manner for a guest widget; .55 keeps ours
   legible while still receding. */
#${INDICATOR_ID}:hover,
#${INDICATOR_ID}:focus-visible,
#${INDICATOR_ID}.psnppp-open {
  opacity: 1;
}

#${INDICATOR_ID}:focus-visible {
  outline: 2px solid ${t.platinum};
  outline-offset: 2px;
}

/* The post-drop snap to an edge. Scoped to its own class rather than folded
   into the base transition list above: a drag has to track the pointer with
   no lag, and only the deliberate snap that happens AFTER release may ease.
   The class is added for exactly the snap's duration and lifted after, so an
   ordinary drag never picks up this transition by accident. */
#${INDICATOR_ID}.psnppp-dock-snap {
  transition: left ${DOCK_SNAP_MS}ms cubic-bezier(.22, .61, .36, 1),
    top ${DOCK_SNAP_MS}ms cubic-bezier(.22, .61, .36, 1);
}

#${INDICATOR_ID} .psnppp-rail {
  flex: 0 0 3px;
  width: 3px;
  align-self: stretch;
  background: ${t.edge};
  transition: background .18s ease;
}

#${INDICATOR_ID} .psnppp-label {
  flex: 0 1 auto;
  padding: 6px 10px 6px 8px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-family: ${TYPE.display};
  font-size: 10px;
  font-weight: 700;
  font-style: normal;
  line-height: 12px;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: ${t.engrave};
  transition: color .18s ease;
}

/* Locked is the settled look: an unlit plate. No metal, no gradient, nothing
   to look at \u2014 which is the point, because nothing is being asked of anyone. */
${tierRules}

/* Anything with a metal has something to say, so it stops receding. */
${litTiers} {
  opacity: 1;
}

/* An error is the one state that may not be mistaken for the page. Full
   opacity, the only warm hue in the widget, and the plate's own edge turns. */
#${INDICATOR_ID}.psnppp-tier-fault {
  border-color: ${t.fault};
  box-shadow: ${PLATE_SHADOW}, 0 0 0 1px rgba(${t.faultRgb}, .35);
}

/* THE SIGNATURE \u2014 the pop.
   One specular band crosses the plate the moment a state arrives that needs
   the user, and never again until the next one. It is the trophy-unlock shine
   from the console this hobby lives on, spent once, on the only event worth
   spending it on. Locked states never get it. */
#${INDICATOR_ID} .psnppp-sheen {
  position: absolute;
  top: 0;
  left: 0;
  width: 40%;
  height: 100%;
  pointer-events: none;
  opacity: 0;
  background: linear-gradient(
    100deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, .16) 50%,
    rgba(255, 255, 255, 0) 100%
  );
}

#${INDICATOR_ID}.psnppp-pop .psnppp-sheen {
  animation: psnppp-sweep .52s cubic-bezier(.22, .61, .36, 1) 1;
}

@keyframes psnppp-sweep {
  0%   { opacity: 0; transform: translateX(-120%); }
  12%  { opacity: 1; }
  100% { opacity: 0; transform: translateX(340%); }
}


/* ---- the panel --------------------------------------------------------- */

#${PANEL_ID} {
  position: fixed;
  z-index: ${Z_LAYER};
  width: ${PANEL_WIDTH_PX}px;
  max-width: calc(100vw - ${EDGE_INSET_PX * 2}px);
  max-height: calc(100vh - ${EDGE_INSET_PX * 2}px);
  overflow: auto;
  background: ${t.plate};
  border: 1px solid ${t.edge};
  border-radius: 3px;
  box-shadow: 0 6px 22px rgba(0, 0, 0, .55);
  color: ${t.engrave};
  font-family: ${TYPE.body};
  font-size: 12px;
  line-height: 1.45;
}

#${PANEL_ID} .psnppp-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 9px 10px;
  border-bottom: 1px solid ${t.edge};
}

/* The mark, drawn rather than fetched.
   Same geometry and tokens as scripts/icon.html, built from two boxes per
   glyph: no image request, so nothing to 404 and nothing for psnprofiles.com's
   CSP to refuse, and it stays crisp at any zoom.

   Each plus is ONE element: the box is the vertical stroke, its ::before is the
   crossbar. Sized in fractional pixels because the crossbar has to sit centred
   on the arm \u2014 round it and the cross lands half a pixel off and reads as a
   smear rather than a glyph. */
#${PANEL_ID} .psnppp-mark {
  position: relative;
  flex: 0 0 auto;
  width: 18px;
  height: 18px;
}

/* Only the PANEL's mark gets a plate of its own. The chip already IS a plate,
   and nesting one inside the other is a box in a box: it reads as a stray
   button sitting inside the status pill rather than as a wordmark. */
#${PANEL_ID} .psnppp-mark {
  border-radius: 4px;
  background:
    radial-gradient(120% 100% at 22% 8%, rgba(255,255,255,.07), rgba(255,255,255,0) 55%),
    linear-gradient(158deg, ${t.control} 0%, ${t.plate} 48%, ${t.sunken} 100%);
  box-shadow:
    inset 0 0 0 1px rgba(169,214,234,.16),
    inset 0 1px 0 rgba(255,255,255,.05);
}

/* Proportions taken from scripts/icon.html rather than guessed, so the mark and
   the installed icon are the same drawing at two sizes:
     glyph pair : plate  = 0.62   (11.2px of 18)
     stroke     : arm    = 0.34   (1.8px of 5.2)
     gap        : glyph  = 0.18   (0.9px)
   The first version filled 89% of the plate and the arms ran almost to the
   edge \u2014 it read as crowded rather than as a mark with air around it. */
#${PANEL_ID} .psnppp-mark i {
  position: absolute;
  top: 6.4px;
  width: 1.8px;
  height: 5.2px;
  border-radius: 1px;
  background: linear-gradient(180deg, #ffdf72 0%, ${t.gold} 46%, #c8960b 100%);
}
#${PANEL_ID} .psnppp-mark i::before {
  content: '';
  position: absolute;
  left: -1.7px;
  top: 1.7px;
  width: 5.2px;
  height: 1.8px;
  border-radius: 1px;
  background: inherit;
}
#${PANEL_ID} .psnppp-mark i:first-child,
#${INDICATOR_ID} .psnppp-mark i:first-child { left: 5.1px; }
#${PANEL_ID} .psnppp-mark i:last-child,
#${INDICATOR_ID} .psnppp-mark i:last-child { right: 5.1px; }

/* The chip is inline-flex with align-items:stretch, and an item with a definite
   height does not stretch \u2014 so without this the mark pins to the top edge and
   sits 6px above the label's optical centre. The margin gives it the same 8px
   inset the label already has. */
/* No mark on the chip. It is 26px of someone else's page and the rail already
   identifies it; a logo in there read as clutter at every size tried. The panel
   carries the branding, where there is room for it. */


#${PANEL_ID} .psnppp-brand {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

/* The version sits with the wordmark rather than in the footer: it is the first
   thing anyone needs when reporting that something is wrong. */
#${PANEL_ID} .psnppp-version {
  font-family: ${TYPE.display};
  font-size: 9px;
  letter-spacing: .08em;
  color: ${t.quiet};
  padding: 1px 5px;
  border: 1px solid ${t.hairline};
  border-radius: 999px;
  white-space: nowrap;
}

/* Footer: two quiet links, weighted below everything actionable above them. */
#${PANEL_ID} .psnppp-foot {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-top: 1px solid ${t.edge};
  background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.18) 100%);
}

#${PANEL_ID} .psnppp-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border: 1px solid ${t.hairline};
  border-radius: 5px;
  background: ${t.control};
  font-family: ${TYPE.display};
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .1em;
  text-transform: uppercase;
  transition: color 120ms ease, border-color 120ms ease, background 120ms ease;
  /* The sheet's only two !important declarations. See the header: specificity
     cannot beat an author !important, and "a { color: #06c !important }" is an
     ordinary thing for a site to ship. Blue underlined links in a graphite
     footer read as broken, not as different. */
  color: ${t.engrave} !important;
  text-decoration: none !important;
}
#${PANEL_ID} .psnppp-link:hover {
  color: ${t.bright} !important;
  border-color: ${t.edge};
  background: ${t.plate};
}
#${PANEL_ID} .psnppp-link svg { width: 11px; height: 11px; fill: currentColor; display: block; }
#${PANEL_ID} .psnppp-foot .psnppp-spacer { flex: 1 1 auto; }

#${PANEL_ID} .psnppp-title {
  font-family: ${TYPE.display};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: ${t.engrave};
}

#${PANEL_ID} .psnppp-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid ${t.edge};
}

#${PANEL_ID} .psnppp-tab {
  flex: 1 1 0;
  padding: 8px 4px;
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-family: ${TYPE.display};
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .12em;
  text-transform: uppercase;
  text-align: center;
  color: ${t.quiet};
}

#${PANEL_ID} .psnppp-tab:hover { color: ${t.engrave}; }

/* Deliberately NOT gold. Gold is spent once in this panel, on Save \u2014 the one
   control that writes anything. A gold tab underline competed with it and made
   "which tab am I on" look as urgent as "this is the button that commits". */
#${PANEL_ID} .psnppp-tab[aria-selected="true"] {
  color: ${t.bright};
  border-bottom-color: ${t.bright};
}

#${PANEL_ID} .psnppp-pane { padding: 10px; }

#${PANEL_ID} .psnppp-field { margin-bottom: 10px; }

#${PANEL_ID} .psnppp-fieldlabel {
  display: block;
  margin-bottom: 4px;
  font-family: ${TYPE.display};
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: ${t.quiet};
}

#${PANEL_ID} .psnppp-input {
  display: block;
  width: 100%;
  padding: 6px 7px;
  background: ${t.sunken};
  border: 1px solid ${t.edge};
  border-radius: 2px;
  font-family: ${TYPE.data};
  font-size: 11px;
  line-height: 1.4;
  color: ${t.bright};
}

#${PANEL_ID} .psnppp-input:focus-visible {
  outline: 2px solid ${t.platinum};
  outline-offset: 1px;
}

#${PANEL_ID} .psnppp-hint {
  margin-top: 4px;
  font-size: 11px;
  color: ${t.quiet};
}

#${PANEL_ID} .psnppp-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 7px 0;
  border-top: 1px solid ${t.hairline};
}

#${PANEL_ID} .psnppp-row:first-child { border-top: 0; }

#${PANEL_ID} .psnppp-rowmain {
  flex: 1 1 auto;
  min-width: 0;
  font-family: ${TYPE.data};
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: ${t.data};
  overflow-wrap: anywhere;
}

#${PANEL_ID} .psnppp-rowmeta {
  display: block;
  font-size: 10px;
  color: ${t.quiet};
}

#${PANEL_ID} .psnppp-empty {
  padding: 4px 0 2px;
  color: ${t.quiet};
}

#${PANEL_ID} .psnppp-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 2px;
}

#${PANEL_ID} .psnppp-btn {
  padding: 5px 10px;
  background: ${t.control};
  border: 1px solid ${t.edge};
  border-radius: 2px;
  cursor: pointer;
  font-family: ${TYPE.display};
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: ${t.engrave};
}

#${PANEL_ID} .psnppp-btn:hover { border-color: ${t.quiet}; color: ${t.bright}; }

#${PANEL_ID} .psnppp-btn:focus-visible {
  outline: 2px solid ${t.platinum};
  outline-offset: 1px;
}

#${PANEL_ID} .psnppp-btn-key { color: ${t.gold}; border-color: ${t.bronzeDim}; }
#${PANEL_ID} .psnppp-btn-key:hover { color: ${t.gold}; border-color: ${t.gold}; }

#${PANEL_ID} .psnppp-btn-danger { color: ${t.fault}; border-color: ${t.faultDim}; }
#${PANEL_ID} .psnppp-btn-danger:hover { color: ${t.fault}; border-color: ${t.fault}; }

#${PANEL_ID} .psnppp-close {
  padding: 2px 6px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 2px;
  cursor: pointer;
  font-family: ${TYPE.body};
  font-size: 14px;
  line-height: 1;
  color: ${t.quiet};
}

#${PANEL_ID} .psnppp-close:hover { color: ${t.bright}; }

#${PANEL_ID} .psnppp-close:focus-visible {
  outline: 2px solid ${t.platinum};
  outline-offset: 1px;
}

#${PANEL_ID} .psnppp-message {
  padding: 8px 10px;
  border-top: 1px solid ${t.edge};
  font-size: 11px;
  color: ${t.engrave};
  overflow-wrap: anywhere;
}

#${PANEL_ID} .psnppp-message-error {
  color: ${t.fault};
  background: rgba(${t.faultRgb}, .08);
}

/* Full width, under the row it belongs to. Sitting beside the timestamp
   squeezed both into two ragged columns and put "Replace lists" \u2014 the only
   destructive control in the widget \u2014 where it read as an afterthought. */
#${PANEL_ID} .psnppp-confirm {
  flex: 1 0 100%;
  padding: 4px 0 2px;
  color: ${t.engrave};
}

#${PANEL_ID} .psnppp-confirm .psnppp-actions { padding-top: 6px; }

/* The quality floor, not announced anywhere in the UI: a widget that animates
   through a vestibular disorder is a bug, and every transition above is
   decoration over an instant state change. */
@media (prefers-reduced-motion: reduce) {
  #${INDICATOR_ID},
  #${INDICATOR_ID} .psnppp-rail,
  #${INDICATOR_ID} .psnppp-label {
    transition: none;
  }
  #${INDICATOR_ID}.psnppp-pop .psnppp-sheen { animation: none; }
  /* Same id+class specificity as the rule that turns the snap on, so this
     wins on being LATER in the sheet rather than needing !important \u2014 the
     same reasoning theme.mjs already documents for every other selector here. */
  #${INDICATOR_ID}.psnppp-dock-snap { transition: none; }
}

/* Narrow viewports: the plate keeps its metal and loses its width. */
@media (max-width: 420px) {
  #${INDICATOR_ID} .psnppp-label { padding: 6px 8px 6px 6px; max-width: 46vw; }
  #${PANEL_ID} { width: calc(100vw - ${EDGE_INSET_PX * 2}px); }
}
`;
  function installStyles(doc) {
    if (!doc || styled.has(doc)) return null;
    if (doc.getElementById?.(STYLE_ID)) {
      styled.add(doc);
      return null;
    }
    const host = doc.head ?? doc.documentElement ?? doc.body;
    if (!host || typeof host.appendChild !== "function") return null;
    if (typeof doc.createElement !== "function") return null;
    const style = doc.createElement("style");
    style.id = STYLE_ID;
    style.textContent = CSS;
    host.appendChild(style);
    styled.add(doc);
    return style;
  }

  // userscript/src/indicator.mjs
  var STATES = {
    idle: { label: "Sync", tier: "locked", action: "sync", pops: false },
    syncing: { label: "Syncing", tier: "silver", action: "sync", pops: false },
    synced: { label: "Synced", tier: "locked", action: "sync", pops: false },
    reload: { label: "Reload page", tier: "platinum", action: "reload", pops: true },
    offline: { label: "Offline", tier: "fault", action: "sync", pops: true },
    conflict: { label: "Conflict", tier: "fault", action: "sync", pops: true },
    unconfigured: { label: "Set up sync", tier: "bronze", action: "sync", pops: true },
    // A userscript cannot silently self-install — that would be a security hole
    // — so this is an offer, not an update. The click opens the install page in
    // a NEW tab (see onUpdate below); it deliberately does not navigate the
    // current psnprofiles.com tab away.
    update: { label: "Update ready", tier: "gold", action: "update", pops: true },
    // PSNP+ saves its lists in a shape this build does not understand, so the
    // sync cycle never runs at all (see compat.mjs). `sync` stays the action: the
    // check re-runs at the top of every cycle, so a click is the way back the
    // moment PSNP++ is updated — and a click that cannot make things worse is the
    // right thing to leave under a chip that has just refused to touch anything.
    incompatible: { label: "Sync paused", tier: "fault", action: "sync", pops: true },
    // A localStorage write threw — almost always a full quota (see
    // storage-guard.mjs). The page is now showing a change that is NOT in storage,
    // and storage is what the sync cycle reads, so this is the one state that says
    // the data itself is untrustworthy rather than reporting on data we trust.
    // `sync` stays the action: a cycle re-reads storage and re-reports, which is
    // the only useful thing a click can do about a quota this script cannot free.
    storage: { label: "Save failed", tier: "fault", action: "sync", pops: true }
  };
  var CLICK_HINT = {
    sync: "click to sync now, right-click for settings.",
    reload: "click to reload the page, right-click for settings.",
    update: "click to install the update, right-click for settings."
  };
  var POSITION_KEY = "psnppp.chipPosition";
  var EDGE_MARGIN = 8;
  var DRAG_THRESHOLD_PX = 4;
  var RESIZE_SETTLE_MS = 120;
  var FALLBACK_SIZE = CHIP_FALLBACK_SIZE;
  var finiteOr = (value, fallback) => Number.isFinite(value) ? value : fallback;
  function clampAxis(value, size, view, margin = EDGE_MARGIN) {
    const furthest = Math.max(margin, finiteOr(view, 0) - Math.max(0, finiteOr(size, 0)) - margin);
    return Math.min(Math.max(finiteOr(value, margin), margin), furthest);
  }
  function clampToViewport(position, size, viewport, margin = EDGE_MARGIN) {
    return {
      left: clampAxis(
        position?.left,
        finiteOr(size?.width, FALLBACK_SIZE.width),
        viewport?.width,
        margin
      ),
      top: clampAxis(
        position?.top,
        finiteOr(size?.height, FALLBACK_SIZE.height),
        viewport?.height,
        margin
      )
    };
  }
  function isUsablePosition(position) {
    return position != null && typeof position === "object" && Number.isFinite(position.left) && Number.isFinite(position.top);
  }
  function isDockSide(value) {
    return value === "left" || value === "right";
  }
  function sideFor(left, width, viewWidth) {
    const view = finiteOr(viewWidth, 0);
    const distLeft = Math.max(0, finiteOr(left, 0));
    const distRight = view - distLeft - Math.max(0, finiteOr(width, 0));
    return distRight < distLeft ? "right" : "left";
  }
  function dockedLeft(side, width, viewWidth, inset = EDGE_INSET_PX) {
    const view = finiteOr(viewWidth, 0);
    return side === "right" ? clampAxis(view, width, view, inset) : clampAxis(-view, width, view, inset);
  }
  var readPosition = async () => {
    const stored = await GM.getValue(POSITION_KEY, null);
    if (typeof stored === "string") {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return stored;
  };
  var writePosition = async (position) => GM.setValue(POSITION_KEY, position);
  function createIndicator({
    onSyncNow,
    onSettings,
    onReload,
    onUpdate,
    loadPosition = readPosition,
    savePosition = writePosition,
    onPositionError = (error) => console.error("[psnppp] chip position:", error)
  } = {}) {
    installStyles(document);
    const element = document.createElement("div");
    element.id = INDICATOR_ID;
    element.setAttribute("role", "button");
    element.setAttribute("tabindex", "0");
    const rail = document.createElement("span");
    rail.className = "psnppp-rail";
    rail.setAttribute("aria-hidden", "true");
    element.appendChild(rail);
    const label = document.createElement("span");
    label.className = "psnppp-label";
    element.appendChild(label);
    const sheen = document.createElement("span");
    sheen.className = "psnppp-sheen";
    sheen.setAttribute("aria-hidden", "true");
    element.appendChild(sheen);
    let current = STATES.idle;
    let panelOpen = false;
    let snapping = false;
    let popping = false;
    const paintClasses = (pop = popping) => {
      popping = pop;
      element.className = [
        `psnppp-tier-${current.tier}`,
        popping ? "psnppp-pop" : "",
        panelOpen ? "psnppp-open" : "",
        snapping ? "psnppp-dock-snap" : ""
      ].filter(Boolean).join(" ");
    };
    const viewport = () => ({
      width: globalThis.window?.innerWidth ?? 0,
      height: globalThis.window?.innerHeight ?? 0
    });
    const rectOf = () => typeof element.getBoundingClientRect === "function" ? element.getBoundingClientRect() : null;
    const measure = () => {
      const rect = rectOf();
      return {
        width: rect?.width || element.offsetWidth || FALLBACK_SIZE.width,
        height: rect?.height || element.offsetHeight || FALLBACK_SIZE.height
      };
    };
    let position = null;
    let dockSide = "right";
    function apply(next) {
      position = next;
      element.style.left = `${next.left}px`;
      element.style.top = `${next.top}px`;
      element.style.right = "auto";
      element.style.bottom = "auto";
    }
    const place = (candidate, size = measure()) => apply(clampToViewport(candidate, size, viewport()));
    function applyDocked(side, top, size = measure()) {
      dockSide = isDockSide(side) ? side : "right";
      const view = viewport();
      apply({
        left: dockedLeft(dockSide, finiteOr(size?.width, FALLBACK_SIZE.width), view.width),
        top: clampAxis(top, finiteOr(size?.height, FALLBACK_SIZE.height), view.height, EDGE_MARGIN)
      });
      return position;
    }
    const persist = () => {
      if (position == null) return;
      try {
        Promise.resolve(savePosition({ ...position, side: dockSide })).catch(onPositionError);
      } catch (error) {
        onPositionError(error);
      }
    };
    async function restorePosition() {
      try {
        const stored = await loadPosition();
        if (!isUsablePosition(stored)) return null;
        const size = measure();
        const side = isDockSide(stored.side) ? stored.side : sideFor(stored.left, finiteOr(size.width, FALLBACK_SIZE.width), viewport().width);
        const corrected = applyDocked(side, stored.top, size);
        if (corrected.left !== stored.left || corrected.top !== stored.top || side !== stored.side) {
          persist();
        }
        return corrected;
      } catch (error) {
        onPositionError(error);
        return null;
      }
    }
    function handleResize() {
      if (position == null) return;
      const before = position;
      applyDocked(dockSide, position.top);
      if (position.left !== before.left || position.top !== before.top) persist();
    }
    let resizeTimer = null;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resizeTimer = null;
        handleResize();
      }, RESIZE_SETTLE_MS);
    };
    globalThis.window?.addEventListener?.("resize", onResize);
    let drag = null;
    let suppressClick = false;
    const onPointerDown = (event) => {
      if ((event.button ?? 0) !== 0) return;
      suppressClick = false;
      const size = measure();
      const rect = rectOf();
      const start2 = position ?? clampToViewport({ left: rect?.left ?? 0, top: rect?.top ?? 0 }, size, viewport());
      drag = {
        pointerId: event.pointerId,
        originX: event.clientX ?? 0,
        originY: event.clientY ?? 0,
        startLeft: start2.left,
        startTop: start2.top,
        // Measured once here and reused for the whole gesture. The chip cannot
        // change size while it is being dragged, and re-measuring per move forced
        // a synchronous layout at pointer frequency (120Hz+) on a page we do not
        // own — write, read, write, every single move event.
        size,
        moved: false
      };
    };
    const takeCapture = (pointerId) => {
      try {
        element.setPointerCapture?.(pointerId);
      } catch {
      }
    };
    const onPointerMove = (event) => {
      if (drag == null || event.pointerId != null && event.pointerId !== drag.pointerId) return;
      const dx = (event.clientX ?? 0) - drag.originX;
      const dy = (event.clientY ?? 0) - drag.originY;
      if (!drag.moved && Math.abs(dx) < DRAG_THRESHOLD_PX && Math.abs(dy) < DRAG_THRESHOLD_PX) return;
      if (!drag.moved) takeCapture(drag.pointerId);
      drag.moved = true;
      place({ left: drag.startLeft + dx, top: drag.startTop + dy }, drag.size);
    };
    let snapTimer = null;
    function snapToNearestSide(size) {
      const side = sideFor(
        position?.left ?? 0,
        finiteOr(size?.width, FALLBACK_SIZE.width),
        viewport().width
      );
      snapping = true;
      paintClasses();
      applyDocked(side, position?.top ?? 0, size);
      persist();
      clearTimeout(snapTimer);
      snapTimer = setTimeout(() => {
        snapping = false;
        paintClasses();
      }, DOCK_SNAP_MS);
    }
    const endDrag = (event, { commit = true } = {}) => {
      if (drag == null || event?.pointerId != null && event.pointerId !== drag.pointerId) return;
      const { moved, pointerId, size } = drag;
      drag = null;
      try {
        element.releasePointerCapture?.(pointerId);
      } catch {
      }
      if (!commit || !moved) return;
      suppressClick = true;
      snapToNearestSide(size);
    };
    const onPointerUp = endDrag;
    const onPointerCancel = (event) => endDrag(event, { commit: false });
    const onContextMenu = (event) => {
      event.preventDefault?.();
      onSettings();
    };
    const SURFACE_EVENTS = [
      ["pointerdown", onPointerDown],
      ["pointermove", onPointerMove],
      ["pointerup", onPointerUp],
      ["pointercancel", onPointerCancel],
      ["contextmenu", onContextMenu]
    ];
    const bindDrag = (target) => {
      for (const [type, handler] of SURFACE_EVENTS) target.addEventListener?.(type, handler);
    };
    const unbindDrag = (target) => {
      for (const [type, handler] of SURFACE_EVENTS) target.removeEventListener?.(type, handler);
    };
    bindDrag(element);
    const activate = () => {
      if (current.action === "reload") onReload();
      else if (current.action === "update") onUpdate();
      else onSyncNow();
    };
    element.addEventListener("click", () => {
      if (suppressClick) {
        suppressClick = false;
        return;
      }
      activate();
    });
    element.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " " && event.key !== "Spacebar") return;
      event.preventDefault?.();
      activate();
    });
    function setState(state, detail = "") {
      const name = typeof state === "string" ? state : "";
      const text = typeof detail === "string" ? detail : "";
      const style = Object.hasOwn(STATES, name) ? STATES[name] : STATES.idle;
      const arrived = style.tier !== current.tier;
      const pop = style.pops && arrived;
      current = style;
      if (pop) {
        paintClasses(false);
        void element.offsetWidth;
      }
      paintClasses(pop);
      label.textContent = style.label;
      const hint = CLICK_HINT[style.action] ?? CLICK_HINT.sync;
      const title = text ? `PSNP++ \u2014 ${text}
${hint[0].toUpperCase()}${hint.slice(1)}` : `PSNP++ \u2014 ${hint}`;
      element.title = title;
      element.setAttribute("aria-label", title.replace(/\n/g, " "));
    }
    function setPanelOpen(open) {
      panelOpen = Boolean(open);
      paintClasses();
    }
    setState("idle");
    return {
      element,
      setState,
      setPanelOpen,
      restorePosition,
      handleResize,
      /**
       * Release every listener and timer this installed.
       *
       * Nothing in the userscript calls this — the chip lives as long as the page
       * does. It exists because the resize listener is on `window`, which outlives
       * the chip: a test that builds a chip per case was leaving one behind on
       * every one of them, all still firing, all still measuring detached
       * elements. A widget that cannot be taken down is a leak waiting for a
       * caller.
       */
      destroy() {
        try {
          globalThis.window?.removeEventListener?.("resize", onResize);
          unbindDrag(element);
          clearTimeout(resizeTimer);
          clearTimeout(snapTimer);
        } catch (error) {
          onPositionError(error);
        }
      },
      /** Where the chip is, or null while it still sits in its default corner. */
      getPosition: () => position == null ? null : { ...position },
      /**
       * Which edge the chip is docked to — 'left' or 'right', always. Defaults
       * to 'right' before the first drag or restore, matching the CSS corner
       * the chip actually sits in until then, so the panel always has a real
       * side to open away from instead of a third "unknown" case to handle.
       */
      getSide: () => dockSide
    };
  }

  // userscript/src/panel.mjs
  var TABS = [
    { name: "sync", label: "Sync" },
    { name: "backups", label: "Backups" }
  ];
  function describeFailure(error, fallback) {
    try {
      const text = typeof error?.message === "string" && error.message ? error.message : String(error);
      return text && text !== "null" && text !== "undefined" && text !== "[object Object]" ? `${fallback}: ${text}` : `${fallback}.`;
    } catch {
      return `${fallback}.`;
    }
  }
  var stamp = (at) => {
    const date = new Date(at);
    return Number.isNaN(date.getTime()) ? "unknown time" : date.toLocaleString();
  };
  var countOf = (n, noun) => `${n} ${noun}${n === 1 ? "" : "s"}`;
  function createSettingsPanel({
    doc = globalThis.document,
    anchor = null,
    // Which edge the chip is docked to. Defaults 'right' to match the CSS
    // corner the chip sits in before it has ever been dragged (see
    // indicator.mjs's getSide) — that is also the one case `anchor` can be
    // non-null while genuinely undocked, so the default has to agree with it.
    side = "right",
    config = { endpoint: "", key: "" },
    backups = [],
    // Refusing defaults, not permissive ones. An unwired panel must not report a
    // saved credential or a completed restore.
    onSave = async () => ({ ok: false, message: "Settings are not wired up." }),
    onRestore = async () => ({ ok: false, message: "Restore is not wired up." }),
    onClose = () => {
    },
    // The server's own revision history, newest first: [{revision, updatedAt, size}].
    // Empty when the server could not be reached — the panel must still open.
    // Why it is empty, when that is not simply "there is none".
    // Shown beside the wordmark. Passed in rather than read here so the panel
    // stays free of GM_info and keeps rendering in node under the test runner.
    version = null
  } = {}) {
    const make = (tag2, className, text) => {
      const node = doc.createElement(tag2);
      if (className) node.className = className;
      if (text != null) node.textContent = text;
      return node;
    };
    const tag = (node, value) => {
      node.setAttribute("data-psnppp", value);
      return node;
    };
    const show = (node, visible) => {
      node.hidden = !visible;
      node.style.display = visible ? "" : "none";
    };
    const element = make("div");
    element.id = PANEL_ID;
    element.setAttribute("role", "dialog");
    element.setAttribute("aria-label", "PSNP++ settings");
    const head = make("div", "psnppp-head");
    const brand = make("div", "psnppp-brand");
    const mark = tag(make("span", "psnppp-mark"), "mark");
    mark.setAttribute("aria-hidden", "true");
    mark.appendChild(make("i"));
    mark.appendChild(make("i"));
    brand.appendChild(mark);
    brand.appendChild(make("span", "psnppp-title", "PSNP++"));
    if (version) brand.appendChild(tag(make("span", "psnppp-version", `v${version}`), "version"));
    head.appendChild(brand);
    const closeButton = tag(make("button", "psnppp-close", "\xD7"), "close");
    closeButton.setAttribute("type", "button");
    closeButton.setAttribute("aria-label", "Close settings");
    closeButton.addEventListener("click", () => close());
    head.appendChild(closeButton);
    element.appendChild(head);
    const tabBar = make("div", "psnppp-tabs");
    tabBar.setAttribute("role", "tablist");
    const tabButtons = /* @__PURE__ */ new Map();
    const panes = /* @__PURE__ */ new Map();
    for (const { name, label } of TABS) {
      const button = tag(make("button", "psnppp-tab", label), `tab-${name}`);
      button.setAttribute("type", "button");
      button.setAttribute("role", "tab");
      button.addEventListener("click", () => selectTab(name));
      tabBar.appendChild(button);
      tabButtons.set(name, button);
    }
    element.appendChild(tabBar);
    const syncPane = tag(make("div", "psnppp-pane"), "pane-sync");
    const endpointField = make("div", "psnppp-field");
    const endpointLabel = make("label", "psnppp-fieldlabel", "Endpoint");
    endpointLabel.setAttribute("for", "psnppp-endpoint");
    endpointField.appendChild(endpointLabel);
    const endpointInput = tag(make("input", "psnppp-input"), "endpoint");
    endpointInput.id = "psnppp-endpoint";
    endpointInput.setAttribute("type", "text");
    endpointInput.setAttribute("spellcheck", "false");
    endpointInput.setAttribute("autocomplete", "off");
    endpointInput.value = config?.endpoint ?? "";
    endpointField.appendChild(endpointInput);
    syncPane.appendChild(endpointField);
    const keyField = make("div", "psnppp-field");
    const keyLabel = make("label", "psnppp-fieldlabel", "Sync key");
    keyLabel.setAttribute("for", "psnppp-key");
    keyField.appendChild(keyLabel);
    const keyInput = tag(make("input", "psnppp-input"), "key");
    keyInput.id = "psnppp-key";
    keyInput.setAttribute("type", "password");
    keyInput.setAttribute("autocomplete", "off");
    keyInput.value = "";
    keyField.appendChild(keyInput);
    keyField.appendChild(tag(
      make("div", "psnppp-hint", describeStoredKey(config?.key)),
      "keyhint"
    ));
    syncPane.appendChild(keyField);
    const syncActions = make("div", "psnppp-actions");
    const cancelButton = tag(make("button", "psnppp-btn", "Cancel"), "cancel");
    cancelButton.setAttribute("type", "button");
    cancelButton.addEventListener("click", () => close());
    syncActions.appendChild(cancelButton);
    const saveButton = tag(make("button", "psnppp-btn psnppp-btn-key", "Save"), "save");
    saveButton.setAttribute("type", "button");
    saveButton.addEventListener("click", () => {
      submit().catch((error) => {
        showMessage(describeFailure(error, "Could not save your settings"), { error: true });
      });
    });
    syncActions.appendChild(saveButton);
    syncPane.appendChild(syncActions);
    element.appendChild(syncPane);
    panes.set("sync", syncPane);
    const backupsPane = tag(make("div", "psnppp-pane"), "pane-backups");
    if (backups.length === 0) {
      backupsPane.appendChild(tag(
        make("div", "psnppp-empty", "No backups yet. One is taken each day, and before any merge that would remove something."),
        "backups-empty"
      ));
    } else {
      for (const entry of backups) {
        backupsPane.appendChild(backupRow(entry));
      }
    }
    element.appendChild(backupsPane);
    panes.set("backups", backupsPane);
    function backupRow(entry) {
      const row = tag(make("div", "psnppp-row"), "backup-row");
      const main = make("div", "psnppp-rowmain", stamp(entry?.at));
      main.appendChild(tag(
        make("span", "psnppp-rowmeta", countOf(Number(entry?.listCount) || 0, "list")),
        "backup-count"
      ));
      row.appendChild(main);
      const restoreButton = tag(make("button", "psnppp-btn", "Restore"), "restore");
      restoreButton.setAttribute("type", "button");
      row.appendChild(restoreButton);
      const confirm = tag(make("div", "psnppp-confirm"), "backup-confirm");
      confirm.appendChild(make("div", null, "Replace your lists with this backup?"));
      const confirmActions = make("div", "psnppp-actions");
      const keepButton = tag(make("button", "psnppp-btn", "Keep mine"), "restore-cancel");
      keepButton.setAttribute("type", "button");
      keepButton.addEventListener("click", () => {
        show(confirm, false);
        show(restoreButton, true);
      });
      confirmActions.appendChild(keepButton);
      const goButton = tag(make("button", "psnppp-btn psnppp-btn-danger", "Replace lists"), "restore-confirm");
      goButton.setAttribute("type", "button");
      goButton.addEventListener("click", () => {
        runRestore(entry?.id, goButton).catch((error) => {
          goButton.disabled = false;
          showMessage(describeFailure(error, "Could not restore that backup"), { error: true });
        });
      });
      confirmActions.appendChild(goButton);
      confirm.appendChild(confirmActions);
      show(confirm, false);
      row.appendChild(confirm);
      restoreButton.addEventListener("click", () => {
        show(restoreButton, false);
        show(confirm, true);
      });
      return row;
    }
    const message = tag(make("div", "psnppp-message"), "message");
    show(message, false);
    element.appendChild(message);
    const foot = make("div", "psnppp-foot");
    const link = (href, label, svgPath, key) => {
      const node = tag(make("a", "psnppp-link"), key);
      node.setAttribute("href", href);
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
      const svg = doc.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 16 16");
      svg.setAttribute("aria-hidden", "true");
      const path = doc.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", svgPath);
      svg.appendChild(path);
      node.appendChild(svg);
      node.appendChild(make("span", null, label));
      node.addEventListener("click", (event) => event.stopPropagation());
      return node;
    };
    const GLOBE = "M8 0a8 8 0 100 16A8 8 0 008 0zM6.6 1.6a10.8 10.8 0 00-1.3 3.2H2.9a6.6 6.6 0 013.7-3.2zM2.2 6.2h2.9a15 15 0 000 3.6H2.2a6.6 6.6 0 010-3.6zm.7 5h2.4a10.8 10.8 0 001.3 3.2 6.6 6.6 0 01-3.7-3.2zM8 14.6c-.7-.7-1.3-1.9-1.6-3.4h3.2c-.3 1.5-.9 2.7-1.6 3.4zm1.8-4.8H6.2a13.6 13.6 0 010-3.6h3.6a13.6 13.6 0 010 3.6zM8 1.4c.7.7 1.3 1.9 1.6 3.4H6.4C6.7 3.3 7.3 2.1 8 1.4zm1.4.2a6.6 6.6 0 013.7 3.2h-2.4a10.8 10.8 0 00-1.3-3.2zm1.5 4.6h2.9a6.6 6.6 0 010 3.6h-2.9a15 15 0 000-3.6zm-.2 5h2.4a6.6 6.6 0 01-3.7 3.2 10.8 10.8 0 001.3-3.2z";
    const GITHUB = "M8 0C3.6 0 0 3.6 0 8a8 8 0 005.5 7.6c.4.1.5-.2.5-.4v-1.4c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.2 1.9.9 2.4.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8a7.5 7.5 0 014 0c1.5-1 2.2-.8 2.2-.8.5 1.1.2 1.9.1 2.1.5.5.8 1.2.8 2.1 0 3.1-1.8 3.8-3.6 4 .3.3.6.8.6 1.6v2.2c0 .2.1.5.5.4A8 8 0 0016 8c0-4.4-3.6-8-8-8z";
    foot.appendChild(link("https://trippixn.com", "trippixn.com", GLOBE, "link-site"));
    foot.appendChild(make("span", "psnppp-spacer"));
    foot.appendChild(link("https://github.com/trippixn963/PSNPPlusPlus", "GitHub", GITHUB, "link-repo"));
    element.appendChild(foot);
    function showMessage(text, { error = false } = {}) {
      message.textContent = text;
      message.className = error ? "psnppp-message psnppp-message-error" : "psnppp-message";
      message.setAttribute("role", error ? "alert" : "status");
      show(message, Boolean(text));
    }
    function clearMessage() {
      showMessage("");
    }
    let currentTab = null;
    function selectTab(name) {
      if (!panes.has(name) || name === currentTab) return;
      currentTab = name;
      for (const [key, pane] of panes) show(pane, key === name);
      for (const [key, button] of tabButtons) {
        button.setAttribute("aria-selected", key === name ? "true" : "false");
        button.setAttribute("tabindex", key === name ? "0" : "-1");
      }
    }
    async function submit() {
      clearMessage();
      const result = await onSave({ endpoint: endpointInput.value, key: keyInput.value });
      if (!result || result.ok !== true) {
        showMessage(result?.message ?? "Could not save your settings.", { error: true });
        return;
      }
      close();
    }
    async function runRestore(id, button) {
      clearMessage();
      button.disabled = true;
      const result = await onRestore(id);
      if (!result || result.ok !== true) {
        button.disabled = false;
        showMessage(result?.message ?? "Could not restore that backup.", { error: true });
        return;
      }
      showMessage(result.message ?? "Backup restored.");
    }
    let closed = false;
    let detachOutside = () => {
    };
    function close() {
      if (closed) return;
      closed = true;
      try {
        detachOutside();
      } catch {
      }
      try {
        element.remove?.();
      } catch (error) {
        console.error("[psnppp] could not remove the settings panel:", error);
      }
      try {
        onClose();
      } catch (error) {
        console.error("[psnppp] settings panel onClose failed:", error);
      }
    }
    element.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" && event.key !== "Esc") return;
      event.stopPropagation?.();
      close();
    });
    detachOutside = (() => {
      const onOutsidePointerDown = (event) => {
        const target = event?.target ?? null;
        if (target == null) return;
        if (element.contains?.(target)) return;
        if (anchor?.contains?.(target)) return;
        close();
      };
      doc.addEventListener?.("pointerdown", onOutsidePointerDown, true);
      return () => doc.removeEventListener?.("pointerdown", onOutsidePointerDown, true);
    })();
    selectTab(TABS[0].name);
    position();
    function position() {
      const view = {
        width: globalThis.window?.innerWidth ?? 0,
        height: globalThis.window?.innerHeight ?? 0
      };
      const rect = typeof anchor?.getBoundingClientRect === "function" ? anchor.getBoundingClientRect() : null;
      if (!rect || !view.width || !view.height) {
        element.style.right = `${EDGE_INSET_PX}px`;
        element.style.bottom = `${EDGE_INSET_PX * 2 + CHIP_FALLBACK_SIZE.height}px`;
        return;
      }
      const width = Math.min(PANEL_WIDTH_PX, Math.max(0, view.width - EDGE_INSET_PX * 2));
      const isDockedLeft = side === "left";
      const desiredLeft = isDockedLeft ? rect.right + EDGE_INSET_PX : rect.left - width - EDGE_INSET_PX;
      element.style.left = `${clampAxis(desiredLeft, width, view.width, EDGE_INSET_PX)}px`;
      element.style.right = "auto";
      const measured = [element.offsetHeight, element.getBoundingClientRect?.()?.height].find((value) => Number.isFinite(value) && value > 0);
      const height = measured ?? 0;
      element.style.top = `${Math.round(clampAxis(rect.top, height, view.height, EDGE_INSET_PX))}px`;
      element.style.bottom = "auto";
    }
    return { element, close, showMessage };
  }

  // userscript/src/merger.mjs
  var TOMBSTONE_TTL_MS = 90 * 24 * 60 * 60 * 1e3;
  var clone = (value) => JSON.parse(JSON.stringify(value));
  function stableStringify(obj) {
    if (obj === null || typeof obj !== "object") {
      return JSON.stringify(obj);
    }
    if (Array.isArray(obj)) {
      return "[" + obj.map((v) => v === void 0 ? "null" : stableStringify(v)).join(",") + "]";
    }
    const sorted = Object.keys(obj).filter((k) => obj[k] !== void 0).sort().map((k) => `"${k}":${stableStringify(obj[k])}`);
    return "{" + sorted.join(",") + "}";
  }
  function sameRecord(a, b) {
    if (a == null || b == null) return false;
    const { updatedAt: _a, ...left } = a;
    const { updatedAt: _b, ...right } = b;
    return stableStringify(left) === stableStringify(right);
  }
  function sameOrder(a, b) {
    return a.length === b.length && a.every((id, i) => id === b[i]);
  }
  function stampChanges(base, local, now) {
    const out = { version: DOC_VERSION, lists: {} };
    for (const [listId, localList] of Object.entries(local.lists)) {
      const baseList = base.lists[listId];
      const node = clone(localList);
      node.meta.updatedAt = sameRecord(localList.meta, baseList?.meta) ? baseList.meta.updatedAt : now;
      node.orderUpdatedAt = baseList != null && sameOrder(localList.gameOrder, baseList.gameOrder) ? baseList.orderUpdatedAt : now;
      for (const [gameId, localGame] of Object.entries(localList.games)) {
        const baseGame = baseList?.games?.[gameId];
        node.games[gameId].updatedAt = sameRecord(localGame, baseGame) ? baseGame.updatedAt : now;
      }
      node.deletedGames = {};
      for (const [gameId, timestamp] of Object.entries(baseList?.deletedGames ?? {})) {
        if (localList.games[gameId] == null) {
          node.deletedGames[gameId] = timestamp;
        }
      }
      for (const gameId of Object.keys(baseList?.games ?? {})) {
        if (localList.games[gameId] == null && node.deletedGames[gameId] == null) {
          node.deletedGames[gameId] = now;
        }
      }
      node.deletedAt = null;
      out.lists[listId] = node;
    }
    for (const [listId, baseList] of Object.entries(base.lists)) {
      if (local.lists[listId] != null) continue;
      out.lists[listId] = {
        meta: clone(baseList.meta),
        games: {},
        gameOrder: [],
        orderUpdatedAt: baseList.orderUpdatedAt,
        deletedGames: clone(baseList.deletedGames ?? {}),
        deletedAt: baseList.deletedAt ?? now
      };
    }
    return out;
  }
  function mergeTombstones(left = {}, right = {}) {
    const out = { ...left };
    for (const [gameId, deletedAt] of Object.entries(right)) {
      if (out[gameId] == null || deletedAt > out[gameId]) out[gameId] = deletedAt;
    }
    return out;
  }
  function latestActivity(node) {
    if (node == null) return 0;
    let latest = Math.max(node.meta?.updatedAt ?? 0, node.orderUpdatedAt ?? 0);
    for (const game of Object.values(node.games ?? {})) {
      if (game.updatedAt > latest) latest = game.updatedAt;
    }
    return latest;
  }
  function pickNewer(localItem, remoteItem) {
    const localTs = localItem?.updatedAt ?? 0;
    const remoteTs = remoteItem?.updatedAt ?? 0;
    if (localTs !== remoteTs) return localTs > remoteTs ? localItem : remoteItem;
    return stableStringify(localItem) >= stableStringify(remoteItem) ? localItem : remoteItem;
  }
  function pickOrderSource(localNode, remoteNode) {
    if (localNode.deletedAt != null) return remoteNode;
    if (remoteNode.deletedAt != null) return localNode;
    const localTs = localNode.orderUpdatedAt ?? 0;
    const remoteTs = remoteNode.orderUpdatedAt ?? 0;
    if (localTs !== remoteTs) return localTs > remoteTs ? localNode : remoteNode;
    return stableStringify(localNode.gameOrder) >= stableStringify(remoteNode.gameOrder) ? localNode : remoteNode;
  }
  function mergeList(localNode, remoteNode) {
    if (localNode == null) return clone(remoteNode);
    if (remoteNode == null) return clone(localNode);
    const deletedAt = Math.max(localNode.deletedAt ?? 0, remoteNode.deletedAt ?? 0);
    if (deletedAt > 0) {
      const survivor = localNode.deletedAt != null ? remoteNode : localNode;
      if (deletedAt > latestActivity(survivor)) {
        const meta2 = clone(pickNewer(localNode.meta, remoteNode.meta));
        const deletingNode = localNode.deletedAt != null ? localNode : remoteNode;
        return {
          meta: meta2,
          games: {},
          gameOrder: [],
          orderUpdatedAt: deletingNode.orderUpdatedAt ?? 0,
          deletedGames: mergeTombstones(localNode.deletedGames, remoteNode.deletedGames),
          deletedAt
        };
      }
    }
    const meta = clone(pickNewer(localNode.meta, remoteNode.meta));
    const deletedGames = mergeTombstones(localNode.deletedGames, remoteNode.deletedGames);
    const games = {};
    const gameIds = /* @__PURE__ */ new Set([...Object.keys(localNode.games), ...Object.keys(remoteNode.games)]);
    for (const gameId of gameIds) {
      const localGame = localNode.games[gameId];
      const remoteGame = remoteNode.games[gameId];
      const winner = localGame == null ? remoteGame : remoteGame == null ? localGame : pickNewer(localGame, remoteGame);
      const tombstone = deletedGames[gameId];
      if (tombstone != null && tombstone > winner.updatedAt) continue;
      if (tombstone != null) delete deletedGames[gameId];
      games[gameId] = clone(winner);
    }
    const orderSource = pickOrderSource(localNode, remoteNode);
    const gameOrder = orderSource.gameOrder.filter((id) => games[id] != null);
    const seen = new Set(gameOrder);
    for (const gameId of Object.keys(games)) {
      if (!seen.has(gameId)) gameOrder.push(gameId);
    }
    return {
      meta,
      games,
      gameOrder,
      orderUpdatedAt: Math.max(localNode.orderUpdatedAt ?? 0, remoteNode.orderUpdatedAt ?? 0),
      deletedGames,
      deletedAt: null
    };
  }
  function mergeDoc(base, local, remote, now) {
    const out = { version: DOC_VERSION, lists: {} };
    const listIds = /* @__PURE__ */ new Set([...Object.keys(local.lists), ...Object.keys(remote.lists)]);
    for (const listId of listIds) {
      out.lists[listId] = mergeList(local.lists[listId], remote.lists[listId]);
    }
    return out;
  }
  function gcTombstones(doc, now, ttl = TOMBSTONE_TTL_MS) {
    const out = { version: DOC_VERSION, lists: {} };
    for (const [listId, node] of Object.entries(doc.lists)) {
      if (node.deletedAt != null && now - node.deletedAt > ttl) continue;
      const copy = clone(node);
      for (const [gameId, deletedAt] of Object.entries(copy.deletedGames)) {
        if (now - deletedAt > ttl) delete copy.deletedGames[gameId];
      }
      out.lists[listId] = copy;
    }
    return out;
  }

  // userscript/src/adopt.mjs
  var clone2 = (value) => JSON.parse(JSON.stringify(value));
  var normalize = (name) => String(name ?? "").trim().toLowerCase();
  function indexByName(doc) {
    const byName = /* @__PURE__ */ new Map();
    for (const [listId, node] of Object.entries(doc.lists)) {
      if (node.deletedAt != null) continue;
      const key = normalize(node.meta?.name);
      if (!byName.has(key)) byName.set(key, []);
      byName.get(key).push(listId);
    }
    return byName;
  }
  function planAdoptions(localDoc, remoteDoc) {
    const remoteByName = indexByName(remoteDoc);
    const localByName = indexByName(localDoc);
    const adoptions = [];
    for (const [key, localIds] of localByName) {
      const remoteIds = remoteByName.get(key);
      if (localIds.length !== 1 || remoteIds == null || remoteIds.length !== 1) continue;
      const localId = localIds[0];
      const remoteId = remoteIds[0];
      if (localId === remoteId) continue;
      if (localDoc.lists[remoteId] != null) continue;
      if (remoteDoc.lists[localId] != null) continue;
      adoptions.push({ localId, remoteId, name: localDoc.lists[localId].meta.name });
    }
    return adoptions;
  }
  function applyAdoptions(localDoc, adoptions) {
    if (adoptions.length === 0) return localDoc;
    const rename = new Map(adoptions.map((a) => [a.localId, a.remoteId]));
    for (const { remoteId } of adoptions) {
      if (localDoc.lists[remoteId] != null && !rename.has(remoteId)) {
        throw new Error(`Collision: remoteId "${remoteId}" already exists in local and is not being renamed`);
      }
    }
    const out = { version: localDoc.version, lists: {} };
    for (const [listId, node] of Object.entries(localDoc.lists)) {
      const newId = rename.get(listId) ?? listId;
      out.lists[newId] = clone2(node);
    }
    return out;
  }
  var SCRIPT_STATE_KEY = "psnpp-scriptstate";
  var ACTIVE_LIST_FIELD = "lastActiveGameList";
  function repointActiveList(storage, adoptions) {
    if (!Array.isArray(adoptions) || adoptions.length === 0) return false;
    try {
      const raw = storage.getItem(SCRIPT_STATE_KEY);
      if (raw == null) return false;
      const state = JSON.parse(raw);
      if (state == null || typeof state !== "object" || Array.isArray(state)) return false;
      const current = state[ACTIVE_LIST_FIELD];
      if (typeof current !== "string" || current === "") return false;
      const renamed = adoptions.find((a) => a.localId === current);
      if (renamed == null) return false;
      state[ACTIVE_LIST_FIELD] = renamed.remoteId;
      storage.setItem(SCRIPT_STATE_KEY, JSON.stringify(state));
      return true;
    } catch {
      return false;
    }
  }
  function reconcileActiveList(storage, idsBefore, idsAfter) {
    try {
      const before = new Set(idsBefore ?? []);
      const after = new Set(idsAfter ?? []);
      const raw = storage.getItem(SCRIPT_STATE_KEY);
      if (raw == null) return null;
      const state = JSON.parse(raw);
      if (state == null || typeof state !== "object" || Array.isArray(state)) return null;
      const current = state[ACTIVE_LIST_FIELD];
      if (typeof current !== "string" || current === "") return null;
      if (after.has(current)) return null;
      if (!before.has(current)) return null;
      const survivor = (idsAfter ?? [])[0] ?? null;
      if (survivor == null) return null;
      state[ACTIVE_LIST_FIELD] = survivor;
      storage.setItem(SCRIPT_STATE_KEY, JSON.stringify(state));
      return { from: current, to: survivor };
    } catch {
      return null;
    }
  }

  // userscript/src/sync-cycle.mjs
  var DEFAULT_MAX_ATTEMPTS = 3;
  function fingerprint(lists) {
    return JSON.stringify([...lists].sort((a, b) => String(a.id).localeCompare(String(b.id))));
  }
  function stableStringify2(value) {
    if (value === null || typeof value !== "object") {
      return JSON.stringify(value);
    }
    if (Array.isArray(value)) {
      return "[" + value.map((v) => v === void 0 ? "null" : stableStringify2(v)).join(",") + "]";
    }
    const entries = Object.keys(value).filter((key) => value[key] !== void 0).sort().map((key) => `"${key}":${stableStringify2(value[key])}`);
    return "{" + entries.join(",") + "}";
  }
  function sameDoc(left, right) {
    return stableStringify2(left) === stableStringify2(right);
  }
  var ZERO_DELTA = {
    listsAdded: 0,
    listsRemoved: 0,
    gamesAdded: 0,
    gamesRemoved: 0,
    listsLinked: 0
  };
  var NAMED_GAME_LIMIT = 20;
  var zeroDelta = () => ({ ...ZERO_DELTA, addedGames: [], removedGames: [] });
  function summarizeDelta(before, after, renames) {
    const gameIds = (list) => new Set((list.games ?? []).map((g) => String(g.id)));
    const titlesById = (list) => new Map(
      (list.games ?? []).map((g) => [String(g.id), typeof g.title === "string" ? g.title : ""])
    );
    const beforeById = new Map(before.map((l) => [renames.get(String(l.id)) ?? String(l.id), l]));
    const afterById = new Map(after.map((l) => [String(l.id), l]));
    const delta = { ...ZERO_DELTA, listsLinked: renames.size, addedGames: [], removedGames: [] };
    const note = (bucket, title, listName) => {
      if (bucket.length >= NAMED_GAME_LIMIT || !title) return;
      bucket.push({ title, list: listName });
    };
    const nameOf = (list) => typeof list.name === "string" && list.name ? list.name : "a list";
    for (const [listId, list] of afterById) {
      const previous = beforeById.get(listId);
      const titles = titlesById(list);
      const listName = nameOf(list);
      if (previous == null) {
        delta.listsAdded += 1;
        delta.gamesAdded += titles.size;
        for (const [, title] of titles) note(delta.addedGames, title, listName);
        continue;
      }
      const had = gameIds(previous);
      const hadTitles = titlesById(previous);
      for (const gameId of titles.keys()) {
        if (had.has(gameId)) continue;
        delta.gamesAdded += 1;
        note(delta.addedGames, titles.get(gameId), listName);
      }
      for (const gameId of had) {
        if (titles.has(gameId)) continue;
        delta.gamesRemoved += 1;
        note(delta.removedGames, hadTitles.get(gameId), listName);
      }
    }
    for (const [listId, list] of beforeById) {
      if (afterById.has(listId)) continue;
      delta.listsRemoved += 1;
      delta.gamesRemoved += gameIds(list).size;
      for (const [, title] of titlesById(list)) note(delta.removedGames, title, nameOf(list));
    }
    return delta;
  }
  function dropLists(doc, ids) {
    if (ids.size === 0) return doc;
    const out = { version: doc.version, lists: {} };
    for (const [listId, node] of Object.entries(doc.lists)) {
      if (!ids.has(listId)) out.lists[listId] = node;
    }
    return out;
  }
  function readSnapshot(storage) {
    const raw = storage.getItem(LISTS_KEY);
    const { syncable, remote } = readSyncable(storage);
    return { raw, syncable, remote, corrupt: looksCorrupt(raw, syncable, remote) };
  }
  function looksCorrupt(raw, syncable, remote) {
    if (raw == null) return false;
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return true;
    }
    if (!Array.isArray(parsed)) return true;
    if (parsed.length !== syncable.length + remote.length) return true;
    return syncable.some((l) => l.id == null) || remote.some((l) => l.id == null);
  }
  async function runSyncCycle({
    storage,
    client,
    loadBase: loadBase2,
    saveBase: saveBase2,
    saveBackup: saveBackup2,
    confirmAdoptions: confirmAdoptions2,
    now = Date.now(),
    maxAttempts = DEFAULT_MAX_ATTEMPTS
  }) {
    const base = await loadBase2() ?? emptyDoc();
    let remote = await client.getState();
    const adoptions = planAdoptions(toDoc(readSyncable(storage).syncable), remote.doc);
    const adopt = adoptions.length > 0 && await confirmAdoptions2(adoptions);
    const renames = new Map(adopt ? adoptions.map((a) => [String(a.localId), String(a.remoteId)]) : []);
    let pushed = false;
    let activeListRepair = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const snapshot = readSnapshot(storage);
      if (snapshot.raw == null && Object.values(base.lists).some((n) => n.deletedAt == null)) {
        return { status: "corrupt", revision: remote.revision, changed: false, delta: zeroDelta() };
      }
      if (snapshot.corrupt) {
        return { status: "corrupt", revision: remote.revision, changed: false, delta: zeroDelta() };
      }
      const frozenIds = new Set(snapshot.remote.map((l) => l.id));
      const workingBase = dropLists(base, frozenIds);
      const rawLocalDoc = toDoc(snapshot.syncable);
      const localDoc = adopt ? applyAdoptions(rawLocalDoc, adoptions) : rawLocalDoc;
      const stamped = stampChanges(workingBase, localDoc, now);
      const merged = gcTombstones(mergeDoc(workingBase, stamped, remote.doc, now), now);
      const mergedLists = fromDoc(dropLists(merged, frozenIds));
      const currentLists = snapshot.syncable;
      const changed = fingerprint(fromDoc(toDoc(currentLists))) !== fingerprint(mergedLists);
      const delta = changed ? summarizeDelta(currentLists, mergedLists, renames) : zeroDelta();
      const localDelta = summarizeDelta(fromDoc(workingBase), currentLists, /* @__PURE__ */ new Map());
      let settledRevision = remote.revision;
      if (!sameDoc(merged, remote.doc)) {
        const result = await client.putState(remote.revision, merged);
        if (!result.ok) {
          remote = { revision: result.revision, doc: result.doc };
          continue;
        }
        settledRevision = result.revision;
        pushed = true;
        remote = { revision: settledRevision, doc: merged };
      }
      if (storage.getItem(LISTS_KEY) !== snapshot.raw) {
        if (pushed && attempt < maxAttempts) continue;
        return { status: "synced", revision: settledRevision, changed: false, delta: zeroDelta() };
      }
      const deletedLocally = localDelta.gamesRemoved > 0 || localDelta.listsRemoved > 0;
      if (changed) {
        const removesLocalContent = delta.gamesRemoved > 0 || delta.listsRemoved > 0;
        await saveBackup2(
          deletedLocally ? fromDoc(workingBase) : currentLists,
          now,
          { force: removesLocalContent || deletedLocally }
        );
        if (storage.getItem(LISTS_KEY) !== snapshot.raw) {
          if (pushed && attempt < maxAttempts) continue;
          return { status: "synced", revision: settledRevision, changed: false, delta: zeroDelta() };
        }
        const idsBefore = currentLists.map((l) => String(l.id));
        writeSyncable(storage, mergedLists);
        if (adopt) repointActiveList(storage, adoptions);
        activeListRepair = reconcileActiveList(
          storage,
          idsBefore,
          mergedLists.map((l) => String(l.id))
        );
      }
      await saveBase2(dropLists(merged, frozenIds));
      return { status: "synced", revision: settledRevision, changed, delta, localDelta, activeListRepair };
    }
    return { status: "conflict", revision: remote.revision, changed: false, delta: zeroDelta() };
  }

  // userscript/src/migrate.mjs
  var OLD_DEFAULT_ENDPOINT = "https://trippixn.com/api/psnp-sync";
  var OLD_PREFIX = "psnpsync.";
  var NEW_PREFIX = "psnppp.";
  var COPIED_SUFFIXES = ["endpoint", "key", "base"];
  var OLD_BACKUP_PREFIX = `${OLD_PREFIX}backup.`;
  var NEW_BACKUP_PREFIX = `${NEW_PREFIX}backup.`;
  var OLD_INDEX_KEY = `${OLD_PREFIX}backups`;
  var NEW_INDEX_KEY = `${NEW_PREFIX}backups`;
  var NEW_ENDPOINT_KEY = `${NEW_PREFIX}endpoint`;
  var read = async (key) => GM.getValue(key, null);
  async function moveKey(oldKey, newKey) {
    const oldValue = await read(oldKey);
    if (oldValue == null) return false;
    if (await read(newKey) == null) await GM.setValue(newKey, oldValue);
    await GM.deleteValue(oldKey);
    return true;
  }
  async function migrateBackups() {
    const oldIndex = await read(OLD_INDEX_KEY);
    if (!Array.isArray(oldIndex)) return 0;
    if (await read(NEW_INDEX_KEY) != null) return 0;
    const newIndex = [];
    const oldBlobKeys = [];
    let moved = 0;
    for (const entry of oldIndex) {
      if (entry == null || typeof entry.id !== "string" || !entry.id.startsWith(OLD_BACKUP_PREFIX)) {
        newIndex.push(entry);
        continue;
      }
      const newId = NEW_BACKUP_PREFIX + entry.id.slice(OLD_BACKUP_PREFIX.length);
      const blob = await read(entry.id);
      if (blob != null) {
        await GM.setValue(newId, blob);
        oldBlobKeys.push(entry.id);
        moved += 1;
      }
      newIndex.push({ ...entry, id: newId });
    }
    await GM.setValue(NEW_INDEX_KEY, newIndex);
    for (const key of oldBlobKeys) await GM.deleteValue(key);
    await GM.deleteValue(OLD_INDEX_KEY);
    return moved;
  }
  async function rewriteDefaultEndpoint() {
    const current = await read(NEW_ENDPOINT_KEY);
    if (current == null) return false;
    if (current !== OLD_DEFAULT_ENDPOINT && current !== `${OLD_DEFAULT_ENDPOINT}/`) return false;
    await GM.setValue(NEW_ENDPOINT_KEY, DEFAULT_ENDPOINT);
    return true;
  }
  async function migrateGmStorage() {
    let keys = 0;
    for (const suffix of COPIED_SUFFIXES) {
      if (await moveKey(OLD_PREFIX + suffix, NEW_PREFIX + suffix)) keys += 1;
    }
    const blobs = await migrateBackups();
    const endpointRewritten = await rewriteDefaultEndpoint();
    const reaped = await reapRetiredKeys();
    return { keys, blobs, endpointRewritten, reaped };
  }
  var RETIRED_KEYS = [
    // The panel's Log tab, removed 2026-08-10. Sync activity goes to the Discord
    // webhook now (treelog.mjs), and keeping a second copy on the device was the
    // duplication the owner asked to end.
    `${NEW_PREFIX}history`
  ];
  async function reapRetiredKeys() {
    let reaped = 0;
    for (const key of RETIRED_KEYS) {
      try {
        if (await GM.getValue(key, null) == null) continue;
        await GM.deleteValue(key);
        reaped += 1;
      } catch (error) {
        console.error(`[psnppp] could not reap the retired key ${key}:`, error);
      }
    }
    return reaped;
  }

  // userscript/src/update-check.mjs
  var THROTTLE_MS = 30 * 60 * 1e3;
  var REQUEST_TIMEOUT_MS2 = 8e3;
  function parseVersion(metaText) {
    if (typeof metaText !== "string") return null;
    const match = metaText.match(/@version\s+(\S+)/);
    if (!match) return null;
    const version = match[1];
    return /^\d+(\.\d+)*$/.test(version) ? version : null;
  }
  function isNewer(latest, current) {
    const segments = (value) => String(value ?? "").split(".").map((part) => {
      const n = Number.parseInt(part, 10);
      return Number.isFinite(n) ? n : 0;
    });
    const a = segments(latest);
    const b = segments(current);
    const length = Math.max(a.length, b.length);
    for (let i = 0; i < length; i += 1) {
      const av = a[i] ?? 0;
      const bv = b[i] ?? 0;
      if (av !== bv) return av > bv;
    }
    return false;
  }
  async function checkForUpdate({
    currentVersion,
    metaUrl,
    request = gmRequest,
    now = Date.now(),
    loadState,
    saveState
  }) {
    let state = null;
    try {
      state = await loadState();
    } catch {
      state = null;
    }
    if (state && typeof state.checkedAt === "number" && now - state.checkedAt < THROTTLE_MS) {
      const cached = state.latest ?? null;
      return { available: cached != null && isNewer(cached, currentVersion), latest: cached };
    }
    let result = { available: false, latest: null };
    try {
      const response = await request({ method: "GET", url: metaUrl, timeout: REQUEST_TIMEOUT_MS2 });
      if (response && response.status === 200) {
        const latest = parseVersion(response.responseText);
        if (latest != null) {
          result = { available: isNewer(latest, currentVersion), latest };
        }
      }
    } catch {
    }
    try {
      await saveState({ checkedAt: now, latest: result.latest });
    } catch {
    }
    return result;
  }

  // userscript/src/compat.mjs
  var SCRIPT_STATE_KEY2 = "psnpp-scriptstate";
  var isIdentity = (value) => typeof value === "string" || typeof value === "number";
  var isPlainObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  function readRaw(storage, key) {
    try {
      const raw = storage?.getItem?.(key);
      return typeof raw === "string" ? raw : null;
    } catch {
      return null;
    }
  }
  function readPsnpPlusVersion(storage) {
    const raw = readRaw(storage, SCRIPT_STATE_KEY2);
    if (raw == null) return null;
    try {
      const state = JSON.parse(raw);
      if (!isPlainObject(state)) return null;
      const version = state.version;
      return typeof version === "string" && version !== "" ? version : null;
    } catch {
      return null;
    }
  }
  var REASONS = {
    "list-id": "a list whose id is no longer a plain value",
    "list-url": "a list whose feed url is no longer plain text",
    "games-not-array": "a list whose games are no longer stored as a list",
    "game-not-object": "a game entry that is no longer a record",
    "game-id": "a game with no usable id",
    "game-updated-at": "a game carrying a new updatedAt field, which PSNP++ uses for its own bookkeeping",
    "list-name": "lists that no longer carry a name"
  };
  var compatible = (version) => ({ ok: true, code: null, reason: null, version });
  var incompatible = (code, version) => ({ ok: false, code, reason: REASONS[code], version });
  var DEFER = Symbol("defer");
  var REMOTE = Symbol("remote");
  function checkList(list) {
    if (list.id == null) return DEFER;
    const url = list.url;
    if (url != null && typeof url !== "string") return "list-url";
    if (isRemoteList(list)) return REMOTE;
    if (!isIdentity(list.id)) return "list-id";
    const games = list.games;
    if (games == null) return null;
    if (!Array.isArray(games)) return "games-not-array";
    for (const game of games) {
      if (!isPlainObject(game)) return "game-not-object";
      if (!isIdentity(game.id)) return "game-id";
      if (Object.hasOwn(game, "updatedAt")) return "game-updated-at";
    }
    return null;
  }
  function checkPsnpPlusCompat(storage) {
    const version = readPsnpPlusVersion(storage);
    try {
      const raw = readRaw(storage, LISTS_KEY);
      if (raw == null) return compatible(version);
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return compatible(version);
      }
      if (!Array.isArray(parsed)) return compatible(version);
      const lists = parsed.filter(isPlainObject);
      let syncable = 0;
      let named = 0;
      for (const list of lists) {
        const verdict = checkList(list);
        if (verdict === DEFER || verdict === REMOTE) continue;
        if (verdict !== null) return incompatible(verdict, version);
        syncable += 1;
        if (Object.hasOwn(list, "name")) named += 1;
      }
      if (syncable > 0 && named === 0) return incompatible("list-name", version);
      return compatible(version);
    } catch (error) {
      console.error("[psnppp] compatibility check failed:", error);
      return compatible(version);
    }
  }
  function describeIncompatibility(result) {
    const version = typeof result?.version === "string" && result.version !== "" ? ` v${result.version}` : "";
    const reason = typeof result?.reason === "string" && result.reason !== "" ? ` \u2014 ${result.reason}` : "";
    return `PSNP+${version} has changed how it saves your lists${reason}. PSNP++ has paused syncing: nothing was uploaded and nothing on this device was changed, so your lists are untouched. Syncing resumes once PSNP++ understands the new format.`;
  }

  // userscript/src/storage-guard.mjs
  var guarded = /* @__PURE__ */ new WeakMap();
  var approximateBytes = (value) => {
    try {
      return String(value ?? "").length;
    } catch {
      return 0;
    }
  };
  function isQuotaError(error) {
    if (error == null) return false;
    const name = typeof error.name === "string" ? error.name : "";
    const code = error.code;
    return name === "QuotaExceededError" || name === "NS_ERROR_DOM_QUOTA_REACHED" || code === 22 || code === 1014;
  }
  function describeStorageFailure({ key, error, bytes }) {
    const where = key ? `"${key}"` : "a value";
    return isQuotaError(error) ? `Browser storage is full \u2014 could not save ${where} (${bytes} bytes). Clearing site data for psnprofiles.com will free it.` : `Could not save ${where} to browser storage: ${error?.message ?? "unknown error"}.`;
  }
  function installStorageGuard(storage, { onFailure = () => {
  } } = {}) {
    if (storage == null) return () => {
    };
    const already = guarded.get(storage);
    if (already) return already;
    const original = {
      setItem: storage.setItem,
      removeItem: storage.removeItem
    };
    const report = (key, error, bytes) => {
      try {
        onFailure({ key, error, bytes });
      } catch (reportError) {
        console.error("[psnppp] the storage reporter itself failed:", reportError);
      }
    };
    const guard = (name, computeBytes) => function guardedWrite(key, value) {
      try {
        return original[name].call(storage, key, value);
      } catch (error) {
        report(key, error, computeBytes(value));
        throw error;
      }
    };
    const wrappedSet = guard("setItem", approximateBytes);
    const wrappedRemove = guard("removeItem", () => 0);
    storage.setItem = wrappedSet;
    storage.removeItem = wrappedRemove;
    const uninstall = () => {
      if (storage.setItem === wrappedSet) storage.setItem = original.setItem;
      if (storage.removeItem === wrappedRemove) storage.removeItem = original.removeItem;
      guarded.delete(storage);
    };
    guarded.set(storage, uninstall);
    return uninstall;
  }

  // userscript/src/main.mjs
  var STARTUP_LOG_KEY = "psnppp.lastStartupLog";
  var STARTUP_LOG_INTERVAL_MS = 6 * 60 * 60 * 1e3;
  var BASE_KEY = "psnppp.base";
  var CHANGE_DEBOUNCE_MS = 3e3;
  var PSNP_PLUS_VERSION_KEY = "psnppp.psnpPlusVersion";
  var UPDATE_META_URL = "https://trippixn.com/psnppp.meta.js";
  var UPDATE_INSTALL_URL = "https://trippixn.com/psnppp.user.js";
  var UPDATE_STATE_KEY = "psnppp.updateCheck";
  var loadUpdateState = () => GM.getValue(UPDATE_STATE_KEY, null);
  var saveUpdateState = (state) => GM.setValue(UPDATE_STATE_KEY, state);
  async function recordPsnpPlusVersion(version) {
    if (typeof version !== "string" || version === "") return;
    try {
      const seen = await GM.getValue(PSNP_PLUS_VERSION_KEY, null);
      if (seen === version) return;
      await GM.setValue(PSNP_PLUS_VERSION_KEY, version);
      if (seen != null) {
        console.info(`[psnppp] PSNP+ changed version: ${seen} -> ${version}`);
      }
    } catch (error) {
      console.error("[psnppp] could not record the PSNP+ version:", error);
    }
  }
  function currentScriptVersion() {
    return typeof GM_info !== "undefined" && GM_info?.script?.version || null;
  }
  var loadBase = async () => {
    const raw = await GM.getValue(BASE_KEY, null);
    if (raw == null) return emptyDoc();
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return emptyDoc();
    }
    if (parsed == null || typeof parsed.lists !== "object" || parsed.lists === null || Array.isArray(parsed.lists)) {
      return emptyDoc();
    }
    return parsed;
  };
  var saveBase = async (doc) => GM.setValue(BASE_KEY, JSON.stringify(doc));
  async function confirmAdoptions(adoptions) {
    const names = adoptions.map((a) => `\u2022 ${a.name}`).join("\n");
    return window.confirm(
      `PSNP++ found lists on the server with the same names as lists on this device:

${names}

Link them so they stay in sync? Choose Cancel to keep them separate.`
    );
  }
  var activePanel = null;
  var PENDING_PANEL = { close() {
  } };
  async function openSettings({ chip = null } = {}) {
    let panel = null;
    let mounted = false;
    try {
      if (activePanel) {
        const open = activePanel;
        activePanel = null;
        open.close();
        return;
      }
      activePanel = PENDING_PANEL;
      const [backups, config, loadError] = await loadPanelData();
      await new Promise((resolve) => {
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          activePanel = null;
          try {
            chip?.setPanelOpen?.(false);
          } catch (error) {
            console.error("[psnppp] could not un-mark the chip:", error);
          }
          resolve();
        };
        panel = createSettingsPanel({
          // Without this the version pill never renders on a real install: the
          // panel defaults it to null and only the tests were passing one.
          version: currentScriptVersion(),
          anchor: chip?.element ?? null,
          side: chip?.getSide?.() ?? "right",
          config,
          backups,
          onSave: async ({ endpoint, key }) => {
            try {
              return await applyConfig({ endpoint, key });
            } catch (error) {
              console.error("[psnppp] could not save settings:", error);
              return { ok: false, message: describeFailure(error, "Could not save your settings") };
            }
          },
          onRestore: async (id) => {
            try {
              const restored = await restoreBackup(id);
              const { syncable: currentLists } = readSyncable(window.localStorage);
              await saveBackup(currentLists, Date.now(), { protect: id });
              writeSyncable(window.localStorage, restored);
              window.location.reload();
              return { ok: true, message: "Backup restored. Reloading." };
            } catch (error) {
              console.error("[psnppp] could not restore a backup:", error);
              return { ok: false, message: describeFailure(error, "Could not restore that backup") };
            }
          },
          onClose: finish
        });
        activePanel = panel;
        chip?.setPanelOpen?.(true);
        document.body.appendChild(panel.element);
        mounted = true;
        if (loadError) panel.showMessage(loadError, { error: true });
      });
    } catch (error) {
      console.error("[psnppp] settings failed:", error);
      if (mounted && panel) {
        panel.showMessage(describeFailure(error, "Settings failed"), { error: true });
        return;
      }
      activePanel = null;
      chip?.setPanelOpen?.(false);
      window.alert(`PSNP++ \u2014 ${describeFailure(error, "settings failed")}`);
    }
  }
  async function loadPanelData() {
    const [backups, config] = await Promise.allSettled([
      listBackups(),
      loadConfig()
    ]);
    const failures = [backups, config].filter((result) => result.status === "rejected").map((result) => describeFailure(result.reason, "Could not read your saved settings"));
    const settings = config.status === "fulfilled" ? config.value : { endpoint: DEFAULT_ENDPOINT, key: "" };
    return [
      backups.status === "fulfilled" ? backups.value : [],
      settings,
      failures[0] ?? ""
    ];
  }
  async function handleSyncNowClick({ loadConfig: loadConfig2, openSettings: openSettings2, sync }) {
    const config = await loadConfig2();
    if (!config.key) {
      await openSettings2();
      return;
    }
    await sync();
  }
  var countOf2 = (n, noun) => `${n} ${noun}${n === 1 ? "" : "s"}`;
  function describeDelta(delta) {
    if (delta == null) return "lists updated";
    const parts = [];
    if (delta.gamesAdded > 0) parts.push(`+${countOf2(delta.gamesAdded, "game")}`);
    if (delta.gamesRemoved > 0) parts.push(`-${countOf2(delta.gamesRemoved, "game")}`);
    if (delta.listsAdded > 0) parts.push(`+${countOf2(delta.listsAdded, "list")}`);
    if (delta.listsRemoved > 0) parts.push(`-${countOf2(delta.listsRemoved, "list")}`);
    if (delta.listsLinked > 0) parts.push(`${countOf2(delta.listsLinked, "list")} linked`);
    return parts.length > 0 ? parts.join(", ") : "lists updated";
  }
  function describeSyncResult(result) {
    if (result.status === "synced") {
      return result.changed ? {
        state: "reload",
        detail: `Revision ${result.revision} \u2014 ${describeDelta(result.delta)} \u2014 reload the page to see your updated lists`
      } : { state: "synced", detail: `Revision ${result.revision}` };
    }
    if (result.status === "corrupt") {
      return {
        state: "conflict",
        detail: "Your PSNP+ list data looks unreadable \u2014 nothing was synced. Right-click to restore a backup."
      };
    }
    return { state: "conflict", detail: "Could not settle \u2014 try again" };
  }
  function createIndicatorPainter(setState) {
    let awaitingReload = false;
    let reloadDetail = "";
    let updateAvailable = false;
    let updateDetail = "";
    let saveFailed = false;
    let storageDetail = "";
    return (state, detail = "") => {
      if (state === "reload") {
        awaitingReload = true;
        reloadDetail = detail;
      }
      if (state === "update") {
        updateAvailable = true;
        updateDetail = detail;
      }
      if (state === "storage") {
        saveFailed = true;
        storageDetail = detail;
      }
      if (saveFailed && state !== "storage") {
        setState("storage", storageDetail);
        return;
      }
      if (awaitingReload && (state === "synced" || state === "syncing" || state === "update")) {
        setState("reload", reloadDetail);
        return;
      }
      if (updateAvailable && (state === "synced" || state === "syncing")) {
        setState("update", updateDetail);
        return;
      }
      setState(state, detail);
    };
  }
  var INSECURE_ENDPOINT_WARNING = "WARNING: this endpoint is not https, so your sync key is sent unencrypted. Right-click the chip and change it on the Sync tab.";
  function decorateDetail(detail, endpoint) {
    const lines = [];
    if (!isAllowedEndpoint(endpoint)) lines.push(INSECURE_ENDPOINT_WARNING);
    if (detail) lines.push(detail);
    return lines.join("\n");
  }
  var gameRows = (named) => (named ?? []).map((g) => ["Game", `${g.title} (${g.list})`]);
  function deltaIsEmpty(d) {
    if (d == null) return true;
    return !(d.gamesAdded || d.gamesRemoved || d.listsAdded || d.listsRemoved || d.listsLinked);
  }
  function shouldLogCycle(result) {
    if (result == null || result.status !== "synced") return false;
    return result.changed === true || !deltaIsEmpty(result.localDelta);
  }
  function logCycle(log, result) {
    const local = result.localDelta ?? {};
    const received = result.delta ?? {};
    log("Sync Completed", [
      ["Revision", result.revision],
      ["You changed", deltaIsEmpty(local) ? "nothing" : describeDelta(local)],
      ["Received", deltaIsEmpty(received) ? "nothing" : describeDelta(received)]
    ], "\u{1F504}");
    if (local.gamesAdded > 0) {
      log("Games Added", [["Count", local.gamesAdded], ...gameRows(local.addedGames)], "\u2795");
    }
    if (local.gamesRemoved > 0) {
      log("Games Removed", [["Count", local.gamesRemoved], ...gameRows(local.removedGames)], "\u2796");
    }
    if (local.listsAdded > 0 || local.listsRemoved > 0) {
      log("Lists Changed", [
        ["Added", local.listsAdded ?? 0],
        ["Removed", local.listsRemoved ?? 0]
      ], "\u{1F4CB}");
    }
    if (result.activeListRepair) {
      log("Active List Repaired", [
        ["Reason", "our write removed the list PSNP+ had bookmarked"],
        ["Was", result.activeListRepair.from],
        ["Now", result.activeListRepair.to]
      ], "\u26A0\uFE0F");
    }
    if (!deltaIsEmpty(received)) {
      log("Received From Another Device", [
        ["Summary", describeDelta(received)],
        ...gameRows(received.addedGames),
        ...gameRows(received.removedGames).map(([, v]) => ["Removed", v])
      ], "\u{1F4E5}");
    }
  }
  async function start() {
    try {
      await migrateGmStorage();
    } catch (error) {
      console.error("[psnppp] GM storage migration failed:", error);
    }
    let indicator;
    const settings = () => openSettings({ chip: indicator });
    indicator = createIndicator({
      onSyncNow: () => {
        void handleSyncNowClick({ loadConfig, openSettings: settings, sync });
      },
      onSettings: async () => {
        await settings();
        void sync();
      },
      // Only ever reached from the `reload` state, i.e. after a cycle that
      // actually wrote to localStorage behind an already-drawn PSNP+ list view.
      // Never automatic — the user asks for it by clicking the chip that says so.
      onReload: () => {
        window.location.reload();
      },
      // A userscript cannot silently self-install — Tampermonkey requires the
      // user's own click on its install page. window.open, not
      // window.location.assign: this never navigates the psnprofiles.com tab
      // itself away, only opens a new one.
      onUpdate: () => {
        window.open(UPDATE_INSTALL_URL, "_blank", "noopener");
      }
    });
    document.body.appendChild(indicator.element);
    indicator.restorePosition().catch((error) => {
      console.error("[psnppp] could not restore the chip position:", error);
    });
    const paint = createIndicatorPainter(indicator.setState);
    installStorageGuard(window.localStorage, {
      onFailure: (failure) => {
        const message = describeStorageFailure(failure);
        console.error(`[psnppp] ${message}`, failure.error);
        try {
          paint("storage", message);
        } catch (error) {
          console.error("[psnppp] could not report the storage failure:", error);
        }
      }
    });
    let treeLog = () => {
    };
    let lastFaultLogged = null;
    let running = false;
    let pending = false;
    let timer = null;
    async function shouldLogStartup() {
      try {
        const last = Number(await GM.getValue(STARTUP_LOG_KEY, 0)) || 0;
        if (Date.now() - last < STARTUP_LOG_INTERVAL_MS) return false;
        await GM.setValue(STARTUP_LOG_KEY, Date.now());
        return true;
      } catch {
        return false;
      }
    }
    async function sync() {
      if (running) {
        pending = true;
        return;
      }
      running = true;
      try {
        const config = await loadConfig();
        treeLog = createTreeLog({ endpoint: config.endpoint, key: config.key });
        if (!config.key) {
          paint("unconfigured", "Click to set up sync (or right-click for settings)");
          return;
        }
        if (await shouldLogStartup()) {
          treeLog("Script Started", [
            ["Version", currentScriptVersion() ?? "unknown"],
            ["PSNP+ Version", readPsnpPlusVersion(window.localStorage) ?? "unknown"],
            ["Endpoint", config.endpoint]
          ], "\u{1F680}");
        }
        const compat = checkPsnpPlusCompat(window.localStorage);
        void recordPsnpPlusVersion(compat.version);
        if (!compat.ok) {
          paint("incompatible", decorateDetail(describeIncompatibility(compat), config.endpoint));
          if (lastFaultLogged !== `halt:${compat.code}`) {
            lastFaultLogged = `halt:${compat.code}`;
            treeLog("Sync Halted", [
              ["Reason", compat.reason ?? compat.code ?? "unknown"],
              ["Code", compat.code ?? "none"],
              ["PSNP+ Version", compat.version ?? "unknown"]
            ], "\u26A0\uFE0F");
          }
          return;
        }
        paint("syncing");
        const client = createSyncClient({ ...config, request: gmRequest });
        const result = await runSyncCycle({
          storage: window.localStorage,
          client,
          loadBase,
          saveBase,
          confirmAdoptions,
          // Daily, not per-write. The two restore paths above still call
          // saveBackup directly and unconditionally: those snapshots exist so a
          // restore can itself be undone, which has nothing to do with how often
          // a routine backup is taken.
          saveBackup: saveDailyBackup,
          now: Date.now()
        });
        const { state, detail } = describeSyncResult(result);
        paint(state, decorateDetail(detail, config.endpoint));
        lastFaultLogged = null;
        if (shouldLogCycle(result)) {
          try {
            logCycle(treeLog, result);
          } catch (error) {
            console.error("[psnppp] could not post the sync log:", error);
          }
        }
      } catch (error) {
        paint("offline", describeFailure(error, "Sync failed"));
        try {
          const reason = String(error && error.message ? error.message : error);
          if (lastFaultLogged !== `fail:${reason}`) {
            lastFaultLogged = `fail:${reason}`;
            treeLog("Sync Failed", [
              ["Error", reason],
              ["Type", error && error.name ? error.name : typeof error]
            ], "\u274C");
          }
        } catch {
        }
      } finally {
        running = false;
        if (pending) {
          pending = false;
          void sync();
        }
      }
    }
    watchLists(window.localStorage, () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        void sync();
      }, CHANGE_DEBOUNCE_MS);
    });
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") void sync();
    });
    async function checkUpdateAndPaint() {
      const currentVersion = currentScriptVersion();
      if (!currentVersion) return;
      try {
        const { available, latest } = await checkForUpdate({
          currentVersion,
          metaUrl: UPDATE_META_URL,
          loadState: loadUpdateState,
          saveState: saveUpdateState
        });
        if (available) {
          paint("update", `Version ${latest} is available`);
          treeLog("Update Available", [
            ["Installed", currentScriptVersion() ?? "unknown"],
            ["Latest", latest]
          ], "\u{1F199}");
        }
      } catch (error) {
        console.error("[psnppp] update check failed:", error);
      }
    }
    void sync().then(() => {
      void checkUpdateAndPaint();
    });
  }
  if (typeof document !== "undefined") {
    const onStartError = (error) => console.error("[psnppp] start() failed:", error);
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        start().catch(onStartError);
      });
    } else {
      start().catch(onStartError);
    }
  }
})();
