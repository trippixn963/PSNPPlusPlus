import test from 'node:test';
import assert from 'node:assert/strict';
import { MENU_SELECTOR, findMenu, findMenuWhenReady } from '../src/menu.mjs';

/** Just enough document to answer querySelector and hold a body for the observer. */
const fakeDoc = ({ withMenu = true } = {}) => {
  const menu = withMenu ? { id: 'the-menu' } : null;
  return {
    body: {},
    querySelector: sel => (sel === MENU_SELECTOR ? menu : null),
    menu
  };
};

test('the menu is found by its PSNP+ class', () => {
  const doc = fakeDoc();
  assert.equal(findMenu(doc), doc.menu);
});

test('no menu means null, and no throw', () => {
  // PSNP+ hides the menu entirely when its own hideFloatingMenus setting is on.
  assert.equal(findMenu(fakeDoc({ withMenu: false })), null);
});

test('a hostile document yields null rather than throwing', () => {
  assert.equal(findMenu(null), null);
  assert.equal(findMenu({}), null);
  assert.equal(findMenu({ querySelector() { throw new Error('nope'); } }), null);
});

test('waiting resolves immediately when the menu is already there', async () => {
  const doc = fakeDoc();
  assert.equal(await findMenuWhenReady(doc, { waitMs: 50 }), doc.menu);
});

test('waiting resolves with the menu once it appears', async () => {
  // The real timing: PSNP+ inserts the menu in its DOMContentLoaded pass, which
  // runs after ours, so it is absent at the moment this is first called.
  let menu = null;
  const doc = { body: {}, querySelector: sel => (sel === MENU_SELECTOR ? menu : null) };
  let fire = () => {};
  globalThis.MutationObserver = class {
    constructor(cb) { fire = cb; }
    observe() {} disconnect() {}
  };
  try {
    const pending = findMenuWhenReady(doc, { waitMs: 500 });
    menu = { id: 'late' };
    fire();
    assert.equal(await pending, menu);
  } finally {
    delete globalThis.MutationObserver;
  }
});

test('waiting gives up rather than holding an observer open forever', async () => {
  // If the menu never arrives, it is switched off or PSNP+ did not load —
  // neither is worth watching for the life of the page.
  const doc = fakeDoc({ withMenu: false });
  let disconnected = 0;
  globalThis.MutationObserver = class {
    observe() {} disconnect() { disconnected += 1; }
  };
  try {
    assert.equal(await findMenuWhenReady(doc, { waitMs: 20 }), null);
    assert.equal(disconnected, 1, 'and the observer is released');
  } finally {
    delete globalThis.MutationObserver;
  }
});

test('without MutationObserver it resolves null instead of hanging', async () => {
  assert.equal(await findMenuWhenReady(fakeDoc({ withMenu: false }), { waitMs: 20 }), null);
});
