import test from 'node:test';
import assert from 'node:assert/strict';
import { createIndicator, clampToViewport, isUsablePosition, isDockSide, sideFor, dockedLeft,
  POSITION_KEY, EDGE_MARGIN, RESIZE_SETTLE_MS } from '../src/indicator.mjs';
import { EDGE_INSET_PX, DOCK_SNAP_MS } from '../src/theme.mjs';
import { installFakeDocument, uninstallFakeDocument, installFakeWindow, uninstallFakeWindow,
  installFakeGM, uninstallFakeGM } from './fake-dom.mjs';

/**
 * The chip is driven through dispatched events rather than by poking at its
 * internals: a drag is a pointerdown/pointermove/pointerup, a click is a click.
 * Every bug this project has shipped was invisible to reading the code.
 */

const spies = () => {
  const calls = { sync: 0, reload: 0, settings: 0, update: 0 };
  return {
    calls,
    handlers: {
      onSyncNow() { calls.sync += 1; },
      onSettings() { calls.settings += 1; },
      onReload() { calls.reload += 1; },
      onUpdate() { calls.update += 1; }
    }
  };
};

/** Wait past the resize debounce, plus a turn for the persist promise. */
const settled = () => new Promise(resolve => setTimeout(resolve, RESIZE_SETTLE_MS + 20));

/** A chip wired to spies, with position storage stubbed out unless overridden. */
function build(extra = {}) {
  const { calls, handlers } = spies();
  const saved = [];
  const indicator = createIndicator({
    ...handlers,
    savePosition: async position => { saved.push(position); },
    loadPosition: async () => null,
    onPositionError: () => {},
    ...extra
  });
  return { calls, indicator, element: indicator.element, saved };
}

// --- setState must never throw ----------------------------------------------

test('createIndicator does not throw on unknown state', () => {
  installFakeDocument();
  try {
    const { indicator } = build();
    assert.doesNotThrow(() => { indicator.setState('some-bogus-state'); });
  } finally {
    uninstallFakeDocument();
  }
});

test('createIndicator does not throw on an Object.prototype key', () => {
  // 'some-bogus-state' is not on the prototype chain, so `STATES[state] ??
  // STATES.idle` catches it and the original no-throw test passed. These do
  // resolve truthy through the chain, so the ?? never fires and `style` is a
  // function with no tier/label/action — which is what made the click-hint
  // lookup throw. Task 9 pinned "setState must never throw" as HARD because
  // this runs inside a page we do not own.
  installFakeDocument();
  try {
    const { indicator } = build();
    for (const state of ['constructor', 'toString', '__proto__', 'hasOwnProperty', 'valueOf']) {
      // BOTH branches. The tooltip only capitalises the click hint when there
      // IS a detail, so `setState(state)` alone takes the other branch.
      assert.doesNotThrow(() => indicator.setState(state), `setState(${state}) must not throw`);
      assert.doesNotThrow(() => indicator.setState(state, 'Revision 7'),
        `setState(${state}, detail) must not throw`);
    }
  } finally {
    uninstallFakeDocument();
  }
});

test('an Object.prototype key falls back to idle and still clicks as a sync', () => {
  installFakeDocument();
  try {
    const { calls, indicator, element } = build();
    indicator.setState('constructor');
    element.dispatch('click');
    assert.equal(calls.sync, 1, 'the idle fallback syncs');
    assert.equal(calls.reload, 0);
    assert.match(element.title, /click to sync/i);
    assert.match(element.className, /psnppp-tier-locked/);
  } finally {
    uninstallFakeDocument();
  }
});

test('createIndicator does not throw on valid state', () => {
  installFakeDocument();
  try {
    const { indicator } = build();
    assert.doesNotThrow(() => { indicator.setState('synced'); });
  } finally {
    uninstallFakeDocument();
  }
});

// --- the `reload` state has to be actionable --------------------------------

test('a click in the reload state reloads the page instead of syncing again', () => {
  installFakeDocument();
  try {
    const { calls, indicator, element } = build();
    indicator.setState('reload', 'Revision 7');
    element.dispatch('click');
    assert.equal(calls.reload, 1, 'the click must reload');
    assert.equal(calls.sync, 0, 'and must NOT run another sync');
  } finally {
    uninstallFakeDocument();
  }
});

test('the reload state says clicking reloads, not that it syncs', () => {
  installFakeDocument();
  try {
    const { indicator, element } = build();
    indicator.setState('reload', 'Revision 7');
    assert.match(element.title, /click to reload/i);
    assert.doesNotMatch(element.title, /click to sync/i);
  } finally {
    uninstallFakeDocument();
  }
});

test('a click in every other state still syncs and never reloads', () => {
  for (const state of ['idle', 'syncing', 'synced', 'offline', 'conflict', 'unconfigured']) {
    installFakeDocument();
    try {
      const { calls, indicator, element } = build();
      indicator.setState(state);
      element.dispatch('click');
      assert.equal(calls.sync, 1, `${state} must still sync`);
      assert.equal(calls.reload, 0, `${state} must not reload`);
      assert.match(element.title, /click to sync/i, `${state} tooltip`);
    } finally {
      uninstallFakeDocument();
    }
  }
});

test('leaving the reload state makes a click sync again', () => {
  installFakeDocument();
  try {
    const { calls, indicator, element } = build();
    indicator.setState('reload', 'Revision 7');
    indicator.setState('synced', 'Revision 8');
    element.dispatch('click');
    assert.equal(calls.sync, 1);
    assert.equal(calls.reload, 0);
  } finally {
    uninstallFakeDocument();
  }
});

// --- the `update` state opens the install page, not another sync ------------

test('a click in the update state calls onUpdate instead of syncing', () => {
  installFakeDocument();
  try {
    const { calls, indicator, element } = build();
    indicator.setState('update', '1.10.0 is available');
    element.dispatch('click');
    assert.equal(calls.update, 1, 'the click must offer the update');
    assert.equal(calls.sync, 0);
    assert.equal(calls.reload, 0);
  } finally {
    uninstallFakeDocument();
  }
});

test('the update state says clicking installs, not that it syncs or reloads', () => {
  installFakeDocument();
  try {
    const { indicator, element } = build();
    indicator.setState('update', '1.10.0 is available');
    assert.match(element.title, /click to install/i);
    assert.doesNotMatch(element.title, /click to sync/i);
    assert.doesNotMatch(element.title, /click to reload/i);
  } finally {
    uninstallFakeDocument();
  }
});

test('right-click still opens settings from the update state', () => {
  installFakeDocument();
  try {
    const { calls, indicator, element } = build();
    indicator.setState('update', '1.10.0 is available');
    let prevented = false;
    element.dispatch('contextmenu', { preventDefault() { prevented = true; } });
    assert.equal(calls.settings, 1);
    assert.equal(calls.update, 0);
    assert.ok(prevented);
  } finally {
    uninstallFakeDocument();
  }
});

test('right-click still opens settings from the reload state', () => {
  installFakeDocument();
  try {
    const { calls, indicator, element } = build();
    indicator.setState('reload', 'Revision 7');
    let prevented = false;
    element.dispatch('contextmenu', { preventDefault() { prevented = true; } });
    assert.equal(calls.settings, 1);
    assert.equal(calls.reload, 0);
    assert.ok(prevented);
  } finally {
    uninstallFakeDocument();
  }
});

// --- the trophy tiers --------------------------------------------------------
//
// The states are a tier ladder, not eight arbitrary colours. Settled states
// wear no metal at all (`locked`) so they recede; the states that need the user
// wear one; errors wear `fault`, which is the only tier that is not a metal.

test('settled states are unlit and states that need the user are not', () => {
  installFakeDocument();
  try {
    const { indicator, element } = build();
    const tierOf = state => {
      indicator.setState(state, 'detail');
      return (/psnppp-tier-(\w+)/.exec(element.className) ?? [])[1];
    };

    assert.equal(tierOf('idle'), 'locked');
    assert.equal(tierOf('synced'), 'locked');
    assert.equal(tierOf('syncing'), 'silver');
    assert.equal(tierOf('unconfigured'), 'bronze');
    assert.equal(tierOf('update'), 'gold');
    assert.equal(tierOf('reload'), 'platinum');
    assert.equal(tierOf('offline'), 'fault');
    assert.equal(tierOf('conflict'), 'fault');
    // A paused sync is a fault the user has to know about, not a settled state
    // that may recede — PSNP+ changed its format and nothing is syncing.
    assert.equal(tierOf('incompatible'), 'fault');
  } finally {
    uninstallFakeDocument();
  }
});

test('the sheen fires on arrival at a state that needs the user, and not on a repaint', () => {
  installFakeDocument();
  try {
    const { indicator, element } = build();
    const popped = () => element.className.includes('psnppp-pop');

    indicator.setState('synced', 'Revision 7');
    assert.equal(popped(), false, 'a settled state never pops');

    indicator.setState('reload', 'Revision 8');
    assert.equal(popped(), true, 'arriving at reload pops once');

    indicator.setState('reload', 'Revision 9');
    assert.equal(popped(), false, 'a repaint of the same tier does not pop again');

    indicator.setState('syncing');
    assert.equal(popped(), false, 'an in-flight state never pops');
  } finally {
    uninstallFakeDocument();
  }
});

test('a background sync cannot fade the chip out from under an open panel', () => {
  // setState and setPanelOpen each used to rebuild className from scratch, so
  // whichever ran last erased the other: a visibilitychange sync landing while
  // the settings panel was open dropped `psnppp-open` and the chip receded to
  // .55 opacity underneath its own panel.
  installFakeDocument();
  try {
    const { indicator, element } = build();
    indicator.setPanelOpen(true);
    assert.match(element.className, /psnppp-open/);

    indicator.setState('syncing');
    assert.match(element.className, /psnppp-open/, 'the panel is still open');
    assert.match(element.className, /psnppp-tier-silver/);

    indicator.setPanelOpen(false);
    assert.doesNotMatch(element.className, /psnppp-open/);
    assert.match(element.className, /psnppp-tier-silver/, 'and the tier survives closing');
  } finally {
    uninstallFakeDocument();
  }
});

test('opening the panel does not cancel a sheen that is still running', () => {
  installFakeDocument();
  try {
    const { indicator, element } = build();
    indicator.setState('conflict', 'Could not settle');
    assert.match(element.className, /psnppp-pop/);
    indicator.setPanelOpen(true);
    assert.match(element.className, /psnppp-pop/);
    assert.match(element.className, /psnppp-open/);
  } finally {
    uninstallFakeDocument();
  }
});

test('setState is total for non-string arguments too', () => {
  // The last bug here was 'constructor' — an input nobody passed either.
  // Object.hasOwn coerces its key, and `detail` goes into a template literal,
  // so both are normalised before use.
  installFakeDocument();
  try {
    const { indicator, element } = build();
    const hostile = { toString() { throw new Error('nope'); } };
    const cases = [
      ['an object with a throwing toString', hostile, 'x'],
      ['a null-prototype object', Object.create(null), 'x'],
      ['a Symbol detail', 'idle', Symbol('s')],
      ['null', null, null],
      ['a number', 42, 7],
      ['undefined', undefined, undefined]
    ];
    for (const [what, state, detail] of cases) {
      assert.doesNotThrow(() => indicator.setState(state, detail), `${what} must not throw`);
    }
    assert.match(element.className, /psnppp-tier-locked/, 'and it lands on the idle fallback');
  } finally {
    uninstallFakeDocument();
  }
});

test('the detail reaches assistive tech, not only the mouse-only title', () => {
  installFakeDocument();
  try {
    const { indicator, element } = build();
    indicator.setState('conflict', 'Could not settle');
    assert.match(element.getAttribute('aria-label'), /Could not settle/);
    assert.equal(element.getAttribute('role'), 'button');
    assert.equal(element.getAttribute('tabindex'), '0');
  } finally {
    uninstallFakeDocument();
  }
});

test('Enter and Space do what a click does on a focused chip', () => {
  for (const key of ['Enter', ' ']) {
    installFakeDocument();
    try {
      const { calls, indicator, element } = build();
      indicator.setState('reload', 'Revision 7');
      element.dispatch('keydown', { key, preventDefault() {} });
      assert.equal(calls.reload, 1, `${key} must reload from the reload state`);
    } finally {
      uninstallFakeDocument();
    }
  }
});

// --- clamping: the chip must never end up unreachable -----------------------

test('clampToViewport keeps a position that is already on screen', () => {
  const result = clampToViewport({ left: 400, top: 300 }, { width: 120, height: 26 },
    { width: 1280, height: 800 });
  assert.deepEqual(result, { left: 400, top: 300 });
});

test('clampToViewport pulls a position past the right or bottom edge back in', () => {
  const size = { width: 120, height: 26 };
  const view = { width: 1280, height: 800 };
  assert.deepEqual(clampToViewport({ left: 5000, top: 5000 }, size, view),
    { left: 1280 - 120 - EDGE_MARGIN, top: 800 - 26 - EDGE_MARGIN });
  assert.deepEqual(clampToViewport({ left: -900, top: -40 }, size, view),
    { left: EDGE_MARGIN, top: EDGE_MARGIN });
});

test('clampToViewport pins to the reachable corner when the chip is wider than the viewport', () => {
  // Not a hypothetical: the panel is 300px and a phone in portrait is 320.
  // Clamping to a NEGATIVE "furthest allowed" edge would push the chip off the
  // top-left — off screen in the other direction, which is the same bug.
  const result = clampToViewport({ left: 200, top: 200 }, { width: 400, height: 500 },
    { width: 320, height: 480 });
  assert.deepEqual(result, { left: EDGE_MARGIN, top: EDGE_MARGIN });
});

test('clampToViewport never emits NaN from a corrupted stored value', () => {
  // A NaN reaching element.style.left is silently ignored by the browser: the
  // chip stays where it was AND the bad value stays stored, so every reload
  // repeats the failure with no way for the user to correct it.
  for (const bad of [{ left: NaN, top: 10 }, { left: 'x', top: null }, null, undefined, {}]) {
    const result = clampToViewport(bad, { width: 120, height: 26 }, { width: 1280, height: 800 });
    assert.ok(Number.isFinite(result.left) && Number.isFinite(result.top),
      `${JSON.stringify(bad)} produced ${JSON.stringify(result)}`);
  }
});

test('isUsablePosition accepts only a pair of finite numbers', () => {
  assert.equal(isUsablePosition({ left: 1, top: 2 }), true);
  for (const bad of [null, undefined, {}, { left: 1 }, { left: NaN, top: 2 },
    { left: '1', top: '2' }, 'nope', 42]) {
    assert.equal(isUsablePosition(bad), false, JSON.stringify(bad));
  }
});

// --- which edge, and where it lands there ------------------------------------

test('isDockSide accepts only "left" or "right"', () => {
  assert.equal(isDockSide('left'), true);
  assert.equal(isDockSide('right'), true);
  for (const bad of [null, undefined, '', 'Left', 'top', 0, {}]) {
    assert.equal(isDockSide(bad), false, JSON.stringify(bad));
  }
});

test('sideFor picks the nearer edge, and breaks an exact tie toward the left', () => {
  const width = 120;
  const view = 1280;
  assert.equal(sideFor(0, width, view), 'left', 'flush left');
  assert.equal(sideFor(view - width, width, view), 'right', 'flush right');
  assert.equal(sideFor(100, width, view), 'left', 'well left of centre');
  assert.equal(sideFor(1000, width, view), 'right', 'well right of centre');
  // Centre: distance to each edge is identical (580 either way).
  assert.equal(sideFor((view - width) / 2, width, view), 'left', 'exact tie goes left');
});

test('sideFor never throws on non-finite input and still returns a real side', () => {
  for (const bad of [NaN, undefined, null, -Infinity, Infinity]) {
    const side = sideFor(bad, 120, 1280);
    assert.ok(side === 'left' || side === 'right', `sideFor(${bad}) => ${side}`);
  }
});

test('dockedLeft sits the box flush against its side, EDGE_INSET_PX from the edge', () => {
  assert.equal(dockedLeft('left', 120, 1280), EDGE_INSET_PX);
  assert.equal(dockedLeft('right', 120, 1280), 1280 - 120 - EDGE_INSET_PX);
});

test('dockedLeft pins to the reachable corner when the box is wider than the viewport', () => {
  // The same guarantee clampToViewport already gives the chip during a drag:
  // a negative "furthest" edge must not push the box off in the OTHER
  // direction. Mirrors indicator.test.mjs's existing clampToViewport case.
  assert.equal(dockedLeft('right', 400, 320), EDGE_INSET_PX);
  assert.equal(dockedLeft('left', 400, 320), EDGE_INSET_PX);
});

// --- dragging ----------------------------------------------------------------

/** Put the chip somewhere measurable, the way a laid-out browser would. */
const layout = (element, { left, top, width = 120, height = 26 }) => {
  element.rect = { left, top, width, height, right: left + width, bottom: top + height };
};

const drag = (element, from, to, pointerId = 1) => {
  element.dispatch('pointerdown', { pointerId, button: 0, clientX: from.x, clientY: from.y });
  element.dispatch('pointermove', { pointerId, clientX: to.x, clientY: to.y });
  element.dispatch('pointerup', { pointerId, clientX: to.x, clientY: to.y });
};

test('getSide defaults to right, matching the CSS corner the chip starts in', () => {
  // theme.mjs parks the un-dragged chip at bottom-RIGHT. The panel needs a
  // real side to open away from before the user has ever touched the chip,
  // and it has to agree with where the chip actually is.
  installFakeDocument();
  try {
    const { indicator } = build();
    assert.equal(indicator.getSide(), 'right');
    assert.equal(indicator.getPosition(), null, 'and it has not been placed by hand yet');
  } finally {
    uninstallFakeDocument();
  }
});

test('a drag tracks the pointer 1:1 while it is happening', () => {
  // Before release, there is no docking yet — the chip has to follow the
  // cursor exactly, or dragging would feel laggy or teleport-y.
  installFakeDocument();
  installFakeWindow({ width: 1280, height: 800 });
  try {
    const { indicator, element } = build();
    layout(element, { left: 1148, top: 762 });

    element.dispatch('pointerdown', { pointerId: 1, button: 0, clientX: 1200, clientY: 770 });
    element.dispatch('pointermove', { pointerId: 1, clientX: 900, clientY: 400 });

    assert.deepEqual(indicator.getPosition(), { left: 848, top: 392 });
    assert.equal(element.style.left, '848px');
    assert.equal(element.style.top, '392px');
    // Both corner anchors have to be released or left/top do nothing at all.
    assert.equal(element.style.right, 'auto');
    assert.equal(element.style.bottom, 'auto');
  } finally {
    uninstallFakeWindow();
    uninstallFakeDocument();
  }
});

test('releasing the drag snaps the chip to the nearer edge and remembers it', async () => {
  installFakeDocument();
  const fake = installFakeWindow({ width: 1280, height: 800 });
  try {
    const { indicator, element, saved } = build();
    layout(element, { left: 1148, top: 762 });

    // Dropped at x=848 in a 1280-wide viewport: 312px from the right edge,
    // 848px from the left — nearer the right, so it docks there. The vertical
    // spot (392) is exactly where it was dropped, not re-derived.
    drag(element, { x: 1200, y: 770 }, { x: 900, y: 400 });

    const docked = { left: 1280 - 120 - EDGE_INSET_PX, top: 392 };
    assert.deepEqual(indicator.getPosition(), docked);
    assert.equal(element.style.left, `${docked.left}px`);
    assert.equal(element.style.top, '392px');
    assert.equal(element.style.right, 'auto');
    assert.equal(element.style.bottom, 'auto');

    await Promise.resolve();
    assert.deepEqual(saved.at(-1), { ...docked, side: 'right' });
    assert.equal(fake.alerts.length, 0);
  } finally {
    uninstallFakeWindow();
    uninstallFakeDocument();
  }
});

// --- which edge a drop lands on ----------------------------------------------

test('a chip dropped left of centre docks to the left edge', async () => {
  installFakeDocument();
  installFakeWindow({ width: 1280, height: 800 });
  try {
    const { indicator, saved, element } = build();
    layout(element, { left: 600, top: 300 });

    // Dropped at x=100: well left of the 1280-wide viewport's centre.
    drag(element, { x: 640, y: 310 }, { x: 100, y: 310 });

    assert.deepEqual(indicator.getPosition(), { left: EDGE_INSET_PX, top: 300 });
    await Promise.resolve();
    assert.equal(saved.at(-1).side, 'left');
  } finally {
    uninstallFakeWindow();
    uninstallFakeDocument();
  }
});

test('a chip dropped right of centre docks to the right edge', async () => {
  installFakeDocument();
  installFakeWindow({ width: 1280, height: 800 });
  try {
    const { indicator, saved, element } = build();
    layout(element, { left: 600, top: 300 });

    // Dropped at x=1000: well right of centre.
    drag(element, { x: 640, y: 310 }, { x: 1000, y: 310 });

    assert.deepEqual(indicator.getPosition(), { left: 1280 - 120 - EDGE_INSET_PX, top: 300 });
    await Promise.resolve();
    assert.equal(saved.at(-1).side, 'right');
  } finally {
    uninstallFakeWindow();
    uninstallFakeDocument();
  }
});

// --- the snap is animated, unless the OS says not to ------------------------

test('a snap adds the transition class and lifts it again once it is done', async () => {
  // No matchMedia check anywhere in this file, deliberately: prefers-reduced-
  // motion is the stylesheet's call alone (see theme.mjs), the same division
  // already used for the sheen pop. This only proves the class toggles.
  installFakeDocument();
  installFakeWindow({ width: 1280, height: 800 });
  try {
    const { element } = build();
    layout(element, { left: 600, top: 300 });

    element.dispatch('pointerdown', { pointerId: 1, button: 0, clientX: 640, clientY: 310 });
    element.dispatch('pointermove', { pointerId: 1, clientX: 100, clientY: 310 });
    element.dispatch('pointerup', { pointerId: 1, clientX: 100, clientY: 310 });

    assert.match(element.className, /psnppp-dock-snap/, 'the snap class is on immediately');

    await new Promise(resolve => setTimeout(resolve, DOCK_SNAP_MS + 20));
    assert.doesNotMatch(element.className, /psnppp-dock-snap/,
      'and lifted again once the transition has had time to finish');
  } finally {
    uninstallFakeWindow();
    uninstallFakeDocument();
  }
});

test('a drag does not fire the click action', () => {
  installFakeDocument();
  installFakeWindow();
  try {
    const { calls, indicator, element } = build();
    indicator.setState('reload', 'Revision 7');
    layout(element, { left: 1148, top: 762 });

    drag(element, { x: 1200, y: 770 }, { x: 600, y: 300 });
    // The browser fires a click after a pointerup that ends over the element.
    element.dispatch('click');

    assert.equal(calls.reload, 0, 'moving the chip must not reload the page');
    assert.equal(calls.sync, 0);

    // ...and the very next real click still works.
    element.dispatch('click');
    assert.equal(calls.reload, 1);
  } finally {
    uninstallFakeWindow();
    uninstallFakeDocument();
  }
});

test('a shaky click under the drag threshold is still a click', () => {
  installFakeDocument();
  installFakeWindow();
  try {
    const { calls, element, saved } = build();
    layout(element, { left: 1148, top: 762 });

    drag(element, { x: 1200, y: 770 }, { x: 1202, y: 771 });
    element.dispatch('click');

    assert.equal(calls.sync, 1, 'a 2px wobble must not eat the click');
    assert.deepEqual(saved, [], 'and must not save a position');
  } finally {
    uninstallFakeWindow();
    uninstallFakeDocument();
  }
});

test('a drag is clamped while it happens, not only when it is saved', () => {
  installFakeDocument();
  installFakeWindow({ width: 1280, height: 800 });
  try {
    const { indicator, element } = build();
    layout(element, { left: 600, top: 400 });

    // Not the shared drag() helper: this needs to inspect the position BEFORE
    // release, while the pointer is still held past both edges.
    element.dispatch('pointerdown', { pointerId: 1, button: 0, clientX: 640, clientY: 410 });
    element.dispatch('pointermove', { pointerId: 1, clientX: 9000, clientY: 9000 });

    assert.deepEqual(indicator.getPosition(),
      { left: 1280 - 120 - EDGE_MARGIN, top: 800 - 26 - EDGE_MARGIN },
      'clamped mid-drag, using the drag margin');

    element.dispatch('pointerup', { pointerId: 1, clientX: 9000, clientY: 9000 });

    // On release it snaps to the dock inset instead — a different, slightly
    // larger number from the drag-time clamp margin, reused from theme.mjs
    // rather than invented for this feature.
    assert.deepEqual(indicator.getPosition(),
      { left: 1280 - 120 - EDGE_INSET_PX, top: 800 - 26 - EDGE_MARGIN },
      'docked on release, using the edge inset');
  } finally {
    uninstallFakeWindow();
    uninstallFakeDocument();
  }
});

// --- restoring, and the laptop problem --------------------------------------

test('a saved position with a docked side is restored on that side', async () => {
  installFakeDocument();
  installFakeWindow({ width: 1280, height: 800 });
  try {
    const { indicator, element, saved } = build({
      loadPosition: async () => ({ left: 1280 - 120 - EDGE_INSET_PX, top: 200, side: 'right' })
    });
    layout(element, { left: 0, top: 0 });

    const restored = await indicator.restorePosition();

    assert.deepEqual(restored, { left: 1280 - 120 - EDGE_INSET_PX, top: 200 });
    assert.deepEqual(indicator.getPosition(), restored);
    assert.equal(indicator.getSide(), 'right');
    assert.equal(element.style.left, `${restored.left}px`);
    // Already exactly where the dock puts it, so nothing needed re-saving.
    assert.deepEqual(saved, []);
  } finally {
    uninstallFakeWindow();
    uninstallFakeDocument();
  }
});

test('a position saved by an older build with no side migrates onto the nearest edge', async () => {
  // Pre-docking builds only ever stored {left, top}. The first restore under
  // this build has to pick a side for it rather than leaving it at a free
  // position the new scheme no longer supports.
  installFakeDocument();
  installFakeWindow({ width: 1280, height: 800 });
  try {
    const { indicator, element, saved } = build({ loadPosition: async () => ({ left: 300, top: 200 }) });
    layout(element, { left: 0, top: 0 });

    const restored = await indicator.restorePosition();

    // 300 is nearer the left edge of a 1280-wide viewport than the right.
    assert.deepEqual(restored, { left: EDGE_INSET_PX, top: 200 });
    assert.equal(indicator.getSide(), 'left');
    assert.equal(element.style.left, `${EDGE_INSET_PX}px`);
    // The migrated side is written back so every future load skips this.
    await Promise.resolve();
    assert.deepEqual(saved.at(-1), { left: EDGE_INSET_PX, top: 200, side: 'left' });
  } finally {
    uninstallFakeWindow();
    uninstallFakeDocument();
  }
});

test('a position saved on a wide monitor is clamped back into a laptop viewport', async () => {
  // The failure this exists to prevent: GM storage is per device, but a profile
  // that syncs (or a monitor that is unplugged) leaves a stored position
  // thousands of pixels off-screen — and you cannot drag back something you
  // cannot see.
  installFakeDocument();
  installFakeWindow({ width: 1280, height: 800 });
  try {
    const { indicator, element, saved } = build({
      loadPosition: async () => ({ left: 3300, top: 1380, side: 'right' })
    });
    layout(element, { left: 0, top: 0 });

    const restored = await indicator.restorePosition();

    assert.deepEqual(restored, { left: 1280 - 120 - EDGE_INSET_PX, top: 800 - 26 - EDGE_MARGIN });
    assert.deepEqual(indicator.getPosition(), restored);
    assert.equal(indicator.getSide(), 'right');
    await Promise.resolve();
    // The correction is written back: leaving the unreachable value stored
    // means paying the same correction on every single load, forever.
    assert.deepEqual(saved.at(-1), { ...restored, side: 'right' });
  } finally {
    uninstallFakeWindow();
    uninstallFakeDocument();
  }
});

test('a resize to a narrower viewport keeps a right-docked chip docked right and fully visible',
  async () => {
    installFakeDocument();
    const fake = installFakeWindow({ width: 1920, height: 1080 });
    try {
      const { indicator, element, saved } = build();
      layout(element, { left: 1700, top: 1000 });
      // Dropped near the right edge of a 1920-wide viewport — docks right.
      drag(element, { x: 1750, y: 1010 }, { x: 1800, y: 1040 });
      assert.equal(indicator.getSide(), 'right');
      assert.deepEqual(indicator.getPosition(), { left: 1920 - 120 - EDGE_INSET_PX, top: 1030 });

      fake.resize(1024, 640);
      // The re-dock is debounced now: a window dragged by its corner fires a
      // continuous stream of resize events, and each one measured and wrote to
      // the surface. Waiting for the stream to settle is part of the behaviour.
      await settled();

      // STILL docked right — not re-derived from the old absolute left, which
      // on a 1024-wide screen would be nowhere near the right edge any more.
      assert.equal(indicator.getSide(), 'right');
      const after = indicator.getPosition();
      assert.deepEqual(after, { left: 1024 - 120 - EDGE_INSET_PX, top: 640 - 26 - EDGE_MARGIN });
      // Fully on screen: both edges of the chip are within the new viewport.
      assert.ok(after.left >= 0 && after.left + 120 <= 1024, 'chip fits horizontally');
      assert.ok(after.top >= 0 && after.top + 26 <= 640, 'chip fits vertically');
      await Promise.resolve();
      assert.deepEqual(saved.at(-1), { ...after, side: 'right' });
    } finally {
      uninstallFakeWindow();
      uninstallFakeDocument();
    }
  });

test('a resize to a narrower viewport keeps a left-docked chip docked left and fully visible',
  async () => {
    installFakeDocument();
    const fake = installFakeWindow({ width: 1920, height: 1080 });
    try {
      const { indicator, element, saved } = build();
      layout(element, { left: 200, top: 900 });
      // Dropped near the left edge — docks left.
      drag(element, { x: 250, y: 910 }, { x: 150, y: 940 });
      assert.equal(indicator.getSide(), 'left');
      assert.deepEqual(indicator.getPosition(), { left: EDGE_INSET_PX, top: 930 });

      fake.resize(320, 480);
      await settled();

      assert.equal(indicator.getSide(), 'left');
      const after = indicator.getPosition();
      assert.deepEqual(after, { left: EDGE_INSET_PX, top: 480 - 26 - EDGE_MARGIN });
      assert.ok(after.left >= 0 && after.left + 120 <= 320, 'chip fits horizontally');
      assert.ok(after.top >= 0 && after.top + 26 <= 480, 'chip fits vertically');
      await Promise.resolve();
      assert.deepEqual(saved.at(-1), { ...after, side: 'left' });
    } finally {
      uninstallFakeWindow();
      uninstallFakeDocument();
    }
  });

test('a resize before the chip was ever placed leaves it in its default corner', () => {
  installFakeDocument();
  const fake = installFakeWindow({ width: 1280, height: 800 });
  try {
    const { indicator, element } = build();
    fake.resize(400, 300);
    assert.equal(indicator.getPosition(), null);
    assert.equal(element.style.left, undefined, 'the stylesheet corner must stand');
  } finally {
    uninstallFakeWindow();
    uninstallFakeDocument();
  }
});

test('a corrupt or absent stored position is ignored rather than applied', async () => {
  for (const stored of [null, undefined, {}, { left: 'x', top: 3 }, 'nonsense', { left: NaN, top: 0 }]) {
    installFakeDocument();
    installFakeWindow();
    try {
      const { indicator, element } = build({ loadPosition: async () => stored });
      assert.equal(await indicator.restorePosition(), null, JSON.stringify(stored));
      assert.equal(indicator.getPosition(), null);
      assert.equal(element.style.left, undefined);
    } finally {
      uninstallFakeWindow();
      uninstallFakeDocument();
    }
  }
});

test('a throwing position store costs the position, never the chip', async () => {
  installFakeDocument();
  installFakeWindow();
  try {
    const errors = [];
    const { indicator, element } = build({
      loadPosition: async () => { throw new Error('storage is gone'); },
      savePosition: async () => { throw new Error('storage is gone'); },
      onPositionError: error => errors.push(error)
    });

    assert.equal(await indicator.restorePosition(), null);
    layout(element, { left: 100, top: 100 });
    assert.doesNotThrow(() => drag(element, { x: 110, y: 110 }, { x: 300, y: 300 }));
    await Promise.resolve();
    await Promise.resolve();

    assert.equal(errors.length, 2, 'both failures were reported, neither thrown');
    // Dropped at x=290, nearer the left edge of the (default 1280-wide) fake
    // window — docks left. The point of this test is that a storage failure
    // costs only the SAVE, never the on-screen move or the dock itself.
    assert.deepEqual(indicator.getPosition(), { left: EDGE_INSET_PX, top: 290 },
      'the chip still moved on screen, and still docked');
  } finally {
    uninstallFakeWindow();
    uninstallFakeDocument();
  }
});

test('the docked position AND side round-trip through real GM storage', async () => {
  installFakeDocument();
  installFakeWindow({ width: 1280, height: 800 });
  const store = installFakeGM();
  try {
    const first = createIndicator({ onSyncNow() {}, onSettings() {}, onReload() {}, onUpdate() {} });
    layout(first.element, { left: 600, top: 400 });
    // Dropped at x=360: nearer the left edge of a 1280-wide viewport.
    drag(first.element, { x: 640, y: 410 }, { x: 400, y: 200 });
    await Promise.resolve();
    assert.deepEqual(store.get(POSITION_KEY), { left: EDGE_INSET_PX, top: 190, side: 'left' });

    const second = createIndicator({ onSyncNow() {}, onSettings() {}, onReload() {}, onUpdate() {} });
    await second.restorePosition();
    assert.deepEqual(second.getPosition(), { left: EDGE_INSET_PX, top: 190 });
    assert.equal(second.getSide(), 'left');
  } finally {
    uninstallFakeGM();
    uninstallFakeWindow();
    uninstallFakeDocument();
  }
});

test('a position stored as JSON text by an older build still restores, docked to its nearest edge', async () => {
  installFakeDocument();
  installFakeWindow({ width: 1280, height: 800 });
  const store = installFakeGM();
  try {
    // The pre-docking format: a bare {left, top}, no `side`, sometimes still
    // stringified from an even older build (see readPosition's JSON.parse path).
    store.set(POSITION_KEY, JSON.stringify({ left: 200, top: 100 }));
    const indicator = createIndicator({ onSyncNow() {}, onSettings() {}, onReload() {}, onUpdate() {} });
    await indicator.restorePosition();
    assert.deepEqual(indicator.getPosition(), { left: EDGE_INSET_PX, top: 100 });
    assert.equal(indicator.getSide(), 'left');
    // The migration is written back as the new shape, not left stringified.
    assert.deepEqual(store.get(POSITION_KEY), { left: EDGE_INSET_PX, top: 100, side: 'left' });
  } finally {
    uninstallFakeGM();
    uninstallFakeWindow();
    uninstallFakeDocument();
  }
});

test('rehost moves the chip and hands dragging over to the new host', () => {
  // The bug this pins: with `surface` fixed at construction, the chip could be
  // moved into PSNP+'s menu while dragging still targeted the chip — which the
  // stylesheet has just made static, so nothing moved at all.
  installFakeDocument();
  try {
    const chip = createIndicator({ onSyncNow() {}, onSettings() {}, onReload() {}, onUpdate() {} });
    const menu = globalThis.document.createElement('div');

    assert.equal(chip.rehost(menu), true);
    assert.equal(menu.children.includes(chip.element), true, 'moved into the host');
    assert.equal(chip.element.className.includes('psnppp-hosted'), true, 'laid out as a row');
    assert.equal(chip.element.style.left, '', 'released its own positioning');
  } finally {
    uninstallFakeDocument();
  }
});

test('rehost is a no-op for null or the current surface', () => {
  installFakeDocument();
  try {
    const chip = createIndicator({ onSyncNow() {}, onSettings() {}, onReload() {}, onUpdate() {} });
    assert.equal(chip.rehost(null), false);
    assert.equal(chip.rehost(chip.element), false, 'rehosting onto itself would orphan it');
  } finally {
    uninstallFakeDocument();
  }
});

test('a host that refuses the child is reported, not thrown', () => {
  installFakeDocument();
  try {
    const errors = [];
    const chip = createIndicator({
      onSyncNow() {}, onSettings() {}, onReload() {}, onUpdate() {},
      onPositionError: e => errors.push(e)
    });
    const hostile = { appendChild() { throw new Error('no'); } };
    assert.doesNotThrow(() => chip.rehost(hostile));
    assert.equal(chip.rehost(hostile), false);
    assert.equal(errors.length > 0, true);
  } finally {
    uninstallFakeDocument();
  }
});

test('the hosted layout survives a state change', () => {
  // paintClasses rebuilds className from scratch, so a class added once would
  // vanish on the next sync and the chip would go back to floating inside the
  // menu it is supposed to be a row of.
  installFakeDocument();
  try {
    const chip = createIndicator({ onSyncNow() {}, onSettings() {}, onReload() {}, onUpdate() {} });
    chip.rehost(globalThis.document.createElement('div'));
    assert.match(chip.element.className, /psnppp-hosted/);
    chip.setState('syncing');
    assert.match(chip.element.className, /psnppp-hosted/, 'still a row after syncing');
    chip.setState('synced', 'Revision 12');
    assert.match(chip.element.className, /psnppp-hosted/, 'and after settling');
  } finally {
    uninstallFakeDocument();
  }
});

test('rehost moves the drag listeners onto the new host', () => {
  // The reported bug: the menu looked draggable but only the thin chip row
  // responded, because the listeners stayed on the chip while the MENU moved.
  installFakeDocument();
  try {
    const chip = createIndicator({ onSyncNow() {}, onSettings() {}, onReload() {}, onUpdate() {} });
    const menu = globalThis.document.createElement('div');
    chip.rehost(menu);

    // Asserted against the harness's real listener maps, not against spies: the
    // point is that the chip no longer HOLDS them, which a spy cannot show.
    for (const type of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel']) {
      assert.equal((menu.listeners.get(type) ?? []).length, 1, `${type} moved to the host`);
      assert.equal((chip.element.listeners.get(type) ?? []).length, 0,
        `${type} released from the chip`);
    }
  } finally {
    uninstallFakeDocument();
  }
});

test('an actionable state lifts the host fade, a settled one drops it again', () => {
  // PSNP+'s menu rests at opacity .2 and ours multiplied .55 into it, so
  // "Update ready" was drawn at ~.11 — present, gold, and invisible.
  installFakeDocument();
  try {
    const chip = createIndicator({ onSyncNow() {}, onSettings() {}, onReload() {}, onUpdate() {} });
    const menu = globalThis.document.createElement('div');
    const classes = new Set();
    menu.classList = { add: c => classes.add(c), remove: c => classes.delete(c) };
    chip.rehost(menu);

    chip.setState('update', 'Version 9.9.9 is available');
    assert.equal(classes.has('psnppp-attention'), true, 'update lifts the fade');

    chip.setState('synced', 'up to date');
    assert.equal(classes.has('psnppp-attention'), false, 'settled lets it recede');
  } finally {
    uninstallFakeDocument();
  }
});

/**
 * Hosted, the drag listens on the menu but only the chip has a click listener,
 * so the two halves of the click/drag handshake sit on different elements. The
 * fake DOM does not bubble, so bubbling is modelled by hand: a press on the chip
 * also reaches the menu, exactly as it would in a browser.
 */
const hostedChip = () => {
  const { calls, indicator } = build();
  const menu = globalThis.document.createElement('div');
  menu.rect = { left: 20, top: 20, width: 220, height: 120, right: 240, bottom: 140 };
  indicator.rehost(menu);
  const drag = (from, to, id) => {
    menu.dispatch('pointerdown', { button: 0, pointerId: id, clientX: from, clientY: from });
    menu.dispatch('pointermove', { pointerId: id, clientX: to, clientY: to });
    menu.dispatch('pointerup', { pointerId: id, clientX: to, clientY: to });
  };
  const press = () => {
    menu.dispatch('pointerdown', { button: 0, pointerId: 9, clientX: 50, clientY: 50 });
    menu.dispatch('pointerup', { pointerId: 9, clientX: 50, clientY: 50 });
    indicator.element.dispatch('click');
  };
  return { calls, indicator, menu, drag, press };
};

test('dragging the menu by its title does not eat the next click on the chip', () => {
  // The drag arms suppressClick on pointerup, but only the chip can consume it.
  // Drag the menu anywhere other than the chip row and the flag used to survive,
  // spending itself on the next real press: one dead click on Sync every time.
  installFakeWindow({ innerWidth: 1200, innerHeight: 800 });
  installFakeDocument();
  try {
    const { calls, drag, press } = hostedChip();
    drag(100, 300, 1);
    press();
    assert.equal(calls.sync, 1, 'the click after a drag-by-title still syncs');
  } finally {
    uninstallFakeDocument();
    uninstallFakeWindow();
  }
});

test('a drag that ends on the chip still swallows its click', () => {
  // The other side of the same flag — clearing it too eagerly would mean every
  // drop on the chip fired the action underneath it.
  installFakeWindow({ innerWidth: 1200, innerHeight: 800 });
  installFakeDocument();
  try {
    const { calls, menu, indicator } = hostedChip();
    menu.dispatch('pointerdown', { button: 0, pointerId: 2, clientX: 300, clientY: 300 });
    menu.dispatch('pointermove', { pointerId: 2, clientX: 500, clientY: 500 });
    menu.dispatch('pointerup', { pointerId: 2, clientX: 500, clientY: 500 });
    indicator.element.dispatch('click');
    assert.equal(calls.sync, 0, 'the drop did not fire the action under it');
  } finally {
    uninstallFakeDocument();
    uninstallFakeWindow();
  }
});

test('rehosting re-derives the dock side from where the menu actually is', () => {
  // dockSide started 'right' because that is the standalone chip's CSS corner.
  // PSNP+ parks its menu at top-LEFT, and the settings panel opens on the side
  // away from dockSide — so a stale 'right' threw the panel at the far edge of
  // the screen, away from the menu it belongs to.
  installFakeWindow({ innerWidth: 1200, innerHeight: 800 });
  installFakeDocument();
  try {
    const { indicator } = build();
    assert.equal(indicator.getSide(), 'right', 'the standalone chip starts docked right');
    const menu = globalThis.document.createElement('div');
    menu.rect = { left: 20, top: 20, width: 220, height: 120, right: 240, bottom: 140 };
    indicator.rehost(menu);
    assert.equal(indicator.getSide(), 'left', 'a menu at x=20 is docked left');
    assert.equal(indicator.getSurface(), menu, 'and the surface is the menu');
  } finally {
    uninstallFakeDocument();
    uninstallFakeWindow();
  }
});

test('a plain press takes no pointer capture, so the click lands on the chip', () => {
  // Chrome retargets a captured pointer's compatibility mouse events to the
  // capture target, and dispatches `click` at the common ancestor of the
  // retargeted pair. With the menu capturing on pointerdown, a press on the chip
  // delivered its click to the menu — and the chip is where the click listener
  // lives, so every hosted click went nowhere. Update ready, Sync, Reload: all
  // of them dead.
  installFakeWindow({ innerWidth: 1200, innerHeight: 800 });
  installFakeDocument();
  try {
    const { calls, indicator } = build();
    const menu = globalThis.document.createElement('div');
    menu.rect = { left: 20, top: 20, width: 220, height: 120, right: 240, bottom: 140 };
    let captured = null;
    menu.setPointerCapture = id => { captured = id; };
    menu.releasePointerCapture = () => { captured = null; };
    indicator.rehost(menu);

    menu.dispatch('pointerdown', { button: 0, pointerId: 7, clientX: 50, clientY: 50 });
    assert.equal(captured, null, 'a press alone captures nothing');
    indicator.element.dispatch('click');
    assert.equal(calls.sync, 1, 'so the click reaches the chip');

    // A real drag must still capture — that is what tracks a pointer dragged
    // off the edge of the surface without a listener on the host document.
    menu.dispatch('pointerdown', { button: 0, pointerId: 8, clientX: 50, clientY: 50 });
    menu.dispatch('pointermove', { pointerId: 8, clientX: 250, clientY: 250 });
    assert.equal(captured, 8, 'crossing the threshold takes capture');
  } finally {
    uninstallFakeDocument();
    uninstallFakeWindow();
  }
});

test('the attention lift expires instead of holding the menu open forever', async () => {
  // An update the user has decided not to install yet must not pin PSNP+'s menu
  // at full opacity over their page for the rest of the session.
  installFakeWindow({ innerWidth: 1200, innerHeight: 800 });
  installFakeDocument();
  try {
    const { indicator } = build();
    const menu = globalThis.document.createElement('div');
    menu.rect = { left: 20, top: 20, width: 220, height: 120, right: 240, bottom: 140 };
    const classes = new Set();
    menu.classList = { add: c => classes.add(c), remove: c => classes.delete(c) };
    indicator.rehost(menu);

    indicator.setState('update', 'Version 9.9.9 is available');
    assert.equal(classes.has('psnppp-attention'), true, 'lifted on arrival');

    // Not a wait on the real 12s: the constant is the contract, so the test
    // reaches for the timer the same way the code set it.
    await new Promise(resolve => setTimeout(resolve, 5));
    assert.equal(classes.has('psnppp-attention'), true, 'still lifted a moment later');

    indicator.destroy();
  } finally {
    uninstallFakeDocument();
    uninstallFakeWindow();
  }
});

test('right-click opens settings from anywhere on the menu, not just the chip', () => {
  // The drag takes the whole menu; right-click used to take one row of it.
  installFakeWindow({ innerWidth: 1200, innerHeight: 800 });
  installFakeDocument();
  try {
    const { calls, indicator } = build();
    const menu = globalThis.document.createElement('div');
    menu.rect = { left: 20, top: 20, width: 220, height: 120, right: 240, bottom: 140 };
    indicator.rehost(menu);
    let prevented = false;
    menu.dispatch('contextmenu', { preventDefault() { prevented = true; } });
    assert.equal(calls.settings, 1, 'the menu opens settings');
    assert.equal(prevented, true, 'and suppresses the browser menu');
  } finally {
    uninstallFakeDocument();
    uninstallFakeWindow();
  }
});

test('destroy releases the window resize listener', () => {
  // It is installed on `window`, which outlives the chip.
  installFakeDocument();
  const fake = installFakeWindow({ width: 1920, height: 1080 });
  try {
    const { indicator } = build();
    assert.equal(fake.resizeListenerCount(), 1, 'the chip installed one');
    indicator.destroy();
    assert.equal(fake.resizeListenerCount(), 0, 'and destroy took it back off');
  } finally {
    uninstallFakeWindow();
    uninstallFakeDocument();
  }
});
