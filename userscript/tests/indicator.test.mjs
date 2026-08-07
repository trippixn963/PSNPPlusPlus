import test from 'node:test';
import assert from 'node:assert/strict';
import { createIndicator, clampToViewport, isUsablePosition, POSITION_KEY, EDGE_MARGIN }
  from '../src/indicator.mjs';
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

test('a drag moves the chip and remembers where it was put', async () => {
  installFakeDocument();
  const fake = installFakeWindow({ width: 1280, height: 800 });
  try {
    const { indicator, element, saved } = build();
    layout(element, { left: 1148, top: 762 });

    drag(element, { x: 1200, y: 770 }, { x: 900, y: 400 });

    assert.deepEqual(indicator.getPosition(), { left: 848, top: 392 });
    assert.equal(element.style.left, '848px');
    assert.equal(element.style.top, '392px');
    // Both corner anchors have to be released or left/top do nothing at all.
    assert.equal(element.style.right, 'auto');
    assert.equal(element.style.bottom, 'auto');

    await Promise.resolve();
    assert.deepEqual(saved.at(-1), { left: 848, top: 392 });
    assert.equal(fake.alerts.length, 0);
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

    drag(element, { x: 640, y: 410 }, { x: 9000, y: 9000 });

    assert.deepEqual(indicator.getPosition(),
      { left: 1280 - 120 - EDGE_MARGIN, top: 800 - 26 - EDGE_MARGIN });
  } finally {
    uninstallFakeWindow();
    uninstallFakeDocument();
  }
});

// --- restoring, and the laptop problem --------------------------------------

test('a saved position is restored on load', async () => {
  installFakeDocument();
  installFakeWindow({ width: 1280, height: 800 });
  try {
    const { indicator, element } = build({ loadPosition: async () => ({ left: 300, top: 200 }) });
    layout(element, { left: 0, top: 0 });

    await indicator.restorePosition();

    assert.deepEqual(indicator.getPosition(), { left: 300, top: 200 });
    assert.equal(element.style.left, '300px');
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
      loadPosition: async () => ({ left: 3300, top: 1380 })
    });
    layout(element, { left: 0, top: 0 });

    const restored = await indicator.restorePosition();

    assert.deepEqual(restored, { left: 1280 - 120 - EDGE_MARGIN, top: 800 - 26 - EDGE_MARGIN });
    assert.deepEqual(indicator.getPosition(), restored);
    await Promise.resolve();
    // The correction is written back: leaving the unreachable value stored
    // means paying the same correction on every single load, forever.
    assert.deepEqual(saved.at(-1), restored);
  } finally {
    uninstallFakeWindow();
    uninstallFakeDocument();
  }
});

test('shrinking the window pulls the chip back into view and re-saves it', async () => {
  installFakeDocument();
  const fake = installFakeWindow({ width: 1920, height: 1080 });
  try {
    const { indicator, element, saved } = build();
    layout(element, { left: 1700, top: 1000 });
    drag(element, { x: 1750, y: 1010 }, { x: 1800, y: 1040 });
    assert.deepEqual(indicator.getPosition(), { left: 1750, top: 1030 });

    fake.resize(1024, 640);

    assert.deepEqual(indicator.getPosition(),
      { left: 1024 - 120 - EDGE_MARGIN, top: 640 - 26 - EDGE_MARGIN });
    await Promise.resolve();
    assert.deepEqual(saved.at(-1), indicator.getPosition());
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
    assert.deepEqual(indicator.getPosition(), { left: 290, top: 290 },
      'the chip still moved on screen');
  } finally {
    uninstallFakeWindow();
    uninstallFakeDocument();
  }
});

test('the position round-trips through real GM storage', async () => {
  installFakeDocument();
  installFakeWindow({ width: 1280, height: 800 });
  const store = installFakeGM();
  try {
    const first = createIndicator({ onSyncNow() {}, onSettings() {}, onReload() {}, onUpdate() {} });
    layout(first.element, { left: 600, top: 400 });
    drag(first.element, { x: 640, y: 410 }, { x: 400, y: 200 });
    await Promise.resolve();
    assert.deepEqual(store.get(POSITION_KEY), { left: 360, top: 190 });

    const second = createIndicator({ onSyncNow() {}, onSettings() {}, onReload() {}, onUpdate() {} });
    await second.restorePosition();
    assert.deepEqual(second.getPosition(), { left: 360, top: 190 });
  } finally {
    uninstallFakeGM();
    uninstallFakeWindow();
    uninstallFakeDocument();
  }
});

test('a position stored as JSON text by an older build still restores', async () => {
  installFakeDocument();
  installFakeWindow({ width: 1280, height: 800 });
  const store = installFakeGM();
  try {
    store.set(POSITION_KEY, JSON.stringify({ left: 200, top: 100 }));
    const indicator = createIndicator({ onSyncNow() {}, onSettings() {}, onReload() {}, onUpdate() {} });
    await indicator.restorePosition();
    assert.deepEqual(indicator.getPosition(), { left: 200, top: 100 });
  } finally {
    uninstallFakeGM();
    uninstallFakeWindow();
    uninstallFakeDocument();
  }
});
