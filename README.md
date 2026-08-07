# PSNP++

Two-way sync for [PSNP+](https://psnp-plus.huskycode.dev) game lists across devices.

PSNP+ stores its game lists in `localStorage` under `psnpp-lists`, which makes them per-browser —
a wishlist built on the desktop does not exist on the phone. PSNP++ is a companion userscript
plus a small VPS sidecar that keeps those lists in sync, without modifying PSNP+ itself.

See [the design spec](docs/specs/2026-08-07-psnp-list-sync-design.md) for the full
architecture, merge rules, and failure handling.

## Layout

| Path | Contents |
|---|---|
| `userscript/src/` | Userscript ESM sources — `main.mjs` is the entry point |
| `userscript/tests/` | Node test-runner suites (`npm test`) |
| `userscript/banner.txt` | The `==UserScript==` metadata block, prepended at build time |
| `userscript/build.mjs` | esbuild bundler (`npm run build`) |
| `dist/psnppp.user.js` | **The built userscript — this is the file you install** |
| `sidecar/app.py` | FastAPI sync service (SQLite, one document, revision guard) |
| `sidecar/tests/` | pytest suite for the sidecar |
| `sidecar/deploy/` | systemd unit, nginx location block, and the [deployment runbook](sidecar/deploy/README.md) |
| `docs/specs/` | Design specs |
| `vendor/psnp-plus.user.js` | Upstream PSNP+ — read-only reference |

## Setup

Target platform: desktop Chrome with Tampermonkey, alongside PSNP+.

### 1. Deploy the sidecar

Follow [`sidecar/deploy/README.md`](sidecar/deploy/README.md) end to end. It generates the shared
secret, installs the service on the VPS, and adds the nginx location block — including the
before/after checks that prove the shared nginx config did not break a neighbouring service, a neighbouring service, or the
portfolio. Keep the secret from step 1; each browser needs it.

### 2. Build and install the userscript

```bash
npm install
npm test          # 148 tests
npm run build     # writes dist/psnppp.user.js
```

Install `dist/psnppp.user.js` in Tampermonkey — open the Tampermonkey dashboard, choose
**Utilities → File → Import** (or drag the file onto the dashboard), and enable it. `dist/` is
committed, so it can also be installed straight from the repo without a local build. Rebuild and
reinstall after any change to `userscript/src/` — the bundle is what actually runs.

### 3. Enter the sync key on each device

Load any `psnprofiles.com` page. A small status chip appears in the bottom-right corner; until it
is configured it reads **Set up sync**.

**Right-click the chip** to open settings, choose `1`, accept the default endpoint
(`https://trippixn.com/api/psnppp`), and paste the secret from step 1. The key is stored in
Tampermonkey's own storage, never in the script file. Left-clicking the chip syncs immediately;
right-click also offers `2` to restore a pre-merge backup.

Repeat on every device. The first device to sync uploads its lists; the next one is offered a
one-time prompt to link same-named lists instead of ending up with two copies of "Wishlist".

### Upgrading from PSNPSync

Nothing to do by hand. Everything this script owns lives in Tampermonkey's storage under a name
prefix, and the rename changed that prefix from `psnpsync.` to `psnppp.`. On its first run the
new version moves all of it across — endpoint, sync key, last-synced base, the backup index, and
every backup blob the index names — then deletes the old names. A stored endpoint that is still
the old default (`https://trippixn.com/api/psnp-sync`) is repointed at the new one; an endpoint
you typed yourself is left exactly as it is.

The migration is idempotent, so a second run does nothing, and it is a clean no-op on a fresh
install. `localStorage['psnpp-lists']` is **not** touched by any of this — that key belongs to
PSNP+, not to PSNP++, and it holds the only copy of your actual game lists.

## Vendored PSNP+

`vendor/psnp-plus.user.js` is **PSNP+ v11.14 by HusKyCode**, retrieved from
`https://psnp-plus.huskycode.dev/psnp-plus.user.js`.

It is committed as a **read-only reference** so the storage format and list behavior this project
depends on can be checked against a known version. It is a webpack bundle, not source.

**It is never patched.** PSNP++ runs alongside PSNP+ and interacts with it only through
`localStorage`, so PSNP+ can update freely without breaking the sync.
