/**
 * PSNP++ - Finding PSNP+'s floating menu
 * ======================================
 *
 * One job: hand back PSNP+'s floating menu element once it exists, so the chip
 * can move into it and the two halves of this script become one surface.
 *
 * This used to build a "Sync now" row, append it to the menu, and return a
 * handle with a click action and a `setLabel`. None of that was ever used once
 * the chip itself moved in — main.mjs appended the row purely to read its
 * `parentElement` back, then removed it again. A DOM node created and destroyed
 * to answer a question `querySelector` answers directly.
 *
 * Deliberately NOT a patch. PSNP+ builds the menu in its own class, but the
 * result is a plain element in the page, and looking for an element that is not
 * there is a no-op. A patch that stopped matching would fail the build; this
 * just quietly finds nothing — the right failure for something the standalone
 * chip already covers.
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */

export const MENU_SELECTOR = '.psnpp-floating-menu';

/**
 * How long to keep watching before giving up.
 *
 * PSNP+ inserts the menu during its DOMContentLoaded pass, which runs after
 * ours, so it is normally absent at the moment this is called. Bounded rather
 * than a permanent observer: if it has not appeared within a few seconds then
 * `hideFloatingMenus` is switched on in PSNP+'s own settings, or PSNP+ did not
 * load, and neither is worth holding an observer open for the life of the page.
 */
const WAIT_MS = 8000;

/** The menu, or null. Never throws — a hostile document is just "not found". */
export function findMenu(doc) {
  try {
    return doc?.querySelector?.(MENU_SELECTOR) ?? null;
  } catch (error) {
    console.error('[psnppp] could not look for the menu:', error);
    return null;
  }
}

/**
 * Resolve with the menu as soon as it exists, or with null after WAIT_MS.
 *
 * Never rejects: it is called fire-and-forget from start(), which has to reach
 * the chip whether or not PSNP+ is there.
 */
export function findMenuWhenReady(doc, { waitMs = WAIT_MS } = {}) {
  return new Promise(resolve => {
    try {
      const immediate = findMenu(doc);
      if (immediate != null) { resolve(immediate); return; }

      if (typeof MutationObserver !== 'function' || doc?.body == null) { resolve(null); return; }

      let settled = false;
      const finish = menu => {
        if (settled) return;
        settled = true;
        observer.disconnect();
        clearTimeout(timer);
        resolve(menu);
      };

      const observer = new MutationObserver(() => {
        const menu = findMenu(doc);
        if (menu != null) finish(menu);
      });
      observer.observe(doc.body, { childList: true, subtree: true });

      const timer = setTimeout(() => finish(null), waitMs);
    } catch (error) {
      console.error('[psnppp] could not watch for the menu:', error);
      resolve(null);
    }
  });
}
