/**
 * PSNP++ - Patch: skip the remove-a-game confirmation
 * ===================================================
 *
 * PSNP+ asks "Are you sure you want to remove <title>?" every time a game is
 * taken out of a list. This answers it.
 *
 * Why a patch and not an override: PSNP+ runs in its own userscript realm, so
 * its bare `confirm(...)` resolves to a global PSNP++ cannot reach from the
 * outside — proven by an override that installed correctly on the page's
 * window and was never consulted. Editing the call is the only route left that
 * does not involve reimplementing PSNP+'s delete path against its DOM.
 *
 * Reads a plain localStorage flag rather than GM storage because it has to
 * decide synchronously, inside a click handler, in PSNP+'s realm. Absent means
 * on — the patch exists because the user asked for this behaviour, so the
 * default matches the request, and the settings panel writes 'false' to turn it
 * back off.
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */

export default {
  name: 'skip-remove-confirm',

  /**
   * Anchored on PSNP+'s exact call. If HusKyCode rewords the prompt, moves the
   * call, or changes how the result is used, this string stops matching and the
   * BUILD FAILS naming this patch — which is the entire point of expressing the
   * change this way rather than editing the bundle. An upstream change becomes
   * a build error at merge time instead of a silent behaviour change weeks
   * later in the browser.
   */
  find: 'const result = confirm(`Are you sure you want to remove ${listItem.title}?`);',

  /**
   * Deliberately keeps `confirm` on the false path. Turning the feature off has
   * to give back PSNP+'s real dialog, not a silent no-op — a toggle that
   * removed the safeguard AND the prompt would be strictly worse than either.
   */
  replace: [
    'const result = (localStorage.getItem("psnppp.skipRemoveConfirm") !== "false")',
    '  ? true',
    '  : confirm(`Are you sure you want to remove ${listItem.title}?`);'
  ].join('\n'),

  /** Exactly one call site. More would mean the bundle changed shape. */
  occurrences: 1
};
