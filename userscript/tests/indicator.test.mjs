import test from 'node:test';
import assert from 'node:assert/strict';
import { createIndicator } from '../src/indicator.mjs';

/**
 * A minimal fake document for testing the indicator in node.
 * Provides only what createIndicator needs: createElement, style object, addEventListener, appendChild.
 *
 * Listeners are recorded rather than discarded: the chip's click behaviour is
 * now state-dependent (a chip in the `reload` state reloads the page instead of
 * running another sync), and that decision only exists inside the handler.
 */
function installFakeDocument() {
  const created = [];
  globalThis.document = {
    createElement(tag) {
      const listeners = new Map();
      const el = {
        id: '',
        style: {},
        title: '',
        listeners,
        addEventListener(type, handler) { listeners.set(type, handler); },
        appendChild() {}
      };
      created.push(el);
      return el;
    }
  };
  return {
    /** The chip itself — the only element createIndicator binds handlers to. */
    get chip() { return created.find(el => el.listeners.size > 0); }
  };
}

function uninstallFakeDocument() {
  delete globalThis.document;
}

test('createIndicator does not throw on unknown state', () => {
  installFakeDocument();
  try {
    const indicator = createIndicator({
      onSyncNow() {},
      onSettings() {}
    });
    // setState with bogus state must not throw; it should fall back to idle
    assert.doesNotThrow(() => {
      indicator.setState('some-bogus-state');
    });
  } finally {
    uninstallFakeDocument();
  }
});

test('createIndicator does not throw on valid state', () => {
  installFakeDocument();
  try {
    const indicator = createIndicator({
      onSyncNow() {},
      onSettings() {}
    });
    // setState with a valid state must not throw
    assert.doesNotThrow(() => {
      indicator.setState('synced');
    });
  } finally {
    uninstallFakeDocument();
  }
});

// --- the `reload` state has to be actionable --------------------------------
//
// PSNP+ renders its list view from localStorage at render time and we write
// behind it, so a cycle that changed something leaves the drawn page stale. We
// deliberately do not reach into PSNP+'s internals to force a re-render, which
// leaves the reload to the user — so the chip that TELLS them to reload is also
// the thing that has to DO it. Syncing again from that state is a no-op that
// leaves the same stale page and the same chip.

const spies = () => {
  const calls = { sync: 0, reload: 0, settings: 0 };
  return {
    calls,
    handlers: {
      onSyncNow() { calls.sync += 1; },
      onSettings() { calls.settings += 1; },
      onReload() { calls.reload += 1; }
    }
  };
};

test('a click in the reload state reloads the page instead of syncing again', () => {
  const fake = installFakeDocument();
  try {
    const { calls, handlers } = spies();
    const indicator = createIndicator(handlers);
    indicator.setState('reload', 'Revision 7');

    fake.chip.listeners.get('click')();

    assert.equal(calls.reload, 1, 'the click must reload');
    assert.equal(calls.sync, 0, 'and must NOT run another sync');
  } finally {
    uninstallFakeDocument();
  }
});

test('the reload state says clicking reloads, not that it syncs', () => {
  const fake = installFakeDocument();
  try {
    const indicator = createIndicator(spies().handlers);
    indicator.setState('reload', 'Revision 7');

    assert.match(fake.chip.title, /click to reload/i);
    assert.doesNotMatch(fake.chip.title, /click to sync/i);
  } finally {
    uninstallFakeDocument();
  }
});

test('a click in every other state still syncs and never reloads', () => {
  // A fresh fake document per state: `chip` finds the first element that got a
  // listener, so reusing one document across iterations would keep clicking
  // iteration 1's chip and pass vacuously from then on.
  for (const state of ['idle', 'syncing', 'synced', 'offline', 'conflict', 'unconfigured']) {
    const fake = installFakeDocument();
    try {
      const { calls, handlers } = spies();
      const indicator = createIndicator(handlers);
      indicator.setState(state);
      fake.chip.listeners.get('click')();
      assert.equal(calls.sync, 1, `${state} must still sync`);
      assert.equal(calls.reload, 0, `${state} must not reload`);
      assert.match(fake.chip.title, /click to sync/i, `${state} tooltip`);
    } finally {
      uninstallFakeDocument();
    }
  }
});

test('leaving the reload state makes a click sync again', () => {
  const fake = installFakeDocument();
  try {
    const { calls, handlers } = spies();
    const indicator = createIndicator(handlers);
    indicator.setState('reload', 'Revision 7');
    indicator.setState('synced', 'Revision 8');

    fake.chip.listeners.get('click')();
    assert.equal(calls.sync, 1);
    assert.equal(calls.reload, 0);
  } finally {
    uninstallFakeDocument();
  }
});

test('right-click still opens settings from the reload state', () => {
  const fake = installFakeDocument();
  try {
    const { calls, handlers } = spies();
    const indicator = createIndicator(handlers);
    indicator.setState('reload', 'Revision 7');

    let prevented = false;
    fake.chip.listeners.get('contextmenu')({ preventDefault() { prevented = true; } });
    assert.equal(calls.settings, 1);
    assert.equal(calls.reload, 0);
    assert.ok(prevented);
  } finally {
    uninstallFakeDocument();
  }
});
