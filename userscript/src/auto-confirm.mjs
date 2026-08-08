/**
 * PSNP++ - Auto-confirm PSNP+'s "remove <game>?" dialog
 * =====================================================
 *
 * The owner asked to stop confirming every single game he removes from a list.
 * PSNP+ raises that dialog from its ListTable row handler:
 *
 *     const result = confirm(`Are you sure you want to remove ${listItem.title}?`);
 *
 * ONE dialog, and nothing else. PSNP+ v11.14 raises three others, and all three
 * are destructive at a scope nobody asked to skip: "clear all your PSNP+ data",
 * "delete this list", and "reload this list from a remote URL — all manual
 * changes will be lost". Auto-answering any of those would confirm something the
 * owner never saw, and with sync running it would propagate to his other device.
 * So anything that is not the exact message is handed straight through to the
 * real `confirm` and its answer is returned unchanged.
 *
 * FAIL IN THE SAFE DIRECTION. Two independent conditions must BOTH hold:
 *
 *   1. The message is exactly PSNP+'s literal — the full prefix, a single line,
 *      one trailing "?" — not a prefix test and not a loose regex.
 *   2. The name in it is a game title that is actually in the user's saved
 *      lists right now.
 *
 * (2) is the one that matters. Imagine HusKyCode rewording the LIST-deletion
 * prompt from "delete this list" to "remove this list" — a shape-only matcher
 * would then silently delete whole lists, on two devices, with no prompt. It
 * costs a `localStorage` read per click and buys the difference between a
 * feature and an accident. A hypothetical future "remove the 12 selected
 * games?" is stopped by the same condition.
 *
 * The consequence, and it is the one we want: if PSNP+ rewords ANYTHING about
 * this dialog, we stop matching and the confirmation comes back. That is a
 * harmless annoyance. Matching too widely is not recoverable.
 *
 * Nothing here ever throws. It runs inside a page we do not own, on the path
 * PSNP+ uses to ask a destructive question — a matcher that faulted would take
 * out the dialog AND the removal with it.
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */

/**
 * PSNP+ v11.14's literal, up to the interpolated title.
 *
 * Exported so a test can assert the exact bytes rather than re-deriving them,
 * and so the one place this string lives is greppable against vendor/.
 */
export const REMOVE_PREFIX = 'Are you sure you want to remove ';

/** PSNP+ closes the template with a bare question mark and nothing after it. */
const REMOVE_SUFFIX = '?';

/**
 * The title PSNP+ interpolated, or null if this is not that dialog.
 *
 * Case-sensitive and anchored at BOTH ends on purpose. `startsWith` alone would
 * match a reworded "Are you sure you want to remove Bloodborne from every list
 * on every device?"; `includes` would match a sentence that merely quotes it.
 *
 * The slice is greedy, so a game genuinely titled "Where Is My Water?" survives
 * the double question mark its own title produces.
 *
 * Newlines disqualify: no game title contains one, and every multi-line
 * confirmation PSNP+ raises is one of the destructive ones.
 */
export function extractRemovedTitle(message) {
  if (typeof message !== 'string') return null;
  if (!message.startsWith(REMOVE_PREFIX) || !message.endsWith(REMOVE_SUFFIX)) {
    // Every confirm PSNP+ raises passes through here, so this is the only place
    // that can report a dialog we did not recognise AT ALL — as opposed to one
    // we recognised and declined. Without it, "the prompt still appears" and
    // "the prompt is not the one we match" look identical from the outside.
    try {
      console.warn('[psnppp] confirm seen, not the remove prompt:', JSON.stringify(message));
    } catch { /* a console that throws must not break PSNP+'s click handler */ }
    return null;
  }
  const title = message.slice(REMOVE_PREFIX.length, -REMOVE_SUFFIX.length);
  if (title === '') return null;
  if (title.includes('\n') || title.includes('\r')) return null;
  return title;
}

/**
 * Is `titles` a lookup that actually knows this title?
 *
 * Deliberately strict about the container. `knownTitles` is wired to a
 * localStorage read that is specified to degrade to an empty Set — but a future
 * caller handing back an array, a string, or undefined must read as "I do not
 * know", never as a match. A bare string would answer `.includes` truthfully
 * for any substring of itself.
 */
const knows = (titles, title) => titles instanceof Set && titles.has(title);

/**
 * Should this exact message be answered "yes" without asking?
 *
 * `knownTitles` may be a Set or a function returning one; a function is what
 * production uses, so the lists are read at click time rather than snapshotted
 * at install time and left to go stale as the user deletes.
 */
export function shouldAutoConfirm(message, knownTitles) {
  const title = extractRemovedTitle(message);
  if (title == null) return false;
  const titles = typeof knownTitles === 'function' ? knownTitles() : knownTitles;
  if (knows(titles, title)) return true;

  // Declined a dialog that IS the remove prompt — so the title lookup is what
  // said no. That is the only branch a user can hit while believing the feature
  // is on, and without this line the reason is invisible: the dialog simply
  // appears, exactly as it would if the override had never installed.
  //
  // Logs the near misses rather than the whole set, because the interesting
  // case is a title that differs by trimming, casing or a suffix, and dumping
  // hundreds of titles would bury it.
  try {
    const known = titles instanceof Set ? [...titles] : [];
    const near = known.filter(t => {
      const a = t.toLowerCase().trim();
      const b = title.toLowerCase().trim();
      return a === b || a.includes(b) || b.includes(a);
    });
    // warn, NOT debug: console.debug lands on Chrome DevTools' "Verbose" level,
    // which is hidden by default, so the first version of this line printed
    // faithfully and was invisible to the person it was written for. This fires
    // only when the remove prompt appeared despite the feature being on, which
    // is precisely the anomaly worth surfacing.
    console.warn(
      '[psnppp] not auto-confirming: the dialog names a title that is not in any list.',
      { dialogTitle: title, knownCount: known.length, nearMatches: near.slice(0, 5) }
    );
  } catch {
    // A console that throws must not turn a declined auto-confirm into a
    // thrown confirm, which would take PSNP+'s click handler down with it.
  }
  return false;
}

/** A handle for every path that installed nothing. `installed` says so honestly. */
const INERT = { installed: false, uninstall() {} };

/**
 * Replace `target.confirm` with one that answers the remove dialog by itself.
 *
 * `target` is passed in rather than reached for: in the browser it has to be
 * the PAGE's window (PSNP+ runs with `@inject-into page`, so its bare
 * `confirm(...)` resolves against the page's global, not our sandbox's), and in
 * a test it is a plain object. See main.mjs's `confirmTarget`.
 *
 * Returns `{ installed, uninstall }`. `uninstall` puts `confirm` back EXACTLY as
 * it was found — the original function, and its original own-vs-inherited
 * standing, restored through the property descriptor rather than by assignment.
 * That is what makes the settings toggle genuinely inert when it is off:
 * nothing of ours is left in the chain to be reasoned about.
 *
 * `installed` is `false` whenever nothing was actually patched, so a caller can
 * tell "switched on" apart from "switched on and silently did nothing" rather
 * than reporting success it did not have.
 */
export function installAutoConfirm({ target, knownTitles } = {}) {
  if (target == null || typeof target.confirm !== 'function') return INERT;

  const original = target.confirm;
  const hadOwn = Object.prototype.hasOwnProperty.call(target, 'confirm');
  const descriptor = hadOwn ? Object.getOwnPropertyDescriptor(target, 'confirm') : null;

  // Switched off by uninstall BEFORE it attempts the restore, so that the two
  // ways the restore can decline to run — another script patched `confirm`
  // after us, or defineProperty threw — degrade to an override that is still in
  // the chain but no longer DECIDES anything, instead of a suppressor that is
  // live, unreachable (its handle is gone) and answering `true` while the
  // setting, the checkbox and storage all say off. Without this the unsafe
  // state is only clearable by a page reload.
  let active = true;

  function override(...args) {
    // The whole decision is inside the try. Every failure mode — a hostile
    // message that throws on coercion, an unreadable localStorage, a bug of
    // ours — has to land on "ask the user", which is the behaviour that
    // existed before this file did.
    try {
      if (active && shouldAutoConfirm(args[0], knownTitles)) return true;
    } catch (error) {
      // Even the log is guarded. `console` here is the page's, and a page that
      // has replaced console.error with something that throws would otherwise
      // turn this recovery path into an exception escaping into PSNP+'s click
      // handler — taking the removal down with the dialog.
      try {
        console.error('[psnppp] auto-confirm check failed; showing the dialog:', error);
      } catch { /* nothing left to report it with */ }
    }
    // Every argument through untouched, the answer back untouched, and `target`
    // as the receiver: a native window.confirm called with no receiver throws
    // "Illegal invocation", and PSNP+ calls it bare.
    return Reflect.apply(original, target, args);
  }

  try {
    target.confirm = override;
  } catch (error) {
    console.error('[psnppp] could not install the auto-confirm override:', error);
    return INERT;
  }
  // Assignment can fail silently rather than throw (a non-writable property in
  // sloppy mode, an accessor that ignores its setter). Confirm it actually took
  // before handing back an uninstall that would restore over someone else.
  if (target.confirm !== override) {
    console.error('[psnppp] the auto-confirm override did not take; leaving confirm alone.');
    return INERT;
  }

  let removed = false;
  return {
    installed: true,
    uninstall() {
      if (removed) return;
      removed = true;
      // First, and outside the try: from here on this override answers nothing,
      // whatever happens to the restore below.
      active = false;
      try {
        // Only unwind our own patch. If another script wrapped or replaced
        // `confirm` after us, restoring unconditionally would silently delete
        // their override — the same rule watchLists's `stop()` follows.
        if (target.confirm !== override) return;
        if (descriptor) Object.defineProperty(target, 'confirm', descriptor);
        else delete target.confirm;
      } catch (error) {
        console.error('[psnppp] could not restore the original confirm:', error);
      }
    }
  };
}
