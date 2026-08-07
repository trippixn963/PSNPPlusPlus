import test from 'node:test';
import assert from 'node:assert/strict';
import { createIndicator } from '../src/indicator.mjs';

/**
 * A minimal fake document for testing the indicator in node.
 * Provides only what createIndicator needs: createElement, style object, addEventListener, appendChild.
 */
function installFakeDocument() {
  globalThis.document = {
    createElement(tag) {
      const el = {
        id: '',
        style: {},
        title: '',
        addEventListener() {},
        appendChild() {}
      };
      return el;
    }
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
