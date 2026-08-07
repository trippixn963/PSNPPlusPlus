import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * `stableStringify` exists TWICE — in merger.mjs and in sync-cycle.mjs.
 *
 * The duplication is deliberate: merger.mjs does not export it, and widening a
 * frozen module's surface for a caller's convenience was judged the worse
 * trade. But nothing asserted the two copies agree, and two things now depend on
 * that agreement in opposite directions:
 *
 *   - merger.mjs uses it to decide record equality (pickNewer / sameRecord), so
 *     it decides which side of a conflict WINS.
 *   - sync-cycle.mjs uses it to decide whether the merged document already
 *     matches the server, i.e. whether to push at all.
 *
 * If they ever diverge, the cycle could skip a push over a document the merge
 * considers different — a change that would go unnoticed until lists stopped
 * propagating.
 *
 * Neither copy is exported, so this extracts both from source and runs them
 * over one shared fixture set. That tests the SEMANTICS, not the source text,
 * so reformatting or a comment edit cannot fail it while a real behavioural
 * divergence still will.
 */

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Pull one top-level `function name(...) {...}` out of a module's source. */
function extractFunction(relativePath, name) {
  const source = readFileSync(resolve(root, relativePath), 'utf8');
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `${relativePath} no longer declares ${name}`);

  const open = source.indexOf('{', start);
  let depth = 0;
  let end = -1;
  for (let i = open; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    else if (source[i] === '}') {
      depth -= 1;
      if (depth === 0) { end = i + 1; break; }
    }
  }
  assert.notEqual(end, -1, `could not brace-match ${name} in ${relativePath}`);

  const text = source.slice(start, end);
  // The declaration is self-contained and recursive, so it evaluates standalone.
  return new Function(`${text}; return ${name};`)();
}

const fromMerger = extractFunction('src/merger.mjs', 'stableStringify');
const fromCycle = extractFunction('src/sync-cycle.mjs', 'stableStringify');

const FIXTURES = [
  null, undefined, 0, -0, 1.5, '', 'text', true, false,
  {}, [],
  { b: 1, a: 2 },
  { a: 2, b: 1 },                                  // same content, other order
  { z: { y: 1, x: 2 }, a: [3, 2, 1] },
  { a: [3, 2, 1], z: { x: 2, y: 1 } },
  [1, [2, [3, {}]]],
  { defined: 1, dropped: undefined },              // undefined key must vanish
  { dropped: undefined, defined: 1 },
  [1, undefined, 3],                               // undefined element -> null
  { nested: { deep: { deeper: [{ k: undefined, j: 1 }] } } },
  { 'quo"te': 'va\\lue', 'uni€': '\n\t' },
  { 10: 'ten', 9: 'nine', a: 'letter' },           // numeric-ish keys
  // A realistic doc node, in two key orders.
  {
    meta: { updatedAt: 500, name: 'Wishlist', tags: [], removeGames: undefined },
    games: { g1: { id: 'g1', title: 'Game g1', updatedAt: 500 } },
    gameOrder: ['g1'], orderUpdatedAt: 500, deletedGames: {}, deletedAt: null
  },
  {
    deletedAt: null, deletedGames: {}, orderUpdatedAt: 500, gameOrder: ['g1'],
    games: { g1: { updatedAt: 500, title: 'Game g1', id: 'g1' } },
    meta: { removeGames: undefined, tags: [], name: 'Wishlist', updatedAt: 500 }
  }
];

test('both stableStringify copies produce identical output on every fixture', () => {
  for (const fixture of FIXTURES) {
    assert.equal(
      fromCycle(fixture), fromMerger(fixture),
      `divergence on ${JSON.stringify(fixture) ?? String(fixture)}`
    );
  }
});

test('both copies are genuinely key-order insensitive (the property being relied on)', () => {
  // Guards against the parity test passing because BOTH copies regressed to
  // plain JSON.stringify together.
  const pairs = [
    [{ a: 1, b: 2 }, { b: 2, a: 1 }],
    [{ z: { y: 1, x: 2 } }, { z: { x: 2, y: 1 } }],
    [FIXTURES[FIXTURES.length - 2], FIXTURES[FIXTURES.length - 1]]
  ];
  for (const [left, right] of pairs) {
    assert.equal(fromMerger(left), fromMerger(right), 'merger copy is order sensitive');
    assert.equal(fromCycle(left), fromCycle(right), 'sync-cycle copy is order sensitive');
    assert.notEqual(JSON.stringify(left), JSON.stringify(right),
      'fixture must actually differ under plain JSON.stringify, or it proves nothing');
  }
});

test('array order is still significant in both copies', () => {
  assert.notEqual(fromMerger([1, 2]), fromMerger([2, 1]));
  assert.notEqual(fromCycle([1, 2]), fromCycle([2, 1]));
});
