/**
 * PSNP++ - Patch: rename the floating menu
 * ========================================
 *
 * "PSNP+ Menu" becomes "PSNP++ Menu".
 *
 * Separate from the styling patch on purpose. They sit two lines apart in the
 * same class, so it is tempting to fold them together — but they fail for
 * different reasons. If HusKyCode restyles the menu, the colours stop matching
 * and the name is untouched; if he renames it, the reverse. Kept apart, the
 * build names whichever one actually moved. Folded together, one change would
 * take both out and hide which.
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */

export default {
  name: 'rename-floating-menu',
  find: ".setText('PSNP+ Menu')",
  replace: ".setText('PSNP++ Menu')",
  occurrences: 1
};
