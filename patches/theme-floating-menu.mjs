/**
 * PSNP++ - Patch: strip the floating menu's inline skin
 * =====================================================
 *
 * PSNP+ writes its menu's entire appearance into a `style` ATTRIBUTE. Inline
 * styles outrank any stylesheet, so as long as that attribute carries the skin,
 * the only way to restyle the menu is to rewrite the attribute — which is what
 * this patch used to do, one hardcoded hex at a time, with every PSNP++ token
 * duplicated here as a literal because a patch cannot import from PSNP++.
 *
 * So it no longer restyles anything. It DELETES the visual half of the
 * attribute and leaves the structural half — position, corner, z-index — which
 * is genuinely PSNP+'s business and which our stylesheet has no wish to own.
 * Everything that is a matter of appearance then lands in theme.mjs, next to
 * the chip and the panel it has to match, expressed in the same tokens and with
 * hover states and media queries a style attribute cannot express at all.
 *
 * The trailing comma this leaves behind on the last entry is valid JS.
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

  replace: "        ].join(' ');",

  occurrences: 1
};
