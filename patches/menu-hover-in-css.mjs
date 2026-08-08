/**
 * PSNP++ - Patch: let CSS own the menu's hover fade
 * =================================================
 *
 * PSNP+ fades its menu by writing `opacity` as an INLINE style from its own
 * mouseenter/mouseleave handlers. That is the highest-priority declaration
 * there is short of `!important`, so every rule of ours that touched the
 * menu's opacity had to shout to be heard — and the one time it mattered, when
 * the chip needed to surface an update, it was a fight between a stylesheet and
 * a handler that would overwrite it on the next pointer move regardless.
 *
 * Removing the two writes moves the fade into theme.mjs as a plain `:hover`
 * rule, which is where a hover state belongs. Nothing has to shout afterwards.
 *
 * `_onShow` / `_onHide` are DELIBERATELY kept: they are real callbacks with a
 * real caller — the guide menu passes them to show and hide its refresh
 * container — and dropping them would silently break that. Only the two
 * `setCss('opacity', ...)` lines go.
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */

export default {
  name: 'menu-hover-in-css',

  find: [
    "            .mouseenter((_, el) => {",
    "            el.setCss('opacity', '1');",
    "            this._onShow();",
    "        })",
    "            .mouseleave((_, el) => {",
    "            el.setCss('opacity', '0.2');",
    "            this._onHide();",
    "        })"
  ].join('\n'),

  replace: [
    "            .mouseenter(() => {",
    "            this._onShow();",
    "        })",
    "            .mouseleave(() => {",
    "            this._onHide();",
    "        })"
  ].join('\n'),

  occurrences: 1
};
