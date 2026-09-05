/**
 * PSNP++ - Device
 * ===============
 *
 * Which device a log line came from, in the words a person uses: "Chrome on
 * macOS", "Firefox on Windows". On a two-device sync that is the first thing
 * a reader asks of any line, and no tree used to say it.
 *
 * Derived from the user agent, never stored, and never more specific than
 * browser and platform. The log is a Discord channel other people can read,
 * and a fingerprint has no business in it.
 *
 * Developer: Trippixn
 * Website:   https://trippixn.com
 * Discord:   discord.gg/syria
 */

// Ordered: every Chromium browser also says "Chrome/" and "Safari/", so the
// ones that add their own token are tested first and Safari last.
const BROWSERS = [
  ['Edg/', 'Edge'],
  ['OPR/', 'Opera'],
  ['Vivaldi/', 'Vivaldi'],
  ['Firefox/', 'Firefox'],
  ['Chrome/', 'Chrome'],
  ['Safari/', 'Safari']
];

// Ordered for the same reason: an Android agent also says "Linux", an iPad on
// iPadOS presents as a Mac, and ChromeOS says "CrOS" alongside "Linux".
const PLATFORMS = [
  ['Windows', 'Windows'],
  ['Android', 'Android'],
  ['iPhone', 'iOS'],
  ['iPad', 'iPadOS'],
  ['CrOS', 'ChromeOS'],
  ['Mac OS X', 'macOS'],
  ['Macintosh', 'macOS'],
  ['Linux', 'Linux']
];

/**
 * "Chrome on macOS" from a user agent string. Never throws: an empty or odd
 * agent reads as an unknown device rather than costing the line.
 */
export function describeDevice(userAgent) {
  const agent = String(userAgent ?? '');
  if (agent === '') return 'unknown device';
  const browser = BROWSERS.find(([token]) => agent.includes(token))?.[1] ?? 'a browser';
  const platform = PLATFORMS.find(([token]) => agent.includes(token))?.[1] ?? 'an unknown platform';
  return `${browser} on ${platform}`;
}

/** This browser, or "unknown device" outside one. */
export function currentDevice() {
  try {
    return describeDevice(typeof navigator !== 'undefined' ? navigator.userAgent : '');
  } catch {
    return 'unknown device';
  }
}
