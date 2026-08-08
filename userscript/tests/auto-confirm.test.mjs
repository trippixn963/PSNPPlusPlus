/**
 * PSNP++ - Auto-confirm: PSNP+'s "remove <game>?" dialog
 * ======================================================
 *
 * The one dialog the owner asked to stop seeing, and NOTHING else. PSNP+ raises
 * four confirmations in v11.14; three of them are destructive at a scope no one
 * asked to skip (clear all PSNP+ data, delete a whole list, overwrite a list
 * from a remote URL). Suppressing the wrong one would confirm something the
 * owner never saw — with sync running, on two devices.
 *
 * So every test here is written from the same bias: a match that stops matching
 * is a harmless annoyance, a match that widens is data loss. The reworded and
 * unknown-title cases below are the ones that matter most.
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { installAutoConfirm, extractRemovedTitle, shouldAutoConfirm, REMOVE_PREFIX }
  from '../src/auto-confirm.mjs';

/** The four confirmations PSNP+ v11.14 actually raises, verbatim from vendor/. */
const PSNP_PLUS_DIALOGS = {
  removeGame: title => `Are you sure you want to remove ${title}?`,
  clearAllData: 'Are you sure you want to clear all your PSNP+ data? This operation is irreversible.',
  deleteList: 'Are you sure you want to delete this list?',
  reloadRemote: 'You are about to reload data in this list from a remote URL. ' +
    'All manual changes done by you will be lost.\n\nContinue?'
};

/**
 * A stand-in for the page window whose `confirm` gets overridden.
 *
 * `answer` is what the REAL confirm returns, and `calls` records everything
 * that reached it — so "fell through to the real dialog" is asserted by the
 * call actually arriving, not by the return value alone (which could coincide).
 */
function fakeTarget({ answer = false, own = true } = {}) {
  const calls = [];
  const original = function (...args) {
    calls.push({ args, this: this });
    return answer;
  };
  const target = own ? { confirm: original } : Object.create({ confirm: original });
  return { target, original, calls };
}

const titles = (...names) => () => new Set(names);

// --- the one dialog ---------------------------------------------------------

test('the exact remove message for a game in the lists auto-confirms', () => {
  const { target, original, calls } = fakeTarget({ answer: false });
  const handle = installAutoConfirm({ target, knownTitles: titles('Bloodborne') });
  try {
    assert.equal(target.confirm(PSNP_PLUS_DIALOGS.removeGame('Bloodborne')), true);
    assert.equal(calls.length, 0, 'the real confirm must not have been reached');
    assert.notEqual(target.confirm, original);
  } finally {
    handle.uninstall();
  }
});

test('a game title containing a question mark still auto-confirms', () => {
  // "Are you sure you want to remove Where Is My Water??" — the title's own
  // "?" plus PSNP+'s. A greedy capture is what makes this work.
  const { target } = fakeTarget();
  const handle = installAutoConfirm({ target, knownTitles: titles('Where Is My Water?') });
  try {
    assert.equal(target.confirm(PSNP_PLUS_DIALOGS.removeGame('Where Is My Water?')), true);
  } finally {
    handle.uninstall();
  }
});

// --- every other dialog PSNP+ raises ----------------------------------------

test('PSNP+\'s other confirmations call through and return the real answer', () => {
  for (const answer of [true, false]) {
    for (const message of [
      PSNP_PLUS_DIALOGS.clearAllData,
      PSNP_PLUS_DIALOGS.deleteList,
      PSNP_PLUS_DIALOGS.reloadRemote
    ]) {
      const { target, calls } = fakeTarget({ answer });
      const handle = installAutoConfirm({ target, knownTitles: titles('Bloodborne') });
      try {
        assert.equal(target.confirm(message), answer, message);
        assert.equal(calls.length, 1, `the real confirm must have been reached for: ${message}`);
        assert.deepEqual(calls[0].args, [message], 'arguments must pass through unchanged');
      } finally {
        handle.uninstall();
      }
    }
  }
});

test('our own adoption prompt is untouched', () => {
  const message = 'PSNP++ found lists on the server with the same names as lists on this ' +
    'device:\n\n• Backlog\n\nLink them so they stay in sync? Choose Cancel to keep them separate.';
  const { target, calls } = fakeTarget({ answer: true });
  const handle = installAutoConfirm({ target, knownTitles: titles('Backlog') });
  try {
    assert.equal(target.confirm(message), true);
    assert.equal(calls.length, 1);
  } finally {
    handle.uninstall();
  }
});

// --- failing in the safe direction ------------------------------------------

test('a reworded remove message falls through to the real confirm', () => {
  const rewordings = [
    'Are you sure you want to delete Bloodborne?',            // verb changed
    'Really remove Bloodborne?',                              // preamble changed
    'Are you sure you want to remove Bloodborne from this list?', // suffix changed
    'are you sure you want to remove Bloodborne?',            // case changed
    'Are you sure you want to remove Bloodborne',             // no question mark
    'Are you sure you want to remove ?'                       // empty title
  ];
  for (const message of rewordings) {
    const { target, calls } = fakeTarget({ answer: false });
    const handle = installAutoConfirm({ target, knownTitles: titles('Bloodborne') });
    try {
      assert.equal(target.confirm(message), false, message);
      assert.equal(calls.length, 1, `must have fallen through: ${message}`);
    } finally {
      handle.uninstall();
    }
  }
});

test('the right shape naming something that is NOT a game in the lists falls through', () => {
  // The catastrophic case: HusKyCode renames the LIST-deletion prompt from
  // "delete this list" to "remove this list". A prefix-only matcher would
  // silently start deleting whole lists on two devices with no prompt.
  for (const phrase of ['this list', 'all your PSNP+ data', 'these 12 games', 'everything']) {
    const { target, calls } = fakeTarget({ answer: false });
    const handle = installAutoConfirm({ target, knownTitles: titles('Bloodborne') });
    try {
      assert.equal(target.confirm(`Are you sure you want to remove ${phrase}?`), false, phrase);
      assert.equal(calls.length, 1, `must have fallen through: ${phrase}`);
    } finally {
      handle.uninstall();
    }
  }
});

test('a multi-line message never auto-confirms, however it starts', () => {
  const { target, calls } = fakeTarget();
  const handle = installAutoConfirm({ target, knownTitles: titles('Bloodborne') });
  try {
    target.confirm(`${REMOVE_PREFIX}Bloodborne\n\nand everything else?`);
    assert.equal(calls.length, 1);
  } finally {
    handle.uninstall();
  }
});

// --- the toggle -------------------------------------------------------------

test('not installing leaves confirm genuinely untouched, not merely quiet', () => {
  // "Off" is uninstalled, not a pass-through wrapper left in the chain.
  const { target, original, calls } = fakeTarget({ answer: false });
  assert.equal(target.confirm, original);
  assert.equal(target.confirm(PSNP_PLUS_DIALOGS.removeGame('Bloodborne')), false);
  assert.equal(calls.length, 1);
});

test('uninstalling restores confirm exactly as it was found (own property)', () => {
  const { target, original } = fakeTarget({ own: true });
  const before = Object.getOwnPropertyDescriptor(target, 'confirm');
  const handle = installAutoConfirm({ target, knownTitles: titles('Bloodborne') });
  assert.notEqual(target.confirm, original);
  handle.uninstall();
  assert.equal(target.confirm, original);
  assert.deepEqual(Object.getOwnPropertyDescriptor(target, 'confirm'), before);
  // And the override really is gone from the chain.
  assert.equal(target.confirm(PSNP_PLUS_DIALOGS.removeGame('Bloodborne')), false);
});

test('uninstalling restores an INHERITED confirm without leaving an own property behind', () => {
  // In a real browser `confirm` lives on Window.prototype, not on the window.
  const { target, original } = fakeTarget({ own: false });
  assert.equal(Object.prototype.hasOwnProperty.call(target, 'confirm'), false);
  const handle = installAutoConfirm({ target, knownTitles: titles('Bloodborne') });
  assert.equal(Object.prototype.hasOwnProperty.call(target, 'confirm'), true);
  handle.uninstall();
  assert.equal(Object.prototype.hasOwnProperty.call(target, 'confirm'), false);
  assert.equal(target.confirm, original);
});

test('uninstall is idempotent and never throws', () => {
  const { target, original } = fakeTarget();
  const handle = installAutoConfirm({ target, knownTitles: titles('Bloodborne') });
  handle.uninstall();
  handle.uninstall();
  assert.equal(target.confirm, original);
});

test('uninstall leaves a LATER patch by someone else alone', () => {
  // Restoring unconditionally would silently delete another script's override.
  const { target } = fakeTarget();
  const handle = installAutoConfirm({ target, knownTitles: titles('Bloodborne') });
  const foreign = () => true;
  target.confirm = foreign;
  handle.uninstall();
  assert.equal(target.confirm, foreign);
});

test('an override that CANNOT detach still stops deciding anything', () => {
  // The dangerous shape: another script wraps our override, so uninstall must
  // decline to restore — and the handle is then dropped. Without an internal
  // off-switch our override would sit in that chain answering `true` forever,
  // unreachable, while the setting, the checkbox and storage all say off. Only
  // a page reload would clear it.
  const { target, calls } = fakeTarget({ answer: false });
  const handle = installAutoConfirm({ target, knownTitles: titles('Bloodborne') });
  const ours = target.confirm;
  const wrapper = (...args) => ours(...args);
  target.confirm = wrapper;

  handle.uninstall();

  assert.equal(target.confirm, wrapper, 'their patch must survive');
  assert.equal(target.confirm('Are you sure you want to remove Bloodborne?'), false,
    'but ours must no longer answer');
  assert.equal(calls.length, 1, 'the real dialog must have been reached');
});

test('an override whose restore THROWS still stops deciding anything', () => {
  const { target, calls } = fakeTarget({ answer: false });
  const handle = installAutoConfirm({ target, knownTitles: titles('Bloodborne') });
  const ours = target.confirm;
  // Make the descriptor restore fail the way a sealed/frozen host object would.
  Object.freeze(target);
  handle.uninstall();
  assert.equal(target.confirm, ours, 'the restore could not happen');
  assert.equal(target.confirm('Are you sure you want to remove Bloodborne?'), false);
  assert.equal(calls.length, 1);
});

test('the handle reports honestly whether anything was actually installed', () => {
  const { target } = fakeTarget();
  assert.equal(installAutoConfirm({ target, knownTitles: titles('x') }).installed, true);
  for (const bad of [null, undefined, {}, { confirm: 'not a function' }]) {
    assert.equal(installAutoConfirm({ target: bad, knownTitles: titles('x') }).installed, false,
      JSON.stringify(bad) ?? String(bad));
  }
});

test('a confirm that refuses to be replaced reports installed:false, not a false handle', () => {
  // A non-writable `confirm`: the assignment throws under a module's implicit
  // strict mode. Reporting success here would tick the settings box for a
  // feature that is not running.
  const original = () => false;
  const target = {};
  Object.defineProperty(target, 'confirm', { value: original, writable: false, configurable: false });
  const handle = installAutoConfirm({ target, knownTitles: titles('Bloodborne') });
  assert.equal(handle.installed, false);
  assert.equal(target.confirm, original);
  handle.uninstall();
  assert.equal(target.confirm, original);
});

test('a console that throws cannot escape into the page through our own error path', () => {
  const { target, calls } = fakeTarget({ answer: false });
  const handle = installAutoConfirm({
    target,
    knownTitles: () => { throw new Error('storage is gone'); }
  });
  const realError = console.error;
  console.error = () => { throw new Error('this page broke console'); };
  try {
    assert.equal(target.confirm('Are you sure you want to remove Bloodborne?'), false);
    assert.equal(calls.length, 1);
  } finally {
    console.error = realError;
    handle.uninstall();
  }
});

// --- never throws -----------------------------------------------------------

test('the override never throws, whatever it is handed', () => {
  const hostile = {
    get [Symbol.toPrimitive]() { throw new Error('boom'); },
    toString() { throw new Error('boom'); }
  };
  const inputs = [undefined, null, 0, 1, {}, [], hostile, Symbol('x'), () => {}];
  for (const input of inputs) {
    const { target, calls } = fakeTarget({ answer: true });
    const handle = installAutoConfirm({ target, knownTitles: titles('Bloodborne') });
    try {
      assert.equal(target.confirm(input), true, String(typeof input));
      assert.equal(calls.length, 1);
    } finally {
      handle.uninstall();
    }
  }
});

test('a knownTitles source that throws falls through instead of taking the page down', () => {
  const { target, calls } = fakeTarget({ answer: false });
  const handle = installAutoConfirm({
    target,
    knownTitles: () => { throw new Error('localStorage is gone'); }
  });
  try {
    assert.equal(target.confirm(PSNP_PLUS_DIALOGS.removeGame('Bloodborne')), false);
    assert.equal(calls.length, 1);
  } finally {
    handle.uninstall();
  }
});

test('a knownTitles source that returns junk falls through', () => {
  for (const junk of [null, undefined, 42, 'Bloodborne', {}]) {
    const { target, calls } = fakeTarget({ answer: false });
    const handle = installAutoConfirm({ target, knownTitles: () => junk });
    try {
      assert.equal(target.confirm(PSNP_PLUS_DIALOGS.removeGame('Bloodborne')), false, String(junk));
      assert.equal(calls.length, 1);
    } finally {
      handle.uninstall();
    }
  }
});

test('installing against a target with no usable confirm is a safe no-op', () => {
  for (const target of [null, undefined, {}, { confirm: 'not a function' }]) {
    const handle = installAutoConfirm({ target, knownTitles: titles('Bloodborne') });
    assert.equal(typeof handle.uninstall, 'function');
    handle.uninstall();
  }
});

// --- call semantics ---------------------------------------------------------

test('every argument and the return value pass through unchanged', () => {
  const { target, calls } = fakeTarget({ answer: true });
  const handle = installAutoConfirm({ target, knownTitles: titles('Bloodborne') });
  try {
    assert.equal(target.confirm('Continue?', 'extra', 3), true);
    assert.deepEqual(calls[0].args, ['Continue?', 'extra', 3]);
  } finally {
    handle.uninstall();
  }
});

test('the real confirm is invoked with the target as its receiver', () => {
  // A bare `confirm(msg)` from PSNP+ arrives with no receiver; a native
  // window.confirm called that way throws "Illegal invocation".
  const { target, calls } = fakeTarget();
  const handle = installAutoConfirm({ target, knownTitles: titles('Bloodborne') });
  try {
    const detached = target.confirm;
    detached('Continue?');
    assert.equal(calls[0].this, target);
  } finally {
    handle.uninstall();
  }
});

// --- the pure matcher, pinned directly --------------------------------------

test('extractRemovedTitle reads the title out of the exact message and nothing else', () => {
  assert.equal(extractRemovedTitle('Are you sure you want to remove Bloodborne?'), 'Bloodborne');
  assert.equal(extractRemovedTitle('Are you sure you want to remove Portal 2?'), 'Portal 2');
  assert.equal(extractRemovedTitle('Are you sure you want to remove ?'), null);
  assert.equal(extractRemovedTitle('Are you sure you want to remove Bloodborne'), null);
  assert.equal(extractRemovedTitle('Are you sure you want to delete this list?'), null);
  assert.equal(extractRemovedTitle(''), null);
  assert.equal(extractRemovedTitle(null), null);
  assert.equal(extractRemovedTitle(123), null);
});

test('shouldAutoConfirm needs BOTH the exact shape and a real game title', () => {
  const known = new Set(['Bloodborne']);
  assert.equal(shouldAutoConfirm('Are you sure you want to remove Bloodborne?', known), true);
  assert.equal(shouldAutoConfirm('Are you sure you want to remove Bloodborne?', new Set()), false);
  assert.equal(shouldAutoConfirm('Are you sure you want to remove this list?', known), false);
  assert.equal(shouldAutoConfirm('Are you sure you want to delete Bloodborne?', known), false);
});

test('REMOVE_PREFIX is the literal PSNP+ writes, so a rewording is a miss not a widening', () => {
  assert.equal(REMOVE_PREFIX, 'Are you sure you want to remove ');
});

test('declining on an unknown title says so, naming near misses', () => {
  // The only branch a user can hit while believing the feature is on. Without
  // this the dialog just appears, indistinguishable from the override never
  // having installed at all.
  const logged = [];
  const original = console.debug;
  console.debug = (...args) => logged.push(args);
  try {
    const known = new Set(['Crysis 2 Remastered', 'Bloodborne']);
    assert.equal(shouldAutoConfirm('Are you sure you want to remove Crysis 2?', known), false);
  } finally {
    console.debug = original;
  }
  assert.equal(logged.length, 1);
  const [message, detail] = logged[0];
  assert.match(message, /not auto-confirming/);
  assert.equal(detail.dialogTitle, 'Crysis 2');
  assert.deepEqual(detail.nearMatches, ['Crysis 2 Remastered'], 'the likely culprit is surfaced');
});

test('a dialog that is not the remove prompt logs nothing', () => {
  const logged = [];
  const original = console.debug;
  console.debug = (...args) => logged.push(args);
  try {
    shouldAutoConfirm('Are you sure you want to clear all PSNP+ data?', new Set(['Bloodborne']));
  } finally {
    console.debug = original;
  }
  assert.equal(logged.length, 0, 'only the remove prompt is worth explaining');
});
