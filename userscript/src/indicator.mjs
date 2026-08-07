/**
 * PSNP++ - Status Indicator
 * =========================
 *
 * A small fixed-position status chip.
 *
 * Deliberately does not splice itself into PSNP+'s DOM: PSNP+ re-renders its
 * list panel freely, and anything injected inside it would be destroyed. A
 * fixed-position element owned entirely by this script survives that.
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */

/**
 * `action` is what a LEFT-CLICK does from that state, and it is the whole
 * reason the chip tracks its own state.
 *
 * PSNP+ renders its list view from localStorage at render time and this script
 * writes behind it, so a cycle that changed something leaves the drawn page
 * showing stale lists. Forcing a re-render would mean reaching into PSNP+'s
 * internals, which breaks on their next update — so the reload stays the
 * user's, and the chip that tells them to reload is the thing that does it.
 * Running another sync from there is a guaranteed no-op: the merge already
 * settled, so the second cycle writes nothing and the page stays just as stale.
 *
 * There is deliberately no auto-reload. The user may be mid-scroll or mid-edit,
 * and yanking the page out from under them is worse than the friction.
 */
const STATES = {
  idle:         { label: 'Sync', color: '#6c757d', action: 'sync' },
  syncing:      { label: 'Syncing…', color: '#0d6efd', action: 'sync' },
  synced:       { label: 'Synced', color: '#198754', action: 'sync' },
  reload:       { label: 'Synced — reload page', color: '#198754', action: 'reload' },
  offline:      { label: 'Offline', color: '#fd7e14', action: 'sync' },
  conflict:     { label: 'Conflict', color: '#dc3545', action: 'sync' },
  unconfigured: { label: 'Set up sync', color: '#6f42c1', action: 'sync' }
};

const CLICK_HINT = {
  sync: 'click to sync now, right-click for settings.',
  reload: 'click to reload the page, right-click for settings.'
};

export function createIndicator({ onSyncNow, onSettings, onReload }) {
  const element = document.createElement('div');
  element.id = 'psnppp-indicator';
  element.style.cssText = [
    'position:fixed', 'right:12px', 'bottom:12px', 'z-index:99999',
    'font:12px/1.4 Arial,sans-serif', 'color:#fff', 'padding:6px 10px',
    'border-radius:4px', 'cursor:pointer', 'user-select:none',
    'box-shadow:0 2px 6px rgba(0,0,0,.35)', 'opacity:.9'
  ].join(';');

  const label = document.createElement('span');
  element.appendChild(label);

  // The action is read at click time, not bound at wire-up time, so a state
  // change is enough to change what the chip does.
  let action = STATES.idle.action;

  element.addEventListener('click', () => {
    if (action === 'reload') onReload();
    else onSyncNow();
  });
  element.addEventListener('contextmenu', event => {
    event.preventDefault();
    onSettings();
  });

  function setState(state, detail = '') {
    // Own-property lookup, not `STATES[state] ?? STATES.idle`. Every key on
    // Object.prototype ('constructor', 'toString', '__proto__', ...) resolves
    // truthy through the prototype chain, so `??` never fires for them and
    // `style` ends up as a function with no color/label/action. That made
    // setState THROW on `hint[0]` — breaking Task 9's HARD no-throw guarantee,
    // which exists because this runs inside a page we do not own. The old
    // bogus-state test used 'some-bogus-state', which is not on the prototype
    // and so never caught it.
    const style = Object.hasOwn(STATES, state) ? STATES[state] : STATES.idle;
    action = style.action;
    element.style.background = style.color;
    label.textContent = style.label;
    const hint = CLICK_HINT[action] ?? CLICK_HINT.sync;
    element.title = detail
      ? `PSNP++ — ${detail}\n${hint[0].toUpperCase()}${hint.slice(1)}`
      : `PSNP++ — ${hint}`;
  }

  setState('idle');
  return { element, setState };
}
