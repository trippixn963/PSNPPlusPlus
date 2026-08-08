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
 * SCOPING. Every selector below starts at #${INDICATOR_ID}, #${PANEL_ID}, or
 * PSNP+'s own menu class, and every rule targets a class rather than a bare
 * element. We are a guest on a page we do not own: nothing here may reach out
 * of the widget, and page styles must not reach in. Class selectors (0,2,0) are
 * used instead of element selectors so an ordinary `.form input` on the host
 * page cannot win a specificity tie against us.
 *
 * `!important` appears exactly twice, both in the menu block, both against
 * `margin` — PSNP+ sets `margin-top: 5px` INLINE on each of its buttons, and an
 * inline declaration cannot be outranked any other way. Two patches removed the
 * other inline styles at their source so nothing else here has to shout; if a
 * third `!important` ever seems necessary, the honest fix is another patch, not
 * another shout.
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

/*
 * PSNP+'s floating menu, by the class PSNP+ gives it.
 *
 * Imported rather than written out again: menu.mjs finds the menu with this
 * selector and this sheet skins it, and a second copy of the string is how one
 * of the two silently stops matching after a PSNP+ update.
 */
import { MENU_SELECTOR } from './menu.mjs';

const STYLE_ID = 'psnppp-style';

/** Documents that already carry the stylesheet. Keyed weakly so tests can't leak. */
const styled = new WeakSet();

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

/*
 * Hosted inside PSNP+'s floating menu.
 *
 * The menu is what floats, docks and drags in that mode, so the chip must stop
 * positioning itself — otherwise it stays pinned to the viewport while its own
 * container moves out from under it. Everything else about it (plate, rail,
 * tier colours, sheen) is inherited unchanged, which is the point: it is the
 * same control, not a second one styled to look like it.
 *
 * Sits AFTER the base rule so it wins on order alone: no !important, no
 * specificity games.
 */
#${INDICATOR_ID}.psnppp-hosted {
  position: static;
  right: auto;
  bottom: auto;
  margin-top: 6px;
  max-width: none;
  width: 100%;
  box-shadow: none;
  /* The host fades; we must not fade AGAIN inside it. Opacity multiplies down
     the tree, so .55 within their .2 rendered at .11. */
  opacity: 1;
}

/* ---- PSNP+'s floating menu, reskinned ----------------------------------- */

/*
 * The menu is the surface now — the chip is a row inside it — so it has to read
 * as one object with the chip and the panel rather than as a grey box one of
 * them happens to live in.
 *
 * Owned here rather than in the patch that used to rewrite PSNP+'s inline
 * style attribute. Two patches clear the way: theme-floating-menu strips the
 * visual half of that attribute, and menu-hover-in-css removes the handlers
 * that wrote opacity inline. What is left below is ordinary CSS, in the same
 * tokens as everything else, with no !important except where third-party
 * inline styles genuinely have to be outranked (marked, each time).
 */
${MENU_SELECTOR} {
  padding: 9px 10px 10px;
  border: 1px solid ${t.hairline};
  border-radius: 3px;
  background: ${t.plate};
  box-shadow: ${PLATE_SHADOW};
  color: ${t.data};
  font-family: ${TYPE.body};
  font-size: 12px;
  line-height: 1.45;
  min-width: 148px;
  /* The whole menu drags, so the whole menu must not be selectable: a drag
     across the title used to paint it blue and leave a selection behind. */
  user-select: none;
  cursor: grab;
  opacity: .55;
  transition: opacity .18s ease, border-color .18s ease;
}

${MENU_SELECTOR}:hover {
  opacity: 1;
  border-color: ${t.edge};
}

/* Raised by indicator.mjs for exactly the states that ask the user to act, and
   dropped again when the chip settles. Without it an update offer sat at the
   resting fade and went unread. */
${MENU_SELECTOR}.psnppp-attention {
  opacity: 1;
  border-color: ${t.bronzeDim};
}

/* Held down: the cursor is the only feedback that the grab took. */
${MENU_SELECTOR}:active {
  cursor: grabbing;
}

/* The title. PSNP+ emits a bare <b> inside a wrapper div. */
${MENU_SELECTOR} > div:first-child > b {
  display: block;
  margin-bottom: 8px;
  padding-bottom: 7px;
  border-bottom: 1px solid ${t.hairline};
  color: ${t.engrave};
  font-family: ${TYPE.display};
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .12em;
  text-transform: uppercase;
}

/*
 * PSNP+ separates its buttons with <br> and lays them out inline. Stacking them
 * as blocks and dropping the breaks gives one rhythm instead of two competing
 * ones — and means the spacing is a margin that can be reasoned about rather
 * than the height of a line box.
 */
${MENU_SELECTOR} br {
  display: none;
}

${MENU_SELECTOR} .button {
  display: block;
  width: 100%;
  box-sizing: border-box;
  /* Their own margin-top: 5px is set INLINE on each button, so this is one of
     the two places that has to outrank an inline style. */
  margin: 0 0 5px !important;
  padding: 6px 9px;
  border: 1px solid ${t.hairline};
  border-radius: 2px;
  background: ${t.control};
  color: ${t.data};
  font-family: ${TYPE.body};
  font-size: 11.5px;
  font-weight: 500;
  line-height: 1.3;
  text-align: left;
  text-decoration: none;
  text-shadow: none;
  cursor: pointer;
  transition: background .14s ease, border-color .14s ease, color .14s ease;
}

/* .button.grey is PSNP+'s own rule (background: #646464) and it is the class
   every one of these buttons carries, so it has to be answered directly. */
${MENU_SELECTOR} .button.grey {
  background: ${t.control};
}

${MENU_SELECTOR} .button:last-of-type {
  margin-bottom: 0 !important;
}

${MENU_SELECTOR} .button:hover,
${MENU_SELECTOR} .button.grey:hover {
  border-color: ${t.bronzeDim};
  background: ${t.sunken};
  color: ${t.bright};
}

${MENU_SELECTOR} .button:focus-visible {
  outline: 2px solid ${t.platinum};
  outline-offset: 1px;
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

/* The one control in this panel that commits the moment it is clicked, so it
   is set apart from the two fields above it by a rule rather than by wording. */
#${PANEL_ID} .psnppp-check {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid ${t.hairline};
}

#${PANEL_ID} .psnppp-checkbox {
  flex: 0 0 auto;
  width: 13px;
  height: 13px;
  margin: 0;
  accent-color: ${t.gold};
  cursor: pointer;
}

#${PANEL_ID} .psnppp-checkbox:focus-visible {
  outline: 2px solid ${t.platinum};
  outline-offset: 1px;
}

#${PANEL_ID} .psnppp-checklabel {
  flex: 1 1 auto;
  min-width: 0;
  font-family: ${TYPE.body};
  font-size: 11px;
  line-height: 1.4;
  color: ${t.bright};
  cursor: pointer;
}

/* The hint drops to its own full-width line under both. */
#${PANEL_ID} .psnppp-check .psnppp-hint { flex: 1 0 100%; margin-top: 2px; }

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
