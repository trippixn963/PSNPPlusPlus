import test from 'node:test';
import assert from 'node:assert/strict';
import { MENU_SELECTOR, ENTRY_ID, attachMenuEntry, attachMenuEntryWhenReady } from '../src/menu.mjs';

/** Enough of a DOM for appendChild/querySelector/getElementById and one listener. */
const fakeDoc = ({ withMenu = true } = {}) => {
  const nodes = new Map();
  const makeEl = () => ({
    id: '', textContent: '', style: { cssText: '' }, children: [],
    listeners: {},
    addEventListener(type, fn) { this.listeners[type] = fn; },
    appendChild(child) { this.children.push(child); if (child.id) nodes.set(child.id, child); }
  });
  const menu = withMenu ? makeEl() : null;
  return {
    body: makeEl(),
    createElement: () => makeEl(),
    querySelector: sel => (sel === MENU_SELECTOR ? menu : null),
    getElementById: id => nodes.get(id) ?? null,
    menu
  };
};

const clickEvent = () => {
  const e = { defaultPrevented: false, propagationStopped: false };
  e.preventDefault = () => { e.defaultPrevented = true; };
  e.stopPropagation = () => { e.propagationStopped = true; };
  return e;
};

test('the row is appended to PSNP+ menu', () => {
  const doc = fakeDoc();
  const handle = attachMenuEntry(doc, { onClick() {} });
  assert.notEqual(handle, null);
  assert.equal(doc.menu.children.length, 1);
  assert.equal(doc.menu.children[0].id, ENTRY_ID);
  assert.equal(doc.menu.children[0].textContent, 'Sync now');
});

test('no menu means no row, and no throw', () => {
  // PSNP+ hides the menu entirely when its own hideFloatingMenus setting is on.
  const doc = fakeDoc({ withMenu: false });
  assert.equal(attachMenuEntry(doc, { onClick() {} }), null);
});

test('attaching twice does not add a second row', () => {
  const doc = fakeDoc();
  attachMenuEntry(doc, { onClick() {} });
  const second = attachMenuEntry(doc, { onClick() {} });
  assert.equal(doc.menu.children.length, 1);
  assert.notEqual(second, null, 'and it still hands back a usable handle');
});

test('clicking runs the action and does not leak to the page beneath', () => {
  const doc = fakeDoc();
  let ran = 0;
  attachMenuEntry(doc, { onClick() { ran += 1; } });
  const event = clickEvent();
  doc.menu.children[0].listeners.click(event);
  assert.equal(ran, 1);
  assert.equal(event.defaultPrevented, true);
  assert.equal(event.propagationStopped, true);
});

test('an action that throws does not escape the click handler', () => {
  const doc = fakeDoc();
  attachMenuEntry(doc, { onClick() { throw new Error('boom'); } });
  assert.doesNotThrow(() => doc.menu.children[0].listeners.click(clickEvent()));
});

test('setLabel updates the row', () => {
  const doc = fakeDoc();
  const handle = attachMenuEntry(doc, { onClick() {} });
  handle.setLabel('Syncing…');
  assert.equal(doc.menu.children[0].textContent, 'Syncing…');
});

test('a hostile document yields null rather than throwing', () => {
  assert.equal(attachMenuEntry(null, {}), null);
  assert.equal(attachMenuEntry({ querySelector() { throw new Error('nope'); } }, {}), null);
});

test('waiting resolves immediately when the menu is already there', async () => {
  const doc = fakeDoc();
  const handle = await attachMenuEntryWhenReady(doc, { onClick() {} }, { waitMs: 50 });
  assert.notEqual(handle, null);
});

test('waiting gives up rather than holding an observer open forever', async () => {
  // PSNP+ inserts the menu in its DOMContentLoaded pass. If it never arrives,
  // the menu is switched off or PSNP+ did not load — neither is worth watching
  // for the life of the page.
  const doc = fakeDoc({ withMenu: false });
  globalThis.MutationObserver = class {
    observe() {} disconnect() {}
  };
  try {
    const handle = await attachMenuEntryWhenReady(doc, { onClick() {} }, { waitMs: 20 });
    assert.equal(handle, null);
  } finally {
    delete globalThis.MutationObserver;
  }
});

test('without MutationObserver it resolves null instead of hanging', async () => {
  const doc = fakeDoc({ withMenu: false });
  const handle = await attachMenuEntryWhenReady(doc, { onClick() {} }, { waitMs: 20 });
  assert.equal(handle, null);
});
