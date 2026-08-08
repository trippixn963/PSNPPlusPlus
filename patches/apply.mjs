/**
 * PSNP++ - Patch applier
 * ======================
 *
 * Applies declarative patches to PSNP+'s bundle, and refuses to produce output
 * if any of them no longer fits.
 *
 * `vendor/psnp-plus.user.js` stays exactly as HusKyCode ships it. Every local
 * change to PSNP+ lives in `patches/` as a find/replace with a reason attached,
 * which is what makes "what did we change on top of upstream?" answerable by
 * reading a directory instead of diffing 14,000 lines of compiled output.
 *
 * The failure mode is the whole design. On a new PSNP+ release you drop the new
 * bundle in and build: every patch that still matches applies silently, and the
 * first one that does not FAILS THE BUILD by name. An upstream change becomes a
 * loud event at merge time rather than a behaviour that quietly stopped working
 * in the browser. A patch that matched a different number of places than it
 * expected is treated the same way — the bundle changing shape underneath a
 * patch is exactly as interesting as it not matching at all.
 *
 * Author: Trippixn
 * Server: discord.gg/syria
 */

/** Count non-overlapping occurrences of a literal string. */
const countOf = (haystack, needle) => {
  if (needle === '') return 0;
  let count = 0;
  let at = haystack.indexOf(needle);
  while (at !== -1) {
    count += 1;
    at = haystack.indexOf(needle, at + needle.length);
  }
  return count;
};

export class PatchError extends Error {}

/**
 * Apply every patch, in order, returning the patched source.
 *
 * Throws `PatchError` naming the offending patch rather than returning a
 * partial result: a half-patched PSNP+ is worse than no build at all, because
 * it would ship and mostly work.
 */
export function applyPatches(source, patches) {
  let out = source;
  const applied = [];

  for (const patch of patches) {
    const { name, find, replace, occurrences = 1 } = patch ?? {};

    if (!name || typeof find !== 'string' || typeof replace !== 'string') {
      throw new PatchError(`Malformed patch: ${name ?? '(unnamed)'} needs name, find and replace`);
    }

    const found = countOf(out, find);
    if (found !== occurrences) {
      throw new PatchError(
        `Patch "${name}" expected ${occurrences} occurrence(s) but found ${found}.\n` +
        `PSNP+ has changed underneath it. Re-read the patch's find string against ` +
        `the new vendor/psnp-plus.user.js and update it deliberately — do NOT ` +
        `loosen the match to make the build pass.\n` +
        `  looking for: ${find.slice(0, 120)}${find.length > 120 ? '…' : ''}`
      );
    }

    out = out.split(find).join(replace);
    applied.push(name);
  }

  // A patch whose replacement happens to contain its own find string would
  // apply forever on the next build. Cheap to check once, and the failure it
  // prevents is a mystifying one.
  for (const patch of patches) {
    if (patch.replace.includes(patch.find)) {
      throw new PatchError(
        `Patch "${patch.name}" is not idempotent: its replacement still contains ` +
        `its find string, so re-running the build would patch it again.`
      );
    }
  }

  return { source: out, applied };
}
