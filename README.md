# PSNPSync

Two-way sync for [PSNP+](https://psnp-plus.huskycode.dev) game lists across devices.

PSNP+ stores its game lists in `localStorage` under `psnpp-lists`, which makes them per-browser —
a wishlist built on the desktop does not exist on the phone. PSNPSync is a companion userscript
plus a small VPS sidecar that keeps those lists in sync, without modifying PSNP+ itself.

See [the design spec](docs/specs/2026-08-07-psnp-list-sync-design.md) for the full
architecture, merge rules, and failure handling.

## Layout

| Path | Contents |
|---|---|
| `docs/specs/` | Design specs |
| `vendor/psnp-plus.user.js` | Upstream PSNP+ — read-only reference |

## Vendored PSNP+

`vendor/psnp-plus.user.js` is **PSNP+ v11.14 by HusKyCode**, retrieved from
`https://psnp-plus.huskycode.dev/psnp-plus.user.js`.

It is committed as a **read-only reference** so the storage format and list behavior this project
depends on can be checked against a known version. It is a webpack bundle, not source.

**It is never patched.** PSNPSync runs alongside PSNP+ and interacts with it only through
`localStorage`, so PSNP+ can update freely without breaking the sync.
