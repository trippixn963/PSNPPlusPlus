/**
 * PSNP++ - Theme
 * ==============
 *
 * The whole visual language of the widget: four trophy metals over graphite,
 * one engraved type treatment, and one scoped stylesheet.
 *
 * WHY THESE COLOURS. This script lives on psnprofiles.com, beside PSNP+, whose
 * own palette is greys plus gold and bronze (#e0e0e0 / #646464 / #292b2d /
 * #f0c117 / #E2AA51 / #DD8301 / #a77b34) with #ba4b47 for errors — a trophy
 * palette. The chip used to ignore all of it and paint itself in stock
 * Bootstrap (#198754 / #6c757d / #dc3545), which said nothing about trophies,
 * nothing about sync, and could have come off any admin dashboard.
 *
 * So the states are a TIER LADDER, the way everything else in this hobby is
 * ranked: bronze is the entry tier (nothing earned yet — sync is not set up),
 * silver is work in progress, gold is an offer worth taking, platinum is the
 * completed set. Settled states are LOCKED: on PSNProfiles an unearned trophy
 * is a dim grey silhouette, so a chip with nothing to say is an unlit engraved
 * plate. The metal only exists while the chip needs the user, which is what
 * makes it mean anything.
 *
 * SCOPING. Every selector below starts at #${INDICATOR_ID} or #${PANEL_ID}, and
 * every rule targets a .psnppp-* class rather than a bare element. We are a
 * guest on a page we do not own: nothing here may reach out of the widget, and
 * page styles must not reach in. Class selectors (0,2,0) are used instead of
 * element selectors so an ordinary `.form input` on the host page cannot win a
 * specificity tie against us.
 *
 * There are exactly TWO `!important` declarations, both on .psnppp-link, and
 * they are there because specificity cannot save us from an author
 * `!important`: a page rule as ordinary as `a { color: #06c !important }` beats
 * any selector we can write. Links are the most globally-styled element on the
 * web, and those two properties are the difference between "our design" and
 * "obviously broken" — a blue underlined TRIPPIXN.COM in a graphite footer
 * reads as a bug. Nothing else here gets one; if a third is ever tempting,
 * that is a sign the widget is fighting the page rather than sitting on it.
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */

/**
 * The palette, as four named groups.
 *
 * `bronze`, `gold` and `fault` are PSNP+'s own hex values, verbatim, so the two
 * widgets read as siblings rather than as strangers sharing a page. `plate` is
 * one step darker than PSNP+'s #292b2d for the same reason in reverse — close
 * enough to belong, different enough to tell apart at a glance.
 */
export const TOKENS = {
  plate: '#1b1d1f',
  sunken: '#141618',
  control: '#24272a',
  hairline: '#26292b',
  edge: '#33373a',
  quiet: '#646464',
  engrave: '#8a8d91',
  data: '#cfd2d5',
  bright: '#e0e0e0',
  bronze: '#dd8301',
  bronzeDim: '#a77b34',
  silver: '#c3c6cc',
  gold: '#f0c117',
  platinum: '#a9d6ea',
  fault: '#ba4b47',
  faultDim: '#5c3230',
  // The same red as `fault`, in the form rgba() needs. Written out because a
  // hand-converted `rgba(186, 75, 71, …)` elsewhere in the sheet would keep the
  // old colour after `fault` changed, with nothing to catch it.
  faultRgb: '186, 75, 71'
};

/**
 * The metal each state can wear, and the colour of that metal.
 *
 * The single source of truth: the `.psnppp-tier-*` rules are GENERATED from
 * this below, and indicator.mjs's STATES table names these keys. A tier added
 * here and forgotten in the CSS used to be a silently unstyled chip.
 *
 * `locked` maps to no metal at all — it is the settled look, and it is the one
 * entry whose colour is the plate's own edge.
 */
export const TIERS = {
  locked: TOKENS.edge,
  bronze: TOKENS.bronze,
  silver: TOKENS.silver,
  gold: TOKENS.gold,
  platinum: TOKENS.platinum,
  fault: TOKENS.fault
};

/** The settled tier: no metal, and the only one that lets the chip recede. */
export const LOCKED_TIER = 'locked';

export const INDICATOR_ID = 'psnppp-indicator';
export const PANEL_ID = 'psnppp-panel';

/**
 * Layout numbers that BOTH the stylesheet and the positioning code need.
 *
 * They live here, and the CSS below interpolates them, because the alternative
 * is a literal in the sheet and a copy of it in JS: widen the panel in CSS
 * alone and panel.mjs keeps clamping against the old width, so the panel hangs
 * off the edge of the screen with nothing to catch it.
 */
export const PANEL_WIDTH_PX = 300;
export const EDGE_INSET_PX = 12;
export const CHIP_FALLBACK_SIZE = { width: 120, height: 26 };
/**
 * How long the post-drop snap to an edge takes. Shared with indicator.mjs,
 * which uses the same number for the timeout that lifts the transition class
 * back off — a mismatch there would either cut the animation short or leave
 * the chip laggily tracking the next drag through a stale transition.
 */
export const DOCK_SNAP_MS = 220;
const Z_LAYER = 99999;
const PLATE_SHADOW = '0 1px 4px rgba(0, 0, 0, .45)';

/**
 * Type, in three roles, none of them loaded over the network.
 *
 * A userscript that pulls a webfont into someone else's page costs them a
 * request and adds a CSP surface for a decoration — so the personality has to
 * come from the treatment, not the family.
 *
 * DISPLAY is how trophy plates are actually engraved: small, heavy, uppercase,
 * widely tracked. DATA is monospace with tabular figures, because revisions,
 * list counts and timestamps are columns of numbers, and because PSNP+ itself
 * reaches for `font-family: monospace` for the same job. BODY is a plain system
 * sans, deliberately unremarkable, so the engraved caps stay the widget's voice.
 */
export const TYPE = {
  display: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  data: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  body: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
};


const STYLE_ID = 'psnppp-style';

/** Documents that already carry the stylesheet. Keyed weakly so tests can't leak. */
const styled = new WeakSet();

import { MARK_ICON } from './mark-icon.mjs';

const t = TOKENS;

/** The metal rules, one pair per tier, generated so they cannot go missing. */
const tierRules = Object.entries(TIERS).map(([tier, color]) => `
#${INDICATOR_ID}.psnppp-tier-${tier} .psnppp-rail { background: ${color}; }
#${INDICATOR_ID}.psnppp-tier-${tier} .psnppp-label { color: ${tier === LOCKED_TIER ? t.engrave : color}; }`
).join('');

/** Every tier except the settled one stops the chip receding. */
const litTiers = Object.keys(TIERS)
  .filter(tier => tier !== LOCKED_TIER)
  .map(tier => `#${INDICATOR_ID}.psnppp-tier-${tier}`)
  .join(',\n');

export const CSS = `
/* A reset that cannot leak: the universal selector is fenced behind our own
   ids, so it only ever reaches our own descendants. psnprofiles.com sets
   margins, floats and text-shadows on plenty of generic elements, and any of
   them landing inside the widget would be a page style reaching in. */
#${INDICATOR_ID},
#${INDICATOR_ID} *,
#${PANEL_ID},
#${PANEL_ID} * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  text-align: left;
  float: none;
  text-shadow: none;
  /* border:0 is not tidiness. The mark is built from bare i elements, and i is
     exactly the tag an icon-font site styles globally — a page rule as ordinary
     as "i { border: 1px solid }" (no !important needed) puts a box around each
     arm and thickens it. Every intentional border in this sheet is declared
     later at equal-or-greater specificity, so all of them survive.
     NOTE: this whole sheet is a template literal. No backticks in comments. */
  border: 0;
}

/* ---- the chip ---------------------------------------------------------- */

#${INDICATOR_ID} {
  position: fixed;
  right: ${EDGE_INSET_PX}px;
  bottom: ${EDGE_INSET_PX}px;
  z-index: ${Z_LAYER};
  display: inline-flex;
  align-items: stretch;
  gap: 0;
  max-width: calc(100vw - ${EDGE_INSET_PX * 2}px);
  min-height: ${CHIP_FALLBACK_SIZE.height - 2}px;
  overflow: hidden;
  background: ${t.plate};
  border: 1px solid ${t.edge};
  border-radius: 3px;
  box-shadow: ${PLATE_SHADOW};
  cursor: pointer;
  user-select: none;
  touch-action: none;
  opacity: .55;
  transition: opacity .18s ease, border-color .18s ease;
}

/* PSNP+'s own floating menu sits at opacity .2 until you touch it. Fading at
   rest is this page's established manner for a guest widget; .55 keeps ours
   legible while still receding. */
#${INDICATOR_ID}:hover,
#${INDICATOR_ID}:focus-visible,
#${INDICATOR_ID}.psnppp-open {
  opacity: 1;
}

#${INDICATOR_ID}:focus-visible {
  outline: 2px solid ${t.platinum};
  outline-offset: 2px;
}

/* The post-drop snap to an edge. Scoped to its own class rather than folded
   into the base transition list above: a drag has to track the pointer with
   no lag, and only the deliberate snap that happens AFTER release may ease.
   The class is added for exactly the snap's duration and lifted after, so an
   ordinary drag never picks up this transition by accident. */
#${INDICATOR_ID}.psnppp-dock-snap {
  transition: left ${DOCK_SNAP_MS}ms cubic-bezier(.22, .61, .36, 1),
    top ${DOCK_SNAP_MS}ms cubic-bezier(.22, .61, .36, 1);
}

#${INDICATOR_ID} .psnppp-rail {
  flex: 0 0 3px;
  width: 3px;
  align-self: stretch;
  background: ${t.edge};
  transition: background .18s ease;
}

#${INDICATOR_ID} .psnppp-label {
  flex: 0 1 auto;
  padding: 6px 10px 6px 8px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-family: ${TYPE.display};
  font-size: 10px;
  font-weight: 700;
  font-style: normal;
  line-height: 12px;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: ${t.engrave};
  transition: color .18s ease;
}

/* Locked is the settled look: an unlit plate. No metal, no gradient, nothing
   to look at — which is the point, because nothing is being asked of anyone. */
${tierRules}

/* Anything with a metal has something to say, so it stops receding. */
${litTiers} {
  opacity: 1;
}

/* An error is the one state that may not be mistaken for the page. Full
   opacity, the only warm hue in the widget, and the plate's own edge turns. */
#${INDICATOR_ID}.psnppp-tier-fault {
  border-color: ${t.fault};
  box-shadow: ${PLATE_SHADOW}, 0 0 0 1px rgba(${t.faultRgb}, .35);
}

/* THE SIGNATURE — the pop.
   One specular band crosses the plate the moment a state arrives that needs
   the user, and never again until the next one. It is the trophy-unlock shine
   from the console this hobby lives on, spent once, on the only event worth
   spending it on. Locked states never get it. */
#${INDICATOR_ID} .psnppp-sheen {
  position: absolute;
  top: 0;
  left: 0;
  width: 40%;
  height: 100%;
  pointer-events: none;
  opacity: 0;
  background: linear-gradient(
    100deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, .16) 50%,
    rgba(255, 255, 255, 0) 100%
  );
}

#${INDICATOR_ID}.psnppp-pop .psnppp-sheen {
  animation: psnppp-sweep .52s cubic-bezier(.22, .61, .36, 1) 1;
}

@keyframes psnppp-sweep {
  0%   { opacity: 0; transform: translateX(-120%); }
  12%  { opacity: 1; }
  100% { opacity: 0; transform: translateX(340%); }
}


/* ---- the panel --------------------------------------------------------- */

#${PANEL_ID} {
  position: fixed;
  z-index: ${Z_LAYER};
  width: ${PANEL_WIDTH_PX}px;
  max-width: calc(100vw - ${EDGE_INSET_PX * 2}px);
  max-height: calc(100vh - ${EDGE_INSET_PX * 2}px);
  overflow: auto;
  background: ${t.plate};
  border: 1px solid ${t.edge};
  border-radius: 3px;
  box-shadow: 0 6px 22px rgba(0, 0, 0, .55);
  color: ${t.engrave};
  font-family: ${TYPE.body};
  font-size: 12px;
  line-height: 1.45;
}

#${PANEL_ID} .psnppp-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 9px 10px;
  border-bottom: 1px solid ${t.edge};
}

/* The mark, drawn rather than fetched.
   Same geometry and tokens as scripts/icon.html, built from two boxes per
   glyph: no image request, so nothing to 404 and nothing for psnprofiles.com's
   CSP to refuse, and it stays crisp at any zoom.

   Each plus is ONE element: the box is the vertical stroke, its ::before is the
   crossbar. Sized in fractional pixels because the crossbar has to sit centred
   on the arm — round it and the cross lands half a pixel off and reads as a
   smear rather than a glyph. */
#${PANEL_ID} .psnppp-mark,
#${INDICATOR_ID} .psnppp-mark {
  position: relative;
  flex: 0 0 auto;
  width: 18px;
  height: 18px;
}

/* Only the PANEL's mark gets a plate of its own. The chip already IS a plate,
   and nesting one inside the other is a box in a box: it reads as a stray
   button sitting inside the status pill rather than as a wordmark. */
#${PANEL_ID} .psnppp-mark {
  border-radius: 4px;
  background:
    radial-gradient(120% 100% at 22% 8%, rgba(255,255,255,.07), rgba(255,255,255,0) 55%),
    linear-gradient(158deg, ${t.control} 0%, ${t.plate} 48%, ${t.sunken} 100%);
  box-shadow:
    inset 0 0 0 1px rgba(169,214,234,.16),
    inset 0 1px 0 rgba(255,255,255,.05);
}

/* Proportions taken from scripts/icon.html rather than guessed, so the mark and
   the installed icon are the same drawing at two sizes:
     glyph pair : plate  = 0.62   (11.2px of 18)
     stroke     : arm    = 0.34   (1.8px of 5.2)
     gap        : glyph  = 0.18   (0.9px)
   The first version filled 89% of the plate and the arms ran almost to the
   edge — it read as crowded rather than as a mark with air around it. */
#${PANEL_ID} .psnppp-mark i,
#${INDICATOR_ID} .psnppp-mark i {
  position: absolute;
  top: 6.4px;
  width: 1.8px;
  height: 5.2px;
  border-radius: 1px;
  background: linear-gradient(180deg, #ffdf72 0%, ${t.gold} 46%, #c8960b 100%);
}
#${PANEL_ID} .psnppp-mark i::before,
#${INDICATOR_ID} .psnppp-mark i::before {
  content: '';
  position: absolute;
  left: -1.7px;
  top: 1.7px;
  width: 5.2px;
  height: 1.8px;
  border-radius: 1px;
  background: inherit;
}
#${PANEL_ID} .psnppp-mark i:first-child,
#${INDICATOR_ID} .psnppp-mark i:first-child { left: 5.1px; }
#${PANEL_ID} .psnppp-mark i:last-child,
#${INDICATOR_ID} .psnppp-mark i:last-child { right: 5.1px; }

/* The chip is inline-flex with align-items:stretch, and an item with a definite
   height does not stretch — so without this the mark pins to the top edge and
   sits 6px above the label's optical centre. The margin gives it the same 8px
   inset the label already has. */
/* The chip shows the REAL icon, not a CSS approximation of it.
   Drawing the mark by hand to "match" the icon is what produced two glyphs
   with different proportions, different spacing, and an off-centre drift —
   three rounds of fixing a copy instead of using the original. This is
   assets/icon-round-48.png inlined by scripts/make-icon.mjs from the same
   render, so the chip and the installed icon cannot disagree.

   A data URI, not a URL: a userscript on someone else's page must not depend
   on a request that can 404, and the host CSP has nothing to refuse. */
#${INDICATOR_ID} .psnppp-mark {
  align-self: center;
  margin-left: 7px;
  width: 16px;
  height: 16px;
  background-image: url("${MARK_ICON}");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

/* The two <i> are the panel's glyph boxes; the chip draws from the image. */
#${INDICATOR_ID} .psnppp-mark i { display: none; }


#${PANEL_ID} .psnppp-brand {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

/* The version sits with the wordmark rather than in the footer: it is the first
   thing anyone needs when reporting that something is wrong. */
#${PANEL_ID} .psnppp-version {
  font-family: ${TYPE.display};
  font-size: 9px;
  letter-spacing: .08em;
  color: ${t.quiet};
  padding: 1px 5px;
  border: 1px solid ${t.hairline};
  border-radius: 999px;
  white-space: nowrap;
}

/* Footer: two quiet links, weighted below everything actionable above them. */
#${PANEL_ID} .psnppp-foot {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-top: 1px solid ${t.edge};
  background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.18) 100%);
}

#${PANEL_ID} .psnppp-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border: 1px solid ${t.hairline};
  border-radius: 5px;
  background: ${t.control};
  font-family: ${TYPE.display};
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .1em;
  text-transform: uppercase;
  transition: color 120ms ease, border-color 120ms ease, background 120ms ease;
  /* The sheet's only two !important declarations. See the header: specificity
     cannot beat an author !important, and "a { color: #06c !important }" is an
     ordinary thing for a site to ship. Blue underlined links in a graphite
     footer read as broken, not as different. */
  color: ${t.engrave} !important;
  text-decoration: none !important;
}
#${PANEL_ID} .psnppp-link:hover {
  color: ${t.bright} !important;
  border-color: ${t.edge};
  background: ${t.plate};
}
#${PANEL_ID} .psnppp-link svg { width: 11px; height: 11px; fill: currentColor; display: block; }
#${PANEL_ID} .psnppp-foot .psnppp-spacer { flex: 1 1 auto; }

#${PANEL_ID} .psnppp-title {
  font-family: ${TYPE.display};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: ${t.engrave};
}

#${PANEL_ID} .psnppp-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid ${t.edge};
}

#${PANEL_ID} .psnppp-tab {
  flex: 1 1 0;
  padding: 8px 4px;
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-family: ${TYPE.display};
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .12em;
  text-transform: uppercase;
  text-align: center;
  color: ${t.quiet};
}

#${PANEL_ID} .psnppp-tab:hover { color: ${t.engrave}; }

/* Deliberately NOT gold. Gold is spent once in this panel, on Save — the one
   control that writes anything. A gold tab underline competed with it and made
   "which tab am I on" look as urgent as "this is the button that commits". */
#${PANEL_ID} .psnppp-tab[aria-selected="true"] {
  color: ${t.bright};
  border-bottom-color: ${t.bright};
}

#${PANEL_ID} .psnppp-pane { padding: 10px; }

#${PANEL_ID} .psnppp-field { margin-bottom: 10px; }

#${PANEL_ID} .psnppp-fieldlabel {
  display: block;
  margin-bottom: 4px;
  font-family: ${TYPE.display};
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: ${t.quiet};
}

#${PANEL_ID} .psnppp-input {
  display: block;
  width: 100%;
  padding: 6px 7px;
  background: ${t.sunken};
  border: 1px solid ${t.edge};
  border-radius: 2px;
  font-family: ${TYPE.data};
  font-size: 11px;
  line-height: 1.4;
  color: ${t.bright};
}

#${PANEL_ID} .psnppp-input:focus-visible {
  outline: 2px solid ${t.platinum};
  outline-offset: 1px;
}

#${PANEL_ID} .psnppp-hint {
  margin-top: 4px;
  font-size: 11px;
  color: ${t.quiet};
}

#${PANEL_ID} .psnppp-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 7px 0;
  border-top: 1px solid ${t.hairline};
}

#${PANEL_ID} .psnppp-row:first-child { border-top: 0; }

#${PANEL_ID} .psnppp-rowmain {
  flex: 1 1 auto;
  min-width: 0;
  font-family: ${TYPE.data};
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: ${t.data};
  overflow-wrap: anywhere;
}

#${PANEL_ID} .psnppp-rowmeta {
  display: block;
  font-size: 10px;
  color: ${t.quiet};
}

#${PANEL_ID} .psnppp-empty {
  padding: 4px 0 2px;
  color: ${t.quiet};
}

#${PANEL_ID} .psnppp-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 2px;
}

#${PANEL_ID} .psnppp-btn {
  padding: 5px 10px;
  background: ${t.control};
  border: 1px solid ${t.edge};
  border-radius: 2px;
  cursor: pointer;
  font-family: ${TYPE.display};
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: ${t.engrave};
}

#${PANEL_ID} .psnppp-btn:hover { border-color: ${t.quiet}; color: ${t.bright}; }

#${PANEL_ID} .psnppp-btn:focus-visible {
  outline: 2px solid ${t.platinum};
  outline-offset: 1px;
}

#${PANEL_ID} .psnppp-btn-key { color: ${t.gold}; border-color: ${t.bronzeDim}; }
#${PANEL_ID} .psnppp-btn-key:hover { color: ${t.gold}; border-color: ${t.gold}; }

#${PANEL_ID} .psnppp-btn-danger { color: ${t.fault}; border-color: ${t.faultDim}; }
#${PANEL_ID} .psnppp-btn-danger:hover { color: ${t.fault}; border-color: ${t.fault}; }

#${PANEL_ID} .psnppp-close {
  padding: 2px 6px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 2px;
  cursor: pointer;
  font-family: ${TYPE.body};
  font-size: 14px;
  line-height: 1;
  color: ${t.quiet};
}

#${PANEL_ID} .psnppp-close:hover { color: ${t.bright}; }

#${PANEL_ID} .psnppp-close:focus-visible {
  outline: 2px solid ${t.platinum};
  outline-offset: 1px;
}

#${PANEL_ID} .psnppp-message {
  padding: 8px 10px;
  border-top: 1px solid ${t.edge};
  font-size: 11px;
  color: ${t.engrave};
  overflow-wrap: anywhere;
}

#${PANEL_ID} .psnppp-message-error {
  color: ${t.fault};
  background: rgba(${t.faultRgb}, .08);
}

/* Full width, under the row it belongs to. Sitting beside the timestamp
   squeezed both into two ragged columns and put "Replace lists" — the only
   destructive control in the widget — where it read as an afterthought. */
#${PANEL_ID} .psnppp-confirm {
  flex: 1 0 100%;
  padding: 4px 0 2px;
  color: ${t.engrave};
}

#${PANEL_ID} .psnppp-confirm .psnppp-actions { padding-top: 6px; }

/* The quality floor, not announced anywhere in the UI: a widget that animates
   through a vestibular disorder is a bug, and every transition above is
   decoration over an instant state change. */
@media (prefers-reduced-motion: reduce) {
  #${INDICATOR_ID},
  #${INDICATOR_ID} .psnppp-rail,
  #${INDICATOR_ID} .psnppp-label {
    transition: none;
  }
  #${INDICATOR_ID}.psnppp-pop .psnppp-sheen { animation: none; }
  /* Same id+class specificity as the rule that turns the snap on, so this
     wins on being LATER in the sheet rather than needing !important — the
     same reasoning theme.mjs already documents for every other selector here. */
  #${INDICATOR_ID}.psnppp-dock-snap { transition: none; }
}

/* Narrow viewports: the plate keeps its metal and loses its width. */
@media (max-width: 420px) {
  #${INDICATOR_ID} .psnppp-label { padding: 6px 8px 6px 6px; max-width: 46vw; }
  #${PANEL_ID} { width: calc(100vw - ${EDGE_INSET_PX * 2}px); }
}
`;

/**
 * Put the stylesheet in the document, once.
 *
 * Tolerant of a document that has no head (a `@run-at document-start` race, or
 * the minimal fakes the tests build): it degrades to no styles rather than
 * throwing out of createIndicator, which would leave the user with no chip at
 * all — the same reasoning as start()'s migration try/catch.
 */
export function installStyles(doc) {
  if (!doc || styled.has(doc)) return null;
  // The WeakSet is module state, so a second evaluation of this module — the
  // bundle imported twice, or an old and a new version of the script both
  // enabled — starts with an empty one and would append a second full copy of
  // the sheet. Ask the document, which is the authority.
  if (doc.getElementById?.(STYLE_ID)) {
    styled.add(doc);
    return null;
  }
  const host = doc.head ?? doc.documentElement ?? doc.body;
  if (!host || typeof host.appendChild !== 'function') return null;
  if (typeof doc.createElement !== 'function') return null;

  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.textContent = CSS;
  host.appendChild(style);
  styled.add(doc);
  return style;
}
