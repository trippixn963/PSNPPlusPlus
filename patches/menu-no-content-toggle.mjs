/**
 * PSNP++ - Patch: stop the menu toggling its own content on hover
 * ===============================================================
 *
 * The profile menu is the only one of PSNP+'s four that passes `onShow` and
 * `onHide` callbacks, and both do one thing: show and hide the refresh text.
 * With menu-refresh-visible making that text permanent, the `onHide` half would
 * hide it again the first time the pointer left — so the callbacks go too.
 *
 * The FloatingMenu constructor defaults both to noops, so dropping the two
 * arguments is the whole change. `_onShow` and `_onHide` themselves stay in the
 * class (menu-hover-in-css keeps them deliberately): another caller may want
 * them, and this patch is about THIS menu's use of them, not about the hook.
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */

export default {
  name: 'menu-no-content-toggle',
  find: 'const floatingMenu = new _ui_FloatingMenu__WEBPACK_IMPORTED_MODULE_1__.FloatingMenu(menuWrapper, () => refreshContainer.show(), () => refreshContainer.hide());',
  replace: 'const floatingMenu = new _ui_FloatingMenu__WEBPACK_IMPORTED_MODULE_1__.FloatingMenu(menuWrapper);',
  occurrences: 1
};
