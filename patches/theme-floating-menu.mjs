/**
 * PSNP++ - Patch: the floating menu
 * =================================
 *
 * Renames PSNP+'s floating menu to PSNP++ and repaints it in the same graphite
 * and hairline the status chip and settings panel use, so the two halves stop
 * reading as two scripts sharing a page.
 *
 * The name is not vanity: this build IS PSNP+, so a menu labelled "PSNP+ Menu"
 * alongside a PSNP++ chip invites exactly the question of whether both are
 * somehow installed — the one thing the health check exists to warn about.
 *
 * Styled by patch rather than by stylesheet because the menu's look lives in an
 * inline `style` attribute, and inline styles beat any rule we could add without
 * `!important` on every line.
 *
 * The values are `theme.mjs`'s tokens, written literally: this string is spliced
 * into PSNP+'s bundle, which cannot import from PSNP++. Keeping them in step is
 * a manual job — the token names are named here so the next person knows which
 * ones to look at.
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */

export default {
  name: 'theme-floating-menu',

  find: [
    "            'background-color: #292b2d;',",
    "            'padding: 5px;',",
    "            'border: 1px solid #646464;',",
    "            'opacity: 0.2;',",
    "            'color: white;',",
    "            'border-radius: 5px;'",
    "        ].join(' ');"
  ].join('\n'),

  replace: [
    // TOKENS.plate / TOKENS.hairline / TOKENS.data / TOKENS.edge
    "            'background-color: #1b1d1f;',",
    "            'padding: 8px 10px;',",
    "            'border: 1px solid #26292b;',",
    "            'opacity: 0.55;',",
    "            'color: #cfd2d5;',",
    "            'border-radius: 6px;',",
    "            'font-size: 12px;',",
    "            'letter-spacing: 0.04em;',",
    "            'box-shadow: 0 2px 10px rgba(0,0,0,.45);'",
    "        ].join(' ');"
  ].join('\n'),

  occurrences: 1
};
