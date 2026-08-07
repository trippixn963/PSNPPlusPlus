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

const STATES = {
  idle:         { label: 'Sync', color: '#6c757d' },
  syncing:      { label: 'Syncing…', color: '#0d6efd' },
  synced:       { label: 'Synced', color: '#198754' },
  offline:      { label: 'Offline', color: '#fd7e14' },
  conflict:     { label: 'Conflict', color: '#dc3545' },
  unconfigured: { label: 'Set up sync', color: '#6f42c1' }
};

export function createIndicator({ onSyncNow, onSettings }) {
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

  element.addEventListener('click', () => onSyncNow());
  element.addEventListener('contextmenu', event => {
    event.preventDefault();
    onSettings();
  });

  function setState(state, detail = '') {
    const style = STATES[state] ?? STATES.idle;
    element.style.background = style.color;
    label.textContent = style.label;
    element.title = detail
      ? `PSNP++ — ${detail}\nClick to sync now, right-click for settings.`
      : 'PSNP++ — click to sync now, right-click for settings.';
  }

  setState('idle');
  return { element, setState };
}
