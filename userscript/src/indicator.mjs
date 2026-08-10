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

import { installStyles, INDICATOR_ID, CHIP_FALLBACK_SIZE, EDGE_INSET_PX, DOCK_SNAP_MS }
  from './theme.mjs';

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
  update:       { label: 'Update ready', tier: 'gold',     action: 'update', pops: true },
  // PSNP+ saves its lists in a shape this build does not understand, so the
  // sync cycle never runs at all (see compat.mjs). `sync` stays the action: the
  // check re-runs at the top of every cycle, so a click is the way back the
  // moment PSNP++ is updated — and a click that cannot make things worse is the
  // right thing to leave under a chip that has just refused to touch anything.
  incompatible: { label: 'Sync paused',  tier: 'fault',    action: 'sync',   pops: true },
  // A localStorage write threw — almost always a full quota (see
  // storage-guard.mjs). The page is now showing a change that is NOT in storage,
  // and storage is what the sync cycle reads, so this is the one state that says
  // the data itself is untrustworthy rather than reporting on data we trust.
  // `sync` stays the action: a cycle re-reads storage and re-reports, which is
  // the only useful thing a click can do about a quota this script cannot free.
  storage:      { label: 'Save failed',  tier: 'fault',    action: 'sync',   pops: true }
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

/** How long the resize stream must be quiet before the chip is re-docked. */
export const RESIZE_SETTLE_MS = 120;

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

/** Either dock side, or nothing else — used to sanitise anything read back from storage. */
export function isDockSide(value) {
  return value === 'left' || value === 'right';
}

/**
 * Which side — left or right — a box at `left` (of `width`, in a viewport of
 * `viewWidth`) is nearer to.
 *
 * Distance-based rather than a raw midpoint comparison so it reads the same
 * way clampAxis does, but the two are equivalent: `left < view - left - width`
 * reduces to `left + width/2 < view/2` — the box's own centre against the
 * viewport's. Ties go left, arbitrarily but deterministically.
 */
export function sideFor(left, width, viewWidth) {
  const view = finiteOr(viewWidth, 0);
  const distLeft = Math.max(0, finiteOr(left, 0));
  const distRight = view - distLeft - Math.max(0, finiteOr(width, 0));
  return distRight < distLeft ? 'right' : 'left';
}

/**
 * The `left` that docks a box of `width` flush against `side`, `inset` from
 * the edge.
 *
 * Built entirely out of clampAxis — the same "never off-screen, pin to the
 * reachable corner if the box is too big" guarantee the chip's own drag
 * clamp already relies on — rather than a second copy of its furthest-edge
 * arithmetic. `view` and `-view` are values guaranteed to overshoot each
 * extreme (a viewport cannot be negative), so clampAxis pulls them back to
 * exactly the far or near edge.
 */
export function dockedLeft(side, width, viewWidth, inset = EDGE_INSET_PX) {
  const view = finiteOr(viewWidth, 0);
  return side === 'right'
    ? clampAxis(view, width, view, inset)
    : clampAxis(-view, width, view, inset);
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
  // True only for the CSS transition's duration, right after a drop. See
  // snapToNearestSide — kept in this same composer for the reason documented
  // on paintClasses itself: a second place that rebuilds className is a second
  // place that can erase this the moment anything else repaints the chip.
  let snapping = false;
  // The sheen, tracked like every other class input rather than read back out
  // of `element.className`. Three call sites used to re-derive it with
  // `.includes('psnppp-pop')` — a substring test against a live DOM string,
  // which is both a read of state we already own and a match that any future
  // class merely STARTING with `psnppp-pop` would satisfy.
  let popping = false;

  /**
   * The chip's class list, composed in ONE place.
   *
   * setState and setPanelOpen each used to rebuild `className` from scratch and
   * so erased each other's work: a background sync landing while the panel was
   * open dropped `psnppp-open` and faded the chip to .55 underneath its own
   * panel, and opening the panel wiped a running `psnppp-pop`.
   */
  const paintClasses = (pop = popping) => {
    popping = pop;
    element.className = [
      `psnppp-tier-${current.tier}`,
      popping ? 'psnppp-pop' : '',
      panelOpen ? 'psnppp-open' : '',
      snapping ? 'psnppp-dock-snap' : ''
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
  // The default corner IS the right edge (see theme.mjs's `right: EDGE_INSET_PX`),
  // so this starts 'right' rather than null: getSide() has an honest answer for
  // the panel to open against even before the chip has ever been dragged.
  let dockSide = 'right';

  function apply(next) {
    position = next;
    element.style.left = `${next.left}px`;
    element.style.top = `${next.top}px`;
    // The stylesheet parks the chip with right/bottom, and PSNP+ parks its menu
    // with top/left. Either way both must be released, or the element is
    // anchored on opposing sides and left/top do nothing.
    element.style.right = 'auto';
    element.style.bottom = 'auto';
  }

  const place = (candidate, size = measure()) =>
    apply(clampToViewport(candidate, size, viewport()));

  /**
   * Pin the chip flush against `side`, `top` pixels down, clamped onto screen.
   *
   * The one place `left` is ever computed for a docked chip — restorePosition,
   * handleResize and the post-drop snap all funnel through this, so "docked
   * right" means the same `left` everywhere rather than three independent
   * copies of dockedLeft's call that could drift apart.
   */
  function applyDocked(side, top, size = measure()) {
    dockSide = isDockSide(side) ? side : 'right';
    const view = viewport();
    apply({
      left: dockedLeft(dockSide, finiteOr(size?.width, FALLBACK_SIZE.width), view.width),
      top: clampAxis(top, finiteOr(size?.height, FALLBACK_SIZE.height), view.height, EDGE_MARGIN)
    });
    return position;
  }

  const persist = () => {
    if (position == null) return;
    // The call itself is inside the try: savePosition is injected, so a
    // SYNCHRONOUS throw from it would escape into the pointerup and resize
    // listeners rather than into `.catch`.
    try {
      Promise.resolve(savePosition({ ...position, side: dockSide })).catch(onPositionError);
    } catch (error) {
      onPositionError(error);
    }
  };

  /**
   * Restore the saved position, re-docked.
   *
   * A saved `side` is trusted outright; its absence means a position saved by
   * a build from before docking existed, and the nearest edge to that raw
   * `left` is derived once so the device migrates onto the new scheme instead
   * of sitting at a bespoke, no-longer-supported free position forever.
   *
   * Returned rather than awaited internally so a test can wait for it; start()
   * fires it and forgets, because a chip in its default corner is a perfectly
   * good chip and a storage failure must not cost the user their status widget.
   */
  async function restorePosition() {
    try {
      const stored = await loadPosition();
      if (!isUsablePosition(stored)) return null;
      const size = measure();
      const side = isDockSide(stored.side)
        ? stored.side
        : sideFor(stored.left, finiteOr(size.width, FALLBACK_SIZE.width), viewport().width);
      const corrected = applyDocked(side, stored.top, size);
      // Written back rather than only applied: if the clamp (or the dock
      // itself) moved it, the stored value is a position this device cannot
      // reach as-is, and leaving it there means every future load pays the
      // same correction.
      if (corrected.left !== stored.left || corrected.top !== stored.top || side !== stored.side) {
        persist();
      }
      return corrected;
    } catch (error) {
      onPositionError(error);
      return null;
    }
  }

  /**
   * Re-apply the dock after the window changes size. Only meaningful once
   * placed — an un-dragged chip is still sitting in the CSS corner, which is
   * already responsive on its own.
   *
   * `dockSide` is reused, never recomputed: the whole point is that a chip
   * docked right on a wide monitor is STILL docked right on a narrow one, not
   * whichever edge its old absolute `left` happens to be nearer today.
   */
  function handleResize() {
    if (position == null) return;
    const before = position;
    applyDocked(dockSide, position.top);
    if (position.left !== before.left || position.top !== before.top) persist();
  }

  /**
   * Resize fires in a continuous stream while a window is being dragged by its
   * corner — tens of events a second, each one measuring the chip and
   * writing to its style. Coalesced to one re-dock after the stream settles.
   *
   * A trailing timer rather than a leading one: the useful moment is the size
   * the window ENDS at, not the first size it passed through.
   */
  let resizeTimer = null;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeTimer = null;
      handleResize();
    }, RESIZE_SETTLE_MS);
  };

  globalThis.window?.addEventListener?.('resize', onResize);

  // --- drag ----------------------------------------------------------------

  let drag = null;
  // Read and cleared by the click handler. A drag that ends over the chip fires
  // a click too, and a chip in the `reload` state would reload the page the
  // instant you finished moving it.
  //
  // Cleared again at the START of every gesture. A drag whose pointerup lands
  // somewhere without a click listener leaves the flag armed with nothing to
  // consume it, and it then spends itself on the next real press — one dead
  // click on Sync after moving the chip.
  let suppressClick = false;

  /** DRAG_THRESHOLD_PX below is what separates a click from a drag. */
  const onPointerDown = event => {
    // Left button / touch / pen only. `button` is undefined on synthetic events
    // in the tests, which is treated as the primary button.
    if ((event.button ?? 0) !== 0) return;
    // A new press is a clean slate: whatever the last gesture armed, it did not
    // get consumed, and it must not be spent on this one.
    suppressClick = false;
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
    // Capture is NOT taken here. See takeCapture, below.
  };

  /**
   * Take pointer capture, once the gesture is genuinely a drag.
   *
   * Deliberately not on pointerdown. A captured pointer has its compatibility
   * mouse events retargeted to the CAPTURE TARGET, and `click` is dispatched at
   * the common ancestor of the retargeted mousedown/mouseup — which is a good
   * way to lose a click to an element that has no listener for it. Held off
   * until past DRAG_THRESHOLD_PX, a plain click never involves capture at all
   * and lands where it was aimed; a real drag still gets what capture is for,
   * tracking off the edge of the chip without a listener on the host document,
   * because by then the click is being suppressed anyway.
   *
   * Best-effort: it throws for a pointer id the browser no longer considers
   * active, and that must not abort a drag that is otherwise fine.
   */
  const takeCapture = pointerId => {
    try {
      element.setPointerCapture?.(pointerId);
    } catch { /* capture is an optimisation, not a requirement */ }
  };

  const onPointerMove = event => {
    if (drag == null || (event.pointerId != null && event.pointerId !== drag.pointerId)) return;
    const dx = (event.clientX ?? 0) - drag.originX;
    const dy = (event.clientY ?? 0) - drag.originY;
    if (!drag.moved && Math.abs(dx) < DRAG_THRESHOLD_PX && Math.abs(dy) < DRAG_THRESHOLD_PX) return;
    // The threshold has just been crossed for the first time: this is a drag,
    // not a click, so it is now safe to capture.
    if (!drag.moved) takeCapture(drag.pointerId);
    drag.moved = true;
    place({ left: drag.startLeft + dx, top: drag.startTop + dy }, drag.size);
  };

  // Set by snapToNearestSide, cleared once the transition class has done its
  // job. Held here rather than inside the function so a second drop before the
  // first snap finishes cancels the earlier timer instead of two timers racing
  // to remove a class only one of them still owns.
  let snapTimer = null;

  /**
   * Lock the just-dropped chip onto whichever edge is nearer, keeping the
   * vertical spot it was dropped at.
   *
   * Animated via a CSS class (theme.mjs's `.psnppp-dock-snap`), not a JS
   * tween — the same division of labour the sheen pop already uses: this
   * function only ever toggles the class, and `prefers-reduced-motion` is the
   * stylesheet's decision alone, so there is exactly one place that has to
   * agree with the OS setting instead of a class toggle here and a matching
   * matchMedia check that could drift from it.
   */
  function snapToNearestSide(size) {
    const side = sideFor(position?.left ?? 0,
      finiteOr(size?.width, FALLBACK_SIZE.width), viewport().width);
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

  /**
   * End the gesture. State is cleared BEFORE the capture is released, because
   * releasePointerCapture throws NotFoundError for a pointer the browser has
   * already forgotten — and a throw between the two used to leave `drag` set,
   * so the chip went on following the cursor with no button held down.
   */
  const endDrag = (event, { commit = true } = {}) => {
    if (drag == null || (event?.pointerId != null && event.pointerId !== drag.pointerId)) return;
    const { moved, pointerId, size } = drag;
    drag = null;
    try {
      element.releasePointerCapture?.(pointerId);
    } catch { /* already released, or never captured */ }
    if (!commit || !moved) return;
    suppressClick = true;
    snapToNearestSide(size);
  };

  const onPointerUp = endDrag;
  const onPointerCancel = event => endDrag(event, { commit: false });

  /** Right-click opens the settings. */
  const onContextMenu = event => {
    event.preventDefault?.();
    onSettings();
  };

  // Every listener the chip installs on itself, in one list, so binding and
  // unbinding cannot fall out of step.
  const SURFACE_EVENTS = [
    ['pointerdown', onPointerDown],
    ['pointermove', onPointerMove],
    ['pointerup', onPointerUp],
    ['pointercancel', onPointerCancel],
    ['contextmenu', onContextMenu]
  ];

  const bindDrag = target => {
    for (const [type, handler] of SURFACE_EVENTS) target.addEventListener?.(type, handler);
  };
  const unbindDrag = target => {
    for (const [type, handler] of SURFACE_EVENTS) target.removeEventListener?.(type, handler);
  };

  bindDrag(element);

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
    paintClasses();
  }

  setState('idle');

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
        globalThis.window?.removeEventListener?.('resize', onResize);
        unbindDrag(element);
        clearTimeout(resizeTimer);
        clearTimeout(snapTimer);
      } catch (error) {
        onPositionError(error);
      }
    },
    /** Where the chip is, or null while it still sits in its default corner. */
    getPosition: () => (position == null ? null : { ...position }),
    /**
     * Which edge the chip is docked to — 'left' or 'right', always. Defaults
     * to 'right' before the first drag or restore, matching the CSS corner
     * the chip actually sits in until then, so the panel always has a real
     * side to open away from instead of a third "unknown" case to handle.
     */
    getSide: () => dockSide
  };
}
