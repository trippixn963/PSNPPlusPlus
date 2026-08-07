/**
 * PSNP++ - Status Indicator
 * =========================
 *
 * A small draggable status chip.
 *
 * Deliberately does not splice itself into PSNP+'s DOM: PSNP+ re-renders its
 * list panel freely, and anything injected inside it would be destroyed. A
 * fixed-position element owned entirely by this script survives that.
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */

import { installStyles, INDICATOR_ID, CHIP_FALLBACK_SIZE } from './theme.mjs';

/**
 * `action` is what a LEFT-CLICK does from that state, and it is the whole
 * reason the chip tracks its own state.
 *
 * PSNP+ renders its list view from localStorage at render time and this script
 * writes behind it, so a cycle that changed something leaves the drawn page
 * showing stale lists. Forcing a re-render would mean reaching into PSNP+'s
 * internals, which breaks on their next update — so the reload stays the
 * user's, and the chip that tells them to reload is the thing that does it.
 * Running another sync from there is a guaranteed no-op: the merge already
 * settled, so the second cycle writes nothing and the page stays just as stale.
 *
 * There is deliberately no auto-reload. The user may be mid-scroll or mid-edit,
 * and yanking the page out from under them is worse than the friction.
 *
 * `tier` is the trophy tier the state wears (see theme.mjs). It replaced a raw
 * hex `color` per state, which is what let the chip drift into stock Bootstrap
 * greens and reds. Reading it as a ladder: `locked` is settled and recedes,
 * `bronze` is the entry tier nothing has been earned from yet, `silver` is work
 * in progress, `gold` is an offer worth taking, `platinum` is the completed set
 * waiting to be claimed, `fault` is the one tier that is not a metal at all.
 *
 * `pops` is whether arriving in this state fires the sheen — the signature. It
 * is true for exactly the states that need the user to do something, which is
 * the only reason to spend a flourish. Settled and in-flight states never pop.
 */
const STATES = {
  idle:         { label: 'Sync',         tier: 'locked',   action: 'sync',   pops: false },
  syncing:      { label: 'Syncing',      tier: 'silver',   action: 'sync',   pops: false },
  synced:       { label: 'Synced',       tier: 'locked',   action: 'sync',   pops: false },
  reload:       { label: 'Reload page',  tier: 'platinum', action: 'reload', pops: true },
  offline:      { label: 'Offline',      tier: 'fault',    action: 'sync',   pops: true },
  conflict:     { label: 'Conflict',     tier: 'fault',    action: 'sync',   pops: true },
  unconfigured: { label: 'Set up sync',  tier: 'bronze',   action: 'sync',   pops: true },
  // A userscript cannot silently self-install — that would be a security hole
  // — so this is an offer, not an update. The click opens the install page in
  // a NEW tab (see onUpdate below); it deliberately does not navigate the
  // current psnprofiles.com tab away.
  update:       { label: 'Update ready', tier: 'gold',     action: 'update', pops: true }
};

const CLICK_HINT = {
  sync: 'click to sync now, right-click for settings.',
  reload: 'click to reload the page, right-click for settings.',
  update: 'click to install the update, right-click for settings.'
};

export const POSITION_KEY = 'psnppp.chipPosition';

/** Kept clear of the viewport edges so the chip is always grabbable. */
export const EDGE_MARGIN = 8;

/**
 * Anything below this is a click with a shaky hand, not a drag.
 *
 * Without it, the pointerup at the end of a 1px "drag" would both save a new
 * position and swallow the click — so a plain click on a chip in the `reload`
 * state would silently fail to reload the page, which is the one state where
 * the click is the whole point.
 */
export const DRAG_THRESHOLD_PX = 4;

/** Used only when the element cannot be measured yet (never rendered). */
const FALLBACK_SIZE = CHIP_FALLBACK_SIZE;

const finiteOr = (value, fallback) => (Number.isFinite(value) ? value : fallback);

/**
 * Clamp one axis so a box of `size` stays inside `view`, `margin` from each end.
 *
 * Exported because the panel needs exactly this for its horizontal placement,
 * and a second hand-written copy of the expression is how the two drift.
 *
 * The Math.max against the margin matters when the box is bigger than the
 * viewport: the "furthest allowed" edge would otherwise be a negative number,
 * and clamping to it would push the box off the top-left instead of pinning it
 * to the corner it can still be reached from.
 */
export function clampAxis(value, size, view, margin = EDGE_MARGIN) {
  const furthest = Math.max(margin, finiteOr(view, 0) - Math.max(0, finiteOr(size, 0)) - margin);
  return Math.min(Math.max(finiteOr(value, margin), margin), furthest);
}

/**
 * Force a position inside the viewport.
 *
 * This is the guarantee that the chip can never end up unreachable, and it runs
 * in three places: while dragging, when a saved position is restored, and on
 * every resize. The resize case is the one that actually bites — a position
 * saved at the right-hand edge of a 3440px monitor is several thousand pixels
 * off-screen when the same profile syncs to a laptop, and there is no way to
 * drag back something you cannot see.
 *
 * Pure, and exported, so the arithmetic is pinned without a DOM.
 *
 * Non-finite inputs (a corrupted GM value, a NaN from a missing measurement)
 * collapse to the margin rather than propagating NaN into element.style, which
 * browsers ignore — leaving the chip wherever it happened to be with a saved
 * position that can never be corrected.
 */
export function clampToViewport(position, size, viewport, margin = EDGE_MARGIN) {
  return {
    left: clampAxis(position?.left,
      finiteOr(size?.width, FALLBACK_SIZE.width), viewport?.width, margin),
    top: clampAxis(position?.top,
      finiteOr(size?.height, FALLBACK_SIZE.height), viewport?.height, margin)
  };
}

/** A stored position is only usable if both numbers survived the round trip. */
export function isUsablePosition(position) {
  return position != null
    && typeof position === 'object'
    && Number.isFinite(position.left)
    && Number.isFinite(position.top);
}

const readPosition = async () => {
  const stored = await GM.getValue(POSITION_KEY, null);
  if (typeof stored === 'string') {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return stored;
};

const writePosition = async position => GM.setValue(POSITION_KEY, position);

/**
 * The status chip.
 *
 * `loadPosition` / `savePosition` are injected rather than reached for, so the
 * drag can be exercised in node against a Map the same way backup.mjs is. They
 * default to GM storage, which is per-device by nature — exactly the scope this
 * wants, since "where the chip sits" is a property of the screen it sits on and
 * must never travel with the synced data.
 */
export function createIndicator({
  onSyncNow, onSettings, onReload, onUpdate,
  loadPosition = readPosition,
  savePosition = writePosition,
  onPositionError = error => console.error('[psnppp] chip position:', error)
} = {}) {
  installStyles(document);

  const element = document.createElement('div');
  element.id = INDICATOR_ID;
  element.setAttribute('role', 'button');
  // Reachable by keyboard, but never focused BY us — this is someone else's
  // page and stealing focus from it would be unforgivable in a status widget.
  element.setAttribute('tabindex', '0');

  const rail = document.createElement('span');
  rail.className = 'psnppp-rail';
  rail.setAttribute('aria-hidden', 'true');
  element.appendChild(rail);

  const label = document.createElement('span');
  label.className = 'psnppp-label';
  element.appendChild(label);

  const sheen = document.createElement('span');
  sheen.className = 'psnppp-sheen';
  sheen.setAttribute('aria-hidden', 'true');
  element.appendChild(sheen);

  // The whole STATES entry, not copies of its fields: `action` and `tier` were
  // two hand-maintained caches of the same object, and the click dispatch read
  // one while the class composer read the other.
  //
  // Read at click time, not bound at wire-up time, so a state change is enough
  // to change what the chip does.
  let current = STATES.idle;
  let panelOpen = false;

  /**
   * The chip's class list, composed in ONE place.
   *
   * setState and setPanelOpen each used to rebuild `className` from scratch and
   * so erased each other's work: a background sync landing while the panel was
   * open dropped `psnppp-open` and faded the chip to .55 underneath its own
   * panel, and opening the panel wiped a running `psnppp-pop`.
   */
  const paintClasses = (pop = false) => {
    element.className = [
      `psnppp-tier-${current.tier}`,
      pop ? 'psnppp-pop' : '',
      panelOpen ? 'psnppp-open' : ''
    ].filter(Boolean).join(' ');
  };

  // --- position ------------------------------------------------------------

  const viewport = () => ({
    width: globalThis.window?.innerWidth ?? 0,
    height: globalThis.window?.innerHeight ?? 0
  });

  const rectOf = () => (typeof element.getBoundingClientRect === 'function'
    ? element.getBoundingClientRect()
    : null);

  const measure = () => {
    const rect = rectOf();
    return {
      width: rect?.width || element.offsetWidth || FALLBACK_SIZE.width,
      height: rect?.height || element.offsetHeight || FALLBACK_SIZE.height
    };
  };

  /** null until the chip has been placed by hand; the CSS corner until then. */
  let position = null;

  function apply(next) {
    position = next;
    element.style.left = `${next.left}px`;
    element.style.top = `${next.top}px`;
    // The stylesheet parks the chip with right/bottom. Both have to be released
    // or the element is anchored on all four sides and left/top do nothing.
    element.style.right = 'auto';
    element.style.bottom = 'auto';
  }

  const place = (candidate, size = measure()) =>
    apply(clampToViewport(candidate, size, viewport()));

  const persist = () => {
    if (position == null) return;
    // The call itself is inside the try: savePosition is injected, so a
    // SYNCHRONOUS throw from it would escape into the pointerup and resize
    // listeners rather than into `.catch`.
    try {
      Promise.resolve(savePosition({ ...position })).catch(onPositionError);
    } catch (error) {
      onPositionError(error);
    }
  };

  /**
   * Restore the saved position, clamped.
   *
   * Returned rather than awaited internally so a test can wait for it; start()
   * fires it and forgets, because a chip in its default corner is a perfectly
   * good chip and a storage failure must not cost the user their status widget.
   */
  async function restorePosition() {
    try {
      const stored = await loadPosition();
      if (!isUsablePosition(stored)) return null;
      place(stored);
      // Written back rather than only applied: if the clamp moved it, the
      // stored value is a position this device cannot reach, and leaving it
      // there means every future load pays the same correction.
      const corrected = position;
      if (corrected.left !== stored.left || corrected.top !== stored.top) persist();
      return corrected;
    } catch (error) {
      onPositionError(error);
      return null;
    }
  }

  /** Re-clamp after the window changes size. Only meaningful once placed. */
  function handleResize() {
    if (position == null) return;
    const before = position;
    place(before);
    if (position.left !== before.left || position.top !== before.top) persist();
  }

  globalThis.window?.addEventListener?.('resize', handleResize);

  // --- drag ----------------------------------------------------------------

  let drag = null;
  // Read and cleared by the click handler. A drag that ends over the chip fires
  // a click too, and a chip in the `reload` state would reload the page the
  // instant you finished moving it.
  let suppressClick = false;

  element.addEventListener('pointerdown', event => {
    // Left button / touch / pen only. `button` is undefined on synthetic events
    // in the tests, which is treated as the primary button.
    if ((event.button ?? 0) !== 0) return;
    const size = measure();
    // Never placed by hand: derive the current corner from the live rect so the
    // first drag does not teleport the chip to the top-left.
    const rect = rectOf();
    const start = position
      ?? clampToViewport({ left: rect?.left ?? 0, top: rect?.top ?? 0 }, size, viewport());
    drag = {
      pointerId: event.pointerId,
      originX: event.clientX ?? 0,
      originY: event.clientY ?? 0,
      startLeft: start.left,
      startTop: start.top,
      // Measured once here and reused for the whole gesture. The chip cannot
      // change size while it is being dragged, and re-measuring per move forced
      // a synchronous layout at pointer frequency (120Hz+) on a page we do not
      // own — write, read, write, every single move event.
      size,
      moved: false
    };
    // Capture keeps the whole gesture on this element, so no listener of ours
    // ever lands on the host document — a fast drag off the chip still tracks,
    // and nothing we install can interfere with the page's own pointer handling.
    // Best-effort: it throws for a pointer id the browser no longer considers
    // active, and that must not abort a drag that is otherwise fine.
    try {
      element.setPointerCapture?.(event.pointerId);
    } catch { /* capture is an optimisation, not a requirement */ }
  });

  element.addEventListener('pointermove', event => {
    if (drag == null || (event.pointerId != null && event.pointerId !== drag.pointerId)) return;
    const dx = (event.clientX ?? 0) - drag.originX;
    const dy = (event.clientY ?? 0) - drag.originY;
    if (!drag.moved && Math.abs(dx) < DRAG_THRESHOLD_PX && Math.abs(dy) < DRAG_THRESHOLD_PX) return;
    drag.moved = true;
    place({ left: drag.startLeft + dx, top: drag.startTop + dy }, drag.size);
  });

  /**
   * End the gesture. State is cleared BEFORE the capture is released, because
   * releasePointerCapture throws NotFoundError for a pointer the browser has
   * already forgotten — and a throw between the two used to leave `drag` set,
   * so the chip went on following the cursor with no button held down.
   */
  const endDrag = (event, { commit = true } = {}) => {
    if (drag == null || (event?.pointerId != null && event.pointerId !== drag.pointerId)) return;
    const { moved, pointerId } = drag;
    drag = null;
    try {
      element.releasePointerCapture?.(pointerId);
    } catch { /* already released, or never captured */ }
    if (!commit || !moved) return;
    suppressClick = true;
    persist();
  };

  element.addEventListener('pointerup', endDrag);
  element.addEventListener('pointercancel', event => endDrag(event, { commit: false }));

  // --- clicks --------------------------------------------------------------

  /**
   * What the chip's primary action does right now.
   *
   * One function, called from both the pointer and the keyboard path. Written
   * out twice, a ninth state's action added to one and not the other would be a
   * keyboard-only regression that nothing announces.
   */
  const activate = () => {
    if (current.action === 'reload') onReload();
    else if (current.action === 'update') onUpdate();
    else onSyncNow();
  };

  element.addEventListener('click', () => {
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    activate();
  });

  // Enter/Space on a focused chip do what a click does. The chip announces
  // itself as a button, so it has to behave like one.
  element.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return;
    event.preventDefault?.();
    activate();
  });

  element.addEventListener('contextmenu', event => {
    event.preventDefault();
    onSettings();
  });

  // --- state ---------------------------------------------------------------

  function setState(state, detail = '') {
    // Both arguments are normalised to strings first, so this function is total
    // for ANY input rather than only for strings: Object.hasOwn coerces its key
    // (an object with a throwing toString would throw here), and `detail` goes
    // straight into a template literal (a Symbol would throw there).
    const name = typeof state === 'string' ? state : '';
    const text = typeof detail === 'string' ? detail : '';

    // Own-property lookup, not `STATES[name] ?? STATES.idle`. Every key on
    // Object.prototype ('constructor', 'toString', '__proto__', ...) resolves
    // truthy through the prototype chain, so `??` never fires for them and
    // `style` ends up as a function with no tier/label/action — which made this
    // THROW on `hint[0]`. setState must never throw for any input: it runs
    // inside a page we do not own.
    const style = Object.hasOwn(STATES, name) ? STATES[name] : STATES.idle;

    // The sheen fires on ARRIVAL, not on every repaint. Sync cycles run on
    // every load, focus and edit, and a chip that flashed on each of them
    // would be an ambient tic rather than the one-off it is meant to be.
    const arrived = style.tier !== current.tier;
    const pop = style.pops && arrived;
    current = style;

    if (pop) {
      // Restart the one-shot animation: the class has to leave and return, and
      // the layout read between the two is what makes the browser notice.
      // Confined to the pop, because that read is a forced synchronous layout
      // of the host document and every quiet sync used to pay for it.
      paintClasses(false);
      void element.offsetWidth;
    }
    paintClasses(pop);

    label.textContent = style.label;
    const hint = CLICK_HINT[style.action] ?? CLICK_HINT.sync;
    const title = text
      ? `PSNP++ — ${text}\n${hint[0].toUpperCase()}${hint.slice(1)}`
      : `PSNP++ — ${hint}`;
    element.title = title;
    // Screen readers do not read `title` on a div reliably, and the label alone
    // ("Offline") does not carry the reason the chip is offline.
    element.setAttribute('aria-label', title.replace(/\n/g, ' '));
  }

  /** Lets the panel mark the chip as open so it stops receding underneath it. */
  function setPanelOpen(open) {
    panelOpen = Boolean(open);
    paintClasses(element.className.includes('psnppp-pop'));
  }

  setState('idle');

  return {
    element,
    setState,
    setPanelOpen,
    restorePosition,
    handleResize,
    /** Where the chip is, or null while it still sits in its default corner. */
    getPosition: () => (position == null ? null : { ...position })
  };
}
