// ==UserScript==
// @name         PSNP++
// @namespace    psnppp.trippixn
// @version      1.0.0
// @description  Two-way cross-device sync for PSNP+ game lists
// @author       Trippixn
// @match        https://psnprofiles.com/*
// @run-at       document-start
// @noframes
// @grant        GM_xmlhttpRequest
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.deleteValue
// @connect      trippixn.com
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
  function createSyncClient({ endpoint, key, request = gmRequest, timeoutMs = 15e3 }) {
    const base = String(endpoint).replace(/\/+$/, "");
    const headers = { "X-Sync-Key": key, "Content-Type": "application/json" };
    return {
      async getState() {
        const response = await request({
          method: "GET",
          url: `${base}/state`,
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
          url: `${base}/state`,
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
  async function promptForConfig() {
    const current = await loadConfig();
    const endpoint = window.prompt("PSNP++ \u2014 sync endpoint:", current.endpoint);
    if (endpoint == null) return null;
    const key = window.prompt("PSNP++ \u2014 sync key:", current.key);
    if (key == null) return null;
    const config = { endpoint: endpoint.trim(), key: key.trim() };
    await saveConfig(config);
    return config;
  }

  // userscript/src/backup.mjs
  var INDEX_KEY = "psnppp.backups";
  var MAX_BACKUPS = 5;
  async function saveBackup(lists, now = Date.now()) {
    const index = await GM.getValue(INDEX_KEY, []);
    const id = `psnppp.backup.${now}`;
    await GM.setValue(id, JSON.stringify(lists));
    const next = [{ id, at: now, listCount: lists.length }, ...index];
    const dropped = next.slice(MAX_BACKUPS);
    for (const entry of dropped) await GM.deleteValue(entry.id);
    await GM.setValue(INDEX_KEY, next.slice(0, MAX_BACKUPS));
    return id;
  }
  async function listBackups() {
    return GM.getValue(INDEX_KEY, []);
  }
  async function restoreBackup(id) {
    const raw = await GM.getValue(id, null);
    if (raw == null) throw new Error(`No such backup: ${id}`);
    return JSON.parse(raw);
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

  // userscript/src/indicator.mjs
  var STATES = {
    idle: { label: "Sync", color: "#6c757d" },
    syncing: { label: "Syncing\u2026", color: "#0d6efd" },
    synced: { label: "Synced", color: "#198754" },
    offline: { label: "Offline", color: "#fd7e14" },
    conflict: { label: "Conflict", color: "#dc3545" },
    unconfigured: { label: "Set up sync", color: "#6f42c1" }
  };
  function createIndicator({ onSyncNow, onSettings }) {
    const element = document.createElement("div");
    element.id = "psnppp-indicator";
    element.style.cssText = [
      "position:fixed",
      "right:12px",
      "bottom:12px",
      "z-index:99999",
      "font:12px/1.4 Arial,sans-serif",
      "color:#fff",
      "padding:6px 10px",
      "border-radius:4px",
      "cursor:pointer",
      "user-select:none",
      "box-shadow:0 2px 6px rgba(0,0,0,.35)",
      "opacity:.9"
    ].join(";");
    const label = document.createElement("span");
    element.appendChild(label);
    element.addEventListener("click", () => onSyncNow());
    element.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      onSettings();
    });
    function setState(state, detail = "") {
      const style = STATES[state] ?? STATES.idle;
      element.style.background = style.color;
      label.textContent = style.label;
      element.title = detail ? `PSNP++ \u2014 ${detail}
Click to sync now, right-click for settings.` : "PSNP++ \u2014 click to sync now, right-click for settings.";
    }
    setState("idle");
    return { element, setState };
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

  // userscript/src/sync-cycle.mjs
  var DEFAULT_MAX_ATTEMPTS = 3;
  function fingerprint(lists) {
    return JSON.stringify([...lists].sort((a, b) => String(a.id).localeCompare(String(b.id))));
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
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const snapshot = readSnapshot(storage);
      if (snapshot.raw == null && Object.values(base.lists).some((n) => n.deletedAt == null)) {
        return { status: "corrupt", revision: remote.revision, changed: false };
      }
      if (snapshot.corrupt) {
        return { status: "corrupt", revision: remote.revision, changed: false };
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
      const result = await client.putState(remote.revision, merged);
      if (result.ok) {
        if (storage.getItem(LISTS_KEY) !== snapshot.raw) {
          return { status: "synced", revision: result.revision, changed: false };
        }
        if (changed) {
          await saveBackup2(currentLists);
          if (storage.getItem(LISTS_KEY) !== snapshot.raw) {
            return { status: "synced", revision: result.revision, changed: false };
          }
          writeSyncable(storage, mergedLists);
        }
        await saveBase2(dropLists(merged, frozenIds));
        return { status: "synced", revision: result.revision, changed };
      }
      remote = { revision: result.revision, doc: result.doc };
    }
    return { status: "conflict", revision: remote.revision, changed: false };
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
  var OLD_ENDPOINT_KEY = `${OLD_PREFIX}endpoint`;
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
    return { keys, blobs, endpointRewritten };
  }

  // userscript/src/main.mjs
  var BASE_KEY = "psnppp.base";
  var CHANGE_DEBOUNCE_MS = 3e3;
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
  async function openSettings() {
    try {
      const backups = await listBackups();
      const choice = window.prompt(
        `PSNP++

1 \u2014 Enter endpoint and sync key
2 \u2014 Restore a pre-merge backup (${backups.length} available)

Choose 1 or 2:`,
        "1"
      );
      if (choice === "1") {
        await promptForConfig();
        return;
      }
      if (choice !== "2") return;
      if (backups.length === 0) {
        window.alert("PSNP++ \u2014 no backups yet.");
        return;
      }
      const menu = backups.map((entry, index2) => `${index2 + 1} \u2014 ${new Date(entry.at).toLocaleString()} (${entry.listCount} lists)`).join("\n");
      const picked = window.prompt(`PSNP++ \u2014 restore which backup?

${menu}

Enter a number:`, "1");
      const index = Number(picked) - 1;
      if (!Number.isInteger(index) || index < 0 || index >= backups.length) return;
      const chosen = backups[index];
      const confirmed = window.confirm(
        `PSNP++ \u2014 restore the backup from ${new Date(chosen.at).toLocaleString()} (${chosen.listCount} lists)? This replaces your current lists.`
      );
      if (!confirmed) return;
      const restored = await restoreBackup(chosen.id);
      const { syncable: currentLists } = readSyncable(window.localStorage);
      await saveBackup(currentLists);
      writeSyncable(window.localStorage, restored);
      window.alert("PSNP++ \u2014 backup restored. Reloading.");
      window.location.reload();
    } catch (error) {
      window.alert(`PSNP++ \u2014 settings/restore failed: ${String(error?.message ?? error)}`);
    }
  }
  async function start() {
    try {
      await migrateGmStorage();
    } catch (error) {
      console.error("[psnppp] GM storage migration failed:", error);
    }
    const indicator = createIndicator({
      onSyncNow: () => {
        void sync();
      },
      onSettings: async () => {
        await openSettings();
        void sync();
      }
    });
    document.body.appendChild(indicator.element);
    let running = false;
    let pending = false;
    let timer = null;
    async function sync() {
      if (running) {
        pending = true;
        return;
      }
      running = true;
      try {
        const config = await loadConfig();
        if (!config.key) {
          indicator.setState("unconfigured", "Right-click to enter your sync key");
          return;
        }
        indicator.setState("syncing");
        const client = createSyncClient({ ...config, request: gmRequest });
        const result = await runSyncCycle({
          storage: window.localStorage,
          client,
          loadBase,
          saveBase,
          saveBackup,
          confirmAdoptions,
          now: Date.now()
        });
        if (result.status === "synced") {
          indicator.setState("synced", `Revision ${result.revision}`);
        } else if (result.status === "corrupt") {
          indicator.setState(
            "conflict",
            "Your PSNP+ list data looks unreadable \u2014 nothing was synced. Right-click to restore a backup."
          );
        } else {
          indicator.setState("conflict", "Could not settle \u2014 try again");
        }
      } catch (error) {
        indicator.setState("offline", String(error?.message ?? error));
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
    void sync();
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
