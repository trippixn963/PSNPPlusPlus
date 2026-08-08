/**
 * PSNP++ - Patch: stop hiding the profile menu's refresh text
 * ===========================================================
 *
 * The profile page's floating menu holds two small lines saying when the
 * profile was last refreshed. PSNP+ creates that span hidden and reveals it on
 * mouseenter, so the menu CHANGES HEIGHT under the pointer.
 *
 * That was never only cosmetic. The settings panel used to hang off the menu's
 * bottom edge, measured while it was expanded, and was left stranded in mid-air
 * the moment the pointer left and the menu shrank back. Top-aligning the panel
 * fixed the symptom; this removes the cause.
 *
 * Always visible, rather than "remembered" or "pinned until dismissed". The
 * content is two lines of 10px text. Machinery to hold it open — a pinned flag,
 * a deliberate collapse, somewhere to persist the state — would be more moving
 * parts than the thing being shown, and every one of them is a part that can
 * disagree with PSNP+'s own. A menu that is simply always the same size cannot
 * jump, cannot strand anything hung off it, and needs no state at all.
 *
 * Paired with menu-no-content-toggle, which removes the handlers that would
 * otherwise hide this again on the way out. Kept apart because they are two
 * different lines in two different classes: if HusKyCode moves one, the build
 * names the one that moved.
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */

export default {
  name: 'menu-refresh-visible',
  find: "const refreshContainer = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span').hide();",
  replace: "const refreshContainer = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span');",
  occurrences: 1
};
