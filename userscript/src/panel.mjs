/**
 * PSNP++ - Settings Panel
 * =======================
 *
 * The widget's only surface that is not the chip: credentials, backups, log.
 *
 * It exists to delete three `window.prompt`/`window.alert` flows, one of which
 * asked the user to type `1`, `2` or `3` into a browser dialog to choose
 * between "change my key", "restore a backup that overwrites my lists" and
 * "show me a log". A one-character typo there is the difference between reading
 * a log and replacing every list on the device.
 *
 * MANNERS. This panel is a guest on psnprofiles.com:
 *   - no backdrop, so it can never swallow a click meant for the page;
 *   - nothing is focused on open, so it never takes the caret from the page;
 *   - no listener is installed on the host document — Escape works while focus
 *     is inside the panel, and the close button always works;
 *   - every class is `psnppp-*` under `#psnppp-panel` (see theme.mjs).
 *
 * Presentation only. Every decision that touches stored data — validating an
 * endpoint, keeping a blank key, the order a restore reads and writes in — is
 * the caller's, handed in as `onSave` and `onRestore`, and both report back as
 * `{ ok, message }` so a failure has somewhere to land ON SCREEN. The old code
 * surfaced those as `window.alert`; swallowing them here instead would take the
 * escape hatch's only error channel away.
 *
 * Developer: Trippixn
 * Website:   https://trippixn.com
 * Discord:   discord.gg/syria
 */

import { describeStoredKey } from './config.mjs';
import { clampAxis } from './indicator.mjs';
import { PANEL_ID, PANEL_WIDTH_PX, EDGE_INSET_PX, CHIP_FALLBACK_SIZE } from './theme.mjs';

const TABS = [
  { name: 'sync', label: 'Sync' },
  { name: 'backups', label: 'Backups' }
];

/**
 * Anything a caught value can be turned into for a person to read.
 *
 * Total by construction. `String(error?.message ?? error)` renders `throw null`
 * as the word "null" and `throw undefined` as "undefined" — and an object whose
 * `message` getter throws makes the coercion fault INSIDE the catch block that
 * was meant to contain it.
 */
export function describeFailure(error, fallback) {
  try {
    const text = typeof error?.message === 'string' && error.message
      ? error.message
      : String(error);
    return text && text !== 'null' && text !== 'undefined' && text !== '[object Object]'
      ? `${fallback}: ${text}`
      : `${fallback}.`;
  } catch {
    return `${fallback}.`;
  }
}

const stamp = at => {
  const date = new Date(at);
  return Number.isNaN(date.getTime()) ? 'unknown time' : date.toLocaleString();
};

const countOf = (n, noun) => `${n} ${noun}${n === 1 ? '' : 's'}`;

export function createSettingsPanel({
  doc = globalThis.document,
  anchor = null,
  // Which edge the chip is docked to. Defaults 'right' to match the CSS
  // corner the chip sits in before it has ever been dragged (see
  // indicator.mjs's getSide) — that is also the one case `anchor` can be
  // non-null while genuinely undocked, so the default has to agree with it.
  side = 'right',
  config = { endpoint: '', key: '' },
  backups = [],
  // Refusing defaults, not permissive ones. An unwired panel must not report a
  // saved credential or a completed restore.
  onSave = async () => ({ ok: false, message: 'Settings are not wired up.' }),
  onRestore = async () => ({ ok: false, message: 'Restore is not wired up.' }),
  onClose = () => {},
  // The server's own revision history, newest first: [{revision, updatedAt, size}].
  // Empty when the server could not be reached — the panel must still open.
  // Why it is empty, when that is not simply "there is none".
  // Shown beside the wordmark. Passed in rather than read here so the panel
  // stays free of GM_info and keeps rendering in node under the test runner.
  version = null
} = {}) {
  const make = (tag, className, text) => {
    const node = doc.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };
  const tag = (node, value) => {
    node.setAttribute('data-psnppp', value);
    return node;
  };
  const show = (node, visible) => {
    node.hidden = !visible;
    node.style.display = visible ? '' : 'none';
  };

  const element = make('div');
  element.id = PANEL_ID;
  element.setAttribute('role', 'dialog');
  element.setAttribute('aria-label', 'PSNP++ settings');

  // --- header --------------------------------------------------------------

  const head = make('div', 'psnppp-head');

  // Brand: the mark, the wordmark, then the version. The mark is drawn from two
  // boxes per glyph in CSS rather than loaded as an image — no request to fail,
  // nothing for the host page's CSP to block, crisp at any zoom.
  const brand = make('div', 'psnppp-brand');
  const mark = tag(make('span', 'psnppp-mark'), 'mark');
  mark.setAttribute('aria-hidden', 'true');
  mark.appendChild(make('i'));
  mark.appendChild(make('i'));
  brand.appendChild(mark);
  brand.appendChild(make('span', 'psnppp-title', 'PSNP++'));
  if (version) brand.appendChild(tag(make('span', 'psnppp-version', `v${version}`), 'version'));
  head.appendChild(brand);

  const closeButton = tag(make('button', 'psnppp-close', '×'), 'close');
  closeButton.setAttribute('type', 'button');
  closeButton.setAttribute('aria-label', 'Close settings');
  closeButton.addEventListener('click', () => close());
  head.appendChild(closeButton);
  element.appendChild(head);

  // --- tabs ----------------------------------------------------------------

  const tabBar = make('div', 'psnppp-tabs');
  tabBar.setAttribute('role', 'tablist');
  const tabButtons = new Map();
  const panes = new Map();

  for (const { name, label } of TABS) {
    const button = tag(make('button', 'psnppp-tab', label), `tab-${name}`);
    button.setAttribute('type', 'button');
    button.setAttribute('role', 'tab');
    button.addEventListener('click', () => selectTab(name));
    tabBar.appendChild(button);
    tabButtons.set(name, button);
  }
  element.appendChild(tabBar);

  // --- sync pane -----------------------------------------------------------

  const syncPane = tag(make('div', 'psnppp-pane'), 'pane-sync');

  const endpointField = make('div', 'psnppp-field');
  const endpointLabel = make('label', 'psnppp-fieldlabel', 'Endpoint');
  endpointLabel.setAttribute('for', 'psnppp-endpoint');
  endpointField.appendChild(endpointLabel);
  const endpointInput = tag(make('input', 'psnppp-input'), 'endpoint');
  endpointInput.id = 'psnppp-endpoint';
  endpointInput.setAttribute('type', 'text');
  endpointInput.setAttribute('spellcheck', 'false');
  endpointInput.setAttribute('autocomplete', 'off');
  // The endpoint is not a secret and is tedious to retype, so it is pre-filled.
  endpointInput.value = config?.endpoint ?? '';
  endpointField.appendChild(endpointInput);
  syncPane.appendChild(endpointField);

  const keyField = make('div', 'psnppp-field');
  const keyLabel = make('label', 'psnppp-fieldlabel', 'Sync key');
  keyLabel.setAttribute('for', 'psnppp-key');
  keyField.appendChild(keyLabel);
  const keyInput = tag(make('input', 'psnppp-input'), 'key');
  keyInput.id = 'psnppp-key';
  keyInput.setAttribute('type', 'password');
  keyInput.setAttribute('autocomplete', 'off');
  // Starts EMPTY, always. This panel renders inside psnprofiles.com; painting
  // the live credential into a field on a third party's page is exactly what
  // the old prompt was fixed for. The hint below reports only THAT a key is
  // stored — never any part of it, and not even its length.
  keyInput.value = '';
  keyField.appendChild(keyInput);
  keyField.appendChild(tag(
    make('div', 'psnppp-hint', describeStoredKey(config?.key)),
    'keyhint'
  ));
  syncPane.appendChild(keyField);

  const syncActions = make('div', 'psnppp-actions');
  const cancelButton = tag(make('button', 'psnppp-btn', 'Cancel'), 'cancel');
  cancelButton.setAttribute('type', 'button');
  cancelButton.addEventListener('click', () => close());
  syncActions.appendChild(cancelButton);

  const saveButton = tag(make('button', 'psnppp-btn psnppp-btn-key', 'Save'), 'save');
  saveButton.setAttribute('type', 'button');
  // `.catch`, not `void`: submit's tail (showMessage, close, and through it the
  // caller's onClose) is outside its own try, and a throw there would discard a
  // save that actually happened, in silence.
  saveButton.addEventListener('click', () => {
    submit().catch(error => {
      showMessage(describeFailure(error, 'Could not save your settings'), { error: true });
    });
  });
  syncActions.appendChild(saveButton);
  syncPane.appendChild(syncActions);

  element.appendChild(syncPane);
  panes.set('sync', syncPane);

  // --- backups pane --------------------------------------------------------

  const backupsPane = tag(make('div', 'psnppp-pane'), 'pane-backups');
  if (backups.length === 0) {
    backupsPane.appendChild(tag(
      make('div', 'psnppp-empty', 'No backups yet. One is taken each day, and before any merge that would remove something.'),
      'backups-empty'
    ));
  } else {
    // Rendered in the order given, which listBackups already guarantees is
    // newest first — the same order the old numbered menu printed.
    for (const entry of backups) {
      backupsPane.appendChild(backupRow(entry));
    }
  }
  element.appendChild(backupsPane);
  panes.set('backups', backupsPane);

  function backupRow(entry) {
    const row = tag(make('div', 'psnppp-row'), 'backup-row');

    const main = make('div', 'psnppp-rowmain', stamp(entry?.at));
    main.appendChild(tag(
      make('span', 'psnppp-rowmeta', countOf(Number(entry?.listCount) || 0, 'list')),
      'backup-count'
    ));
    row.appendChild(main);

    const restoreButton = tag(make('button', 'psnppp-btn', 'Restore'), 'restore');
    restoreButton.setAttribute('type', 'button');
    row.appendChild(restoreButton);

    // The confirmation lives in the row rather than in a `window.confirm`, so
    // the thing being confirmed stays on screen next to the answer. It replaces
    // the row's own action, which is why a stray Enter cannot reach it.
    const confirm = tag(make('div', 'psnppp-confirm'), 'backup-confirm');
    confirm.appendChild(make('div', null, 'Replace your lists with this backup?'));
    const confirmActions = make('div', 'psnppp-actions');

    const keepButton = tag(make('button', 'psnppp-btn', 'Keep mine'), 'restore-cancel');
    keepButton.setAttribute('type', 'button');
    keepButton.addEventListener('click', () => {
      show(confirm, false);
      show(restoreButton, true);
    });
    confirmActions.appendChild(keepButton);

    const goButton = tag(make('button', 'psnppp-btn psnppp-btn-danger', 'Replace lists'), 'restore-confirm');
    goButton.setAttribute('type', 'button');
    goButton.addEventListener('click', () => {
      runRestore(entry?.id, goButton).catch(error => {
        // Re-enabled here too: a throw past runRestore's own branches would
        // otherwise leave the destructive button permanently dead and silent.
        goButton.disabled = false;
        showMessage(describeFailure(error, 'Could not restore that backup'), { error: true });
      });
    });
    confirmActions.appendChild(goButton);

    confirm.appendChild(confirmActions);
    show(confirm, false);
    row.appendChild(confirm);

    restoreButton.addEventListener('click', () => {
      show(restoreButton, false);
      show(confirm, true);
    });

    return row;
  }

  // --- message -------------------------------------------------------------

  const message = tag(make('div', 'psnppp-message'), 'message');
  show(message, false);
  element.appendChild(message);

  // --- footer ---------------------------------------------------------------

  // Two links, deliberately quiet: they sit below everything actionable and are
  // styled a tier down from the buttons above so they read as provenance rather
  // than as controls competing with Save and Restore.
  //
  // rel="noopener noreferrer" on both. Without `noopener` the opened tab gets a
  // `window.opener` handle back into psnprofiles.com — a page we do not own and
  // whose session the user is signed into.
  const foot = make('div', 'psnppp-foot');
  const link = (href, label, svgPath, key) => {
    const node = tag(make('a', 'psnppp-link'), key);
    node.setAttribute('href', href);
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
    const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('aria-hidden', 'true');
    const path = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', svgPath);
    svg.appendChild(path);
    node.appendChild(svg);
    node.appendChild(make('span', null, label));
    // These are the first <a> elements this panel has ever put into the host
    // document, and psnprofiles.com may well have a delegated anchor handler.
    // Stopping propagation keeps the click ours, per this file's rule that no
    // listener of ours reaches the page.
    node.addEventListener('click', event => event.stopPropagation());
    return node;
  };

  const GLOBE = 'M8 0a8 8 0 100 16A8 8 0 008 0zM6.6 1.6a10.8 10.8 0 00-1.3 3.2H2.9a6.6 6.6 0 013.7-3.2zM2.2 6.2h2.9a15 15 0 000 3.6H2.2a6.6 6.6 0 010-3.6zm.7 5h2.4a10.8 10.8 0 001.3 3.2 6.6 6.6 0 01-3.7-3.2zM8 14.6c-.7-.7-1.3-1.9-1.6-3.4h3.2c-.3 1.5-.9 2.7-1.6 3.4zm1.8-4.8H6.2a13.6 13.6 0 010-3.6h3.6a13.6 13.6 0 010 3.6zM8 1.4c.7.7 1.3 1.9 1.6 3.4H6.4C6.7 3.3 7.3 2.1 8 1.4zm1.4.2a6.6 6.6 0 013.7 3.2h-2.4a10.8 10.8 0 00-1.3-3.2zm1.5 4.6h2.9a6.6 6.6 0 010 3.6h-2.9a15 15 0 000-3.6zm-.2 5h2.4a6.6 6.6 0 01-3.7 3.2 10.8 10.8 0 001.3-3.2z';
  const GITHUB = 'M8 0C3.6 0 0 3.6 0 8a8 8 0 005.5 7.6c.4.1.5-.2.5-.4v-1.4c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.2 1.9.9 2.4.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8a7.5 7.5 0 014 0c1.5-1 2.2-.8 2.2-.8.5 1.1.2 1.9.1 2.1.5.5.8 1.2.8 2.1 0 3.1-1.8 3.8-3.6 4 .3.3.6.8.6 1.6v2.2c0 .2.1.5.5.4A8 8 0 0016 8c0-4.4-3.6-8-8-8z';

  foot.appendChild(link('https://trippixn.com', 'trippixn.com', GLOBE, 'link-site'));
  foot.appendChild(make('span', 'psnppp-spacer'));
  foot.appendChild(link('https://github.com/trippixn963/PSNPPlusPlus', 'GitHub', GITHUB, 'link-repo'));
  element.appendChild(foot);

  /**
   * The panel's one error channel, and the reason `onSave`/`onRestore` report
   * `{ ok, message }` instead of throwing. `role="alert"` for failures so a
   * screen reader is told without having to be looking at the panel.
   */
  function showMessage(text, { error = false } = {}) {
    message.textContent = text;
    message.className = error ? 'psnppp-message psnppp-message-error' : 'psnppp-message';
    message.setAttribute('role', error ? 'alert' : 'status');
    show(message, Boolean(text));
  }

  function clearMessage() {
    showMessage('');
  }

  // --- behaviour -----------------------------------------------------------

  let currentTab = null;

  function selectTab(name) {
    if (!panes.has(name) || name === currentTab) return;
    currentTab = name;
    for (const [key, pane] of panes) show(pane, key === name);
    for (const [key, button] of tabButtons) {
      button.setAttribute('aria-selected', key === name ? 'true' : 'false');
      button.setAttribute('tabindex', key === name ? '0' : '-1');
    }
  }

  async function submit() {
    clearMessage();
    const result = await onSave({ endpoint: endpointInput.value, key: keyInput.value });
    // Explicit success required. Treating anything that is not `ok === false`
    // as success meant a wiring mistake (undefined, a rejected-shape object)
    // presented to the user as a saved credential.
    if (!result || result.ok !== true) {
      showMessage(result?.message ?? 'Could not save your settings.', { error: true });
      return;
    }
    // A successful save closes, which is what lets the caller run a sync — the
    // chip going to "Syncing" is the confirmation, so there is nothing left for
    // the panel to say.
    close();
  }

  async function runRestore(id, button) {
    clearMessage();
    button.disabled = true;
    const result = await onRestore(id);
    if (!result || result.ok !== true) {
      button.disabled = false;
      // Deliberately does NOT close. A restore that failed is the one moment
      // the user most needs the panel — and the next backup — still in front
      // of them.
      showMessage(result?.message ?? 'Could not restore that backup.', { error: true });
      return;
    }
    showMessage(result.message ?? 'Backup restored.');
  }

  let closed = false;
  // Assigned once the outside-click listener is installed, below. A mutable
  // no-op rather than a const the hoisted close() would reference before its
  // declaration ran — that is a temporal dead zone away from a ReferenceError
  // inside the one function that has to work.
  let detachOutside = () => {};
  /**
   * Both steps are guarded, and both still run if the other throws.
   *
   * `closed` is set first, so an exception out of either one used to leave the
   * panel on screen with every future close() returning early — permanently
   * stuck — or, worse, skip `onClose` so the caller's promise never settled and
   * `await openSettings()` hung forever.
   */
  function close() {
    if (closed) return;
    closed = true;
    // Before anything that can throw: a panel that failed to remove itself but
    // left a live document listener behind would keep firing for the rest of
    // the page's life, on a page we do not own.
    try {
      detachOutside();
    } catch { /* nothing to do; the panel is going away regardless */ }
    try {
      element.remove?.();
    } catch (error) {
      console.error('[psnppp] could not remove the settings panel:', error);
    }
    try {
      onClose();
    } catch (error) {
      console.error('[psnppp] settings panel onClose failed:', error);
    }
  }

  element.addEventListener('keydown', event => {
    if (event.key !== 'Escape' && event.key !== 'Esc') return;
    // Scoped to the panel: Escape elsewhere on psnprofiles.com still belongs to
    // psnprofiles.com.
    event.stopPropagation?.();
    close();
  });

  /**
   * Close when the user clicks away.
   *
   * THE ONE LISTENER THIS WIDGET PUTS ON THE HOST DOCUMENT, and it is here
   * because "the user clicked somewhere that is not us" is the one thing that
   * genuinely cannot be observed from inside our own subtree. Everything else
   * stays scoped to the panel.
   *
   * Three deliberate choices:
   *
   * `pointerdown`, not `click`. A click is only delivered once the button is
   * released, and its target is the common ancestor of press and release — so
   * dragging to select the endpoint text and letting go outside the panel would
   * fire a document-level click and shut the panel mid-edit. A pointerdown that
   * STARTS outside is an unambiguous "I am done here".
   *
   * Capture phase, so a host page that stops propagation on its own document
   * clicks cannot stop the panel closing. We never stop propagation ourselves —
   * the click still belongs to psnprofiles.com and must reach it.
   *
   * The anchor is excluded. It is the chip, and the chip already toggles the
   * panel; without this, clicking it while open would close the panel here and
   * immediately reopen it there, which reads as the chip not working.
   */
  detachOutside = (() => {
    const onOutsidePointerDown = event => {
      const target = event?.target ?? null;
      if (target == null) return;
      if (element.contains?.(target)) return;
      if (anchor?.contains?.(target)) return;
      close();
    };
    doc.addEventListener?.('pointerdown', onOutsidePointerDown, true);
    return () => doc.removeEventListener?.('pointerdown', onOutsidePointerDown, true);
  })();

  selectTab(TABS[0].name);
  position();

  /**
   * Hang the panel off the chip, on the side the chip is NOT flush against.
   *
   * A docked chip has room on exactly one horizontal side — the one away from
   * its edge — so the panel opens there rather than "whichever side has room",
   * which used to mean the panel could sit flush against the same edge the
   * chip is docked to with nothing between them and the screen boundary.
   * Measured rather than assumed even so: the vertical spot is still free
   * (see indicator.mjs), so "above and to the left" would put the panel
   * off-screen the moment the chip is parked at the very top or bottom.
   */
  function position() {
    const view = {
      width: globalThis.window?.innerWidth ?? 0,
      height: globalThis.window?.innerHeight ?? 0
    };
    const rect = typeof anchor?.getBoundingClientRect === 'function'
      ? anchor.getBoundingClientRect()
      : null;
    if (!rect || !view.width || !view.height) {
      // No measurable chip: sit where the stylesheet parks the chip, one chip
      // height higher. Derived rather than typed, so it follows the chip.
      element.style.right = `${EDGE_INSET_PX}px`;
      element.style.bottom = `${EDGE_INSET_PX * 2 + CHIP_FALLBACK_SIZE.height}px`;
      return;
    }

    // The same clamp the chip's own drag uses for "never off-screen, pin to
    // the reachable edge if there truly is no room" — not a second copy of
    // that arithmetic. The rendered width is whichever of the two the
    // stylesheet actually allows.
    const width = Math.min(PANEL_WIDTH_PX, Math.max(0, view.width - EDGE_INSET_PX * 2));
    const isDockedLeft = side === 'left';
    const desiredLeft = isDockedLeft ? rect.right + EDGE_INSET_PX : rect.left - width - EDGE_INSET_PX;
    element.style.left = `${clampAxis(desiredLeft, width, view.width, EDGE_INSET_PX)}px`;
    element.style.right = 'auto';

    // Vertically: TOP-ALIGNED to the anchor, never hung below it.
    //
    // The panel already sits BESIDE the anchor horizontally, so hanging it below
    // as well placed it diagonally off a corner — beside and below at once, which
    // is neither.
    //
    // The real reason, though, is that the anchor's BOTTOM EDGE MOVES. PSNP+'s
    // menu grows on hover: the profile page passes an _onShow that reveals a
    // refresh container inside it. A panel measured against `rect.bottom` while
    // the menu was expanded was left stranded in mid-air the moment the pointer
    // left and the menu collapsed back — a gap of whatever the refresh container
    // happens to be tall, with nothing in it.
    //
    // The top edge does not move when a box grows downward, so aligning to it is
    // stable under exactly the change that broke the old placement. Clamped, so
    // an anchor parked near the bottom of the screen still gets a panel that
    // fits: the clamp pulls it up rather than letting it run off.
    // Either measurement, whichever the environment offers; 0 is a fine answer
    // for a panel that has not been laid out, since clampAxis treats a
    // zero-height box as one that fits anywhere.
    const measured = [element.offsetHeight, element.getBoundingClientRect?.()?.height]
      .find(value => Number.isFinite(value) && value > 0);
    const height = measured ?? 0;
    element.style.top = `${Math.round(clampAxis(rect.top, height, view.height, EDGE_INSET_PX))}px`;
    element.style.bottom = 'auto';
  }

  return { element, close, showMessage };
}
