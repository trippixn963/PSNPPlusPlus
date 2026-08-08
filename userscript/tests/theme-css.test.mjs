import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/**
 * NOTHING IN THIS FILE MAY IMPORT theme.mjs AT THE TOP LEVEL.
 *
 * The stylesheet is one long template literal, so a backtick anywhere inside it
 * — including inside a CSS comment — TERMINATES the string and turns the rest of
 * the file into syntax errors. It has happened four times, always in a comment
 * quoting a property name, and every time the whole suite went red at once with
 * an error pointing at the CSS rather than at the habit that caused it.
 *
 * A static import would be evaluated before any test runs, so the parse failure
 * would take this file down with everything else and the diagnosis would be no
 * better than before. Reading the source as TEXT is what makes the message
 * specific, and the one test that does need the module imports it dynamically,
 * inside the test, where a failure is reported as that test failing.
 */

const SOURCE = new URL('../src/theme.mjs', import.meta.url);
const OPENER = 'export const CSS = `';

test('the CSS literal is not closed early by a stray backtick', () => {
  const source = readFileSync(SOURCE, 'utf8');
  const open = source.indexOf(OPENER);
  assert.ok(open !== -1, 'the CSS literal must be findable');

  const body = source.slice(open + OPENER.length);
  const close = body.indexOf('`');
  assert.ok(close !== -1, 'the CSS literal must be closed at all');

  // The first backtick after the opener has to be the INTENDED closer. The panel
  // rules are the last block in the sheet, so if they are inside the literal it
  // ran to the end; if they are not, something closed it early.
  assert.ok(
    body.slice(0, close).includes('---- the panel ----'),
    'a stray backtick closed the CSS literal before the panel rules — '
      + 'CSS comments must not quote property names with backticks'
  );
});

test('the stylesheet exports as one non-trivial string covering every surface', async () => {
  // Dynamic, and inside the test, for the reason in the file note above.
  const { CSS } = await import('../src/theme.mjs');
  assert.equal(typeof CSS, 'string');
  assert.ok(CSS.length > 2000, 'a truncated sheet is a broken sheet');
  for (const marker of ['psnppp-indicator', 'psnppp-panel', 'psnppp-rail', 'psnppp-label']) {
    assert.ok(CSS.includes(marker), `${marker} rules must be present`);
  }
});
