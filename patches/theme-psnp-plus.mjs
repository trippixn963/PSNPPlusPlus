/**
 * PSNP++ - Patch: repaint PSNP+'s one off-palette accent
 * ======================================================
 *
 * PSNP+ paints its version badge, a guide banner and one highlight rule with
 * `COLOR_PURPLE` — `#5865f2`, Discord's blurple. It is the most visible piece of
 * PSNP+ chrome on the page and it matches nothing else on a trophy site: not
 * psnprofiles' own palette, not PSNP+'s own golds and greys, and not PSNP++.
 *
 * One constant, four call sites, so a single line re-themes all of them
 * consistently — which is the whole reason to patch the constant rather than
 * each usage.
 *
 * Bronze rather than gold: every one of those surfaces sets white text on this
 * colour, and #f0c117 with white on top is unreadable. #a77b34 is PSNP+'s own
 * dimmer bronze, already in its palette, and carries white comfortably.
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */

export default {
  name: 'theme-psnp-plus-accent',
  find: "const COLOR_PURPLE = '#5865f2';",
  replace: "const COLOR_PURPLE = '#a77b34';",
  occurrences: 1
};
