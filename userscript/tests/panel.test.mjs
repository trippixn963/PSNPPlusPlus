/**
 * PSNP++ - Settings Panel: positioning
 * =====================================
 *
 * The chip is now permanently docked to a screen edge (see indicator.mjs), so
 * the panel has room on exactly one horizontal side of it — the side away
 * from the edge the chip is flush against. This pins that: a docked-left chip
 * opens the panel to its right, a docked-right chip opens it to the left, and
 * neither ever runs the panel off the opposite edge of the screen.
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createSettingsPanel } from '../src/panel.mjs';
import { EDGE_INSET_PX, PANEL_WIDTH_PX, CHIP_FALLBACK_SIZE } from '../src/theme.mjs';
import { installFakeDocument, uninstallFakeDocument, installFakeWindow, uninstallFakeWindow }
  from './fake-dom.mjs';

/** A chip-shaped anchor node with a fixed, measurable rect. */
function anchorAt({ left, top, width = 120, height = 26 }) {
  return { getBoundingClientRect: () => ({ left, top, width, height, right: left + width, bottom: top + height }) };
}

test('a chip docked left opens the panel to its right', () => {
  installFakeDocument();
  installFakeWindow({ width: 1280, height: 800 });
  try {
    const anchor = anchorAt({ left: EDGE_INSET_PX, top: 400 });
    const panel = createSettingsPanel({ anchor, side: 'left' });
    assert.equal(panel.element.style.left, `${EDGE_INSET_PX + 120 + EDGE_INSET_PX}px`);
    assert.equal(panel.element.style.right, 'auto');
  } finally {
    uninstallFakeWindow();
    uninstallFakeDocument();
  }
});

test('a chip docked right opens the panel to its left', () => {
  installFakeDocument();
  installFakeWindow({ width: 1280, height: 800 });
  try {
    const chipLeft = 1280 - 120 - EDGE_INSET_PX;
    const anchor = anchorAt({ left: chipLeft, top: 400 });
    const panel = createSettingsPanel({ anchor, side: 'right' });
    assert.equal(panel.element.style.left, `${chipLeft - PANEL_WIDTH_PX - EDGE_INSET_PX}px`);
    assert.equal(panel.element.style.right, 'auto');
  } finally {
    uninstallFakeWindow();
    uninstallFakeDocument();
  }
});

test('with no side given, a measurable chip still opens the panel to its left (the default dock)', () => {
  // Matches indicator.mjs's own default: getSide() answers 'right' before the
  // chip has ever been dragged, because that is the corner the CSS parks it
  // in. The panel's default has to agree, or a fresh install's very first
  // right-click opens the panel on the wrong side of an un-dragged chip.
  installFakeDocument();
  installFakeWindow({ width: 1280, height: 800 });
  try {
    const chipLeft = 1280 - 120 - EDGE_INSET_PX;
    const anchor = anchorAt({ left: chipLeft, top: 400 });
    const panel = createSettingsPanel({ anchor });
    assert.equal(panel.element.style.left, `${chipLeft - PANEL_WIDTH_PX - EDGE_INSET_PX}px`);
  } finally {
    uninstallFakeWindow();
    uninstallFakeDocument();
  }
});

test('the panel never opens off the right edge when a left dock leaves no room', () => {
  installFakeDocument();
  installFakeWindow({ width: 350, height: 800 });
  try {
    const anchor = anchorAt({ left: EDGE_INSET_PX, top: 400 });
    const panel = createSettingsPanel({ anchor, side: 'left' });
    const left = Number.parseFloat(panel.element.style.left);
    const width = Math.min(PANEL_WIDTH_PX, 350 - EDGE_INSET_PX * 2);
    assert.ok(left + width <= 350 - EDGE_INSET_PX + 0.001,
      `panel right edge (${left + width}) must stay within the viewport`);
    assert.ok(left >= 0, 'and must not be pushed negative either');
  } finally {
    uninstallFakeWindow();
    uninstallFakeDocument();
  }
});

test('the panel never opens off the left edge when a right dock leaves no room', () => {
  installFakeDocument();
  installFakeWindow({ width: 350, height: 800 });
  try {
    const chipLeft = 350 - 120 - EDGE_INSET_PX;
    const anchor = anchorAt({ left: chipLeft, top: 400 });
    const panel = createSettingsPanel({ anchor, side: 'right' });
    const left = Number.parseFloat(panel.element.style.left);
    assert.ok(left >= EDGE_INSET_PX - 0.001, `panel left edge (${left}) must not run off screen`);
  } finally {
    uninstallFakeWindow();
    uninstallFakeDocument();
  }
});

test('an unmeasurable chip falls back to the stylesheet corner regardless of side', () => {
  installFakeDocument();
  installFakeWindow({ width: 1280, height: 800 });
  try {
    for (const side of ['left', 'right', undefined]) {
      const panel = createSettingsPanel({ anchor: null, side });
      assert.equal(panel.element.style.right, `${EDGE_INSET_PX}px`);
      assert.equal(panel.element.style.bottom,
        `${EDGE_INSET_PX * 2 + CHIP_FALLBACK_SIZE.height}px`);
    }
  } finally {
    uninstallFakeWindow();
    uninstallFakeDocument();
  }
});

test('the panel is top-aligned to its anchor, not hung below it', () => {
  installFakeDocument();
  installFakeWindow({ width: 1280, height: 800 });
  try {
    const anchor = anchorAt({ left: EDGE_INSET_PX, top: 100 });
    const panel = createSettingsPanel({ anchor, side: 'left' });
    assert.equal(panel.element.style.top, '100px', 'aligned to the anchor top');
    assert.equal(panel.element.style.bottom, 'auto');
  } finally {
    uninstallFakeWindow();
    uninstallFakeDocument();
  }
});

test('a taller anchor does not move the panel', () => {
  // The bug: PSNP+'s menu GROWS ON HOVER (the profile page reveals a refresh
  // container from _onShow). The panel used to hang off rect.bottom, so it was
  // placed against the expanded height and left stranded in mid-air the moment
  // the pointer left and the menu collapsed. Its top edge never moved.
  installFakeDocument();
  installFakeWindow({ width: 1280, height: 800 });
  try {
    const collapsed = anchorAt({ left: EDGE_INSET_PX, top: 100 });
    const shut = createSettingsPanel({ anchor: collapsed, side: 'left' });

    const expanded = anchorAt({ left: EDGE_INSET_PX, top: 100 });
    expanded.rect = { ...expanded.rect, height: 220, bottom: 320 };
    const open = createSettingsPanel({ anchor: expanded, side: 'left' });

    assert.equal(open.element.style.top, shut.element.style.top,
      'the same anchor at the same top places the panel identically, expanded or not');
  } finally {
    uninstallFakeWindow();
    uninstallFakeDocument();
  }
});

test('an anchor near the bottom of the screen still gets a panel that fits', () => {
  installFakeDocument();
  installFakeWindow({ width: 1280, height: 800 });
  try {
    const anchor = anchorAt({ left: EDGE_INSET_PX, top: 780 });
    const panel = createSettingsPanel({ anchor, side: 'left' });
    const top = Number.parseInt(panel.element.style.top, 10);
    assert.ok(Number.isFinite(top), 'a real number');
    assert.ok(top >= EDGE_INSET_PX && top <= 800 - EDGE_INSET_PX,
      `clamped onto the screen, got ${top}`);
  } finally {
    uninstallFakeWindow();
    uninstallFakeDocument();
  }
});
