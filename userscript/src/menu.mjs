/**
 * PSNP++ - Floating menu entry
 * ============================
 *
 * Puts a sync row inside PSNP+'s floating menu, so the two halves of this
 * script have one place to live instead of two.
 *
 * Deliberately NOT a patch. PSNP+ builds that menu in its own class, but the
 * result is a plain element in the page — appending to it is a DOM operation,
 * and a DOM operation that finds nothing is a no-op. A patch that stopped
 * matching would fail the build; this just quietly does not appear, which is
 * the right failure for a convenience that duplicates the chip.
 *
 * The chip stays. It is the thing that reports state on every page and survives
 * PSNP+ not loading at all — this is a shortcut, not a replacement.
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */

import { TOKENS } from './theme.mjs';

export const MENU_SELECTOR = '.psnpp-floating-menu';
export const ENTRY_ID = 'psnppp-menu-entry';

/**
 * How long to keep watching for the menu before giving up.
 *
 * PSNP+ inserts it during its DOMContentLoaded pass, which runs after ours, so
 * it is normally absent at the moment this is called. Bounded rather than a
 * permanent observer: if the menu has not appeared within a few seconds it is
 * switched off in PSNP+'s own settings (`hideFloatingMenus`) or PSNP+ did not
 * load, and neither is worth holding an observer open for the life of the page.
 */
const WAIT_MS = 8000;

/**
 * Append the row, once.
 *
 * Returns a handle whose `setLabel` updates the text, or null if the menu was
 * never found. Idempotent: a second call with the row already present returns a
 * handle to the existing one rather than adding a second.
 */
export function attachMenuEntry(doc, { onClick, label = 'Sync now' } = {}) {
  try {
    const menu = doc?.querySelector?.(MENU_SELECTOR);
    if (menu == null) return null;

    const existing = doc.getElementById?.(ENTRY_ID);
    if (existing != null) {
      return { element: existing, setLabel: text => { existing.textContent = text; } };
    }

    const row = doc.createElement('div');
    row.id = ENTRY_ID;
    row.textContent = label;
    row.style.cssText = [
      'margin-top:6px',
      `border-top:1px solid ${TOKENS.hairline}`,
      'padding-top:6px',
      'cursor:pointer',
      `color:${TOKENS.gold}`,
      'user-select:none'
    ].join(';');

    row.addEventListener('click', event => {
      // The menu is a sibling of the page's own controls; without this a click
      // here can also register on whatever sits beneath it.
      event.preventDefault();
      event.stopPropagation();
      try {
        onClick?.();
      } catch (error) {
        console.error('[psnppp] menu action failed:', error);
      }
    });

    menu.appendChild(row);
    return { element: row, setLabel: text => { row.textContent = text; } };
  } catch (error) {
    console.error('[psnppp] could not add the menu entry:', error);
    return null;
  }
}

/**
 * Attach as soon as PSNP+'s menu exists, giving up after WAIT_MS.
 *
 * Resolves with the handle, or null. Never rejects — it is called
 * fire-and-forget from start(), which must reach the chip regardless.
 */
export function attachMenuEntryWhenReady(doc, options = {}, { waitMs = WAIT_MS } = {}) {
  return new Promise(resolve => {
    try {
      const immediate = attachMenuEntry(doc, options);
      if (immediate != null) { resolve(immediate); return; }

      if (typeof MutationObserver !== 'function' || doc?.body == null) { resolve(null); return; }

      let settled = false;
      const finish = handle => {
        if (settled) return;
        settled = true;
        observer.disconnect();
        clearTimeout(timer);
        resolve(handle);
      };

      const observer = new MutationObserver(() => {
        const handle = attachMenuEntry(doc, options);
        if (handle != null) finish(handle);
      });
      observer.observe(doc.body, { childList: true, subtree: true });

      const timer = setTimeout(() => finish(null), waitMs);
    } catch (error) {
      console.error('[psnppp] could not watch for the menu:', error);
      resolve(null);
    }
  });
}
