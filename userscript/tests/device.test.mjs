import test from 'node:test';
import assert from 'node:assert/strict';

import { describeDevice, currentDevice } from '../src/device.mjs';

/**
 * The device row is read by a person deciding which of their machines did a
 * thing, so the test is whether the words come out right for the agents that
 * actually turn up, and whether an odd one degrades to something honest.
 */

const CHROME_MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
const EDGE_WIN = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0';
const FIREFOX_LINUX = 'Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0';
const SAFARI_IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1';
const CHROME_ANDROID = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36';

test('the common agents read as browser on platform', () => {
  assert.equal(describeDevice(CHROME_MAC), 'Chrome on macOS');
  assert.equal(describeDevice(EDGE_WIN), 'Edge on Windows');
  assert.equal(describeDevice(FIREFOX_LINUX), 'Firefox on Linux');
  assert.equal(describeDevice(SAFARI_IPHONE), 'Safari on iOS');
});

test('Android is Android, not the Linux it also mentions', () => {
  assert.equal(describeDevice(CHROME_ANDROID), 'Chrome on Android');
});

test('Edge is not mistaken for the Chrome and Safari its agent also names', () => {
  assert.notEqual(describeDevice(EDGE_WIN), 'Chrome on Windows');
});

test('an empty or unknown agent degrades to honest words rather than throwing', () => {
  assert.equal(describeDevice(''), 'unknown device');
  assert.equal(describeDevice(null), 'unknown device');
  assert.equal(describeDevice('curl/8.4.0'), 'a browser on an unknown platform');
});

test('the current device is always some honest words, and never throws', () => {
  // Node has carried a `navigator` since 21, with an agent like "Node.js/25",
  // so under the test runner this is "a browser on an unknown platform"
  // rather than the absent-navigator case. Either way it is words, not a throw.
  const device = currentDevice();
  assert.equal(typeof device, 'string');
  assert.ok(device === 'unknown device' || / on /.test(device), device);
});
