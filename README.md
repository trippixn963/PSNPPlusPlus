# PSNP++

[PSNP+](https://psnp-plus.huskycode.dev) with local patches, plus two-way sync of your game
lists across devices — in one userscript.

PSNP+ keeps its game lists in `localStorage`, so a wishlist built on the desktop does not
exist on the laptop. PSNP++ syncs them through a small private service on your own server.

## Install

```
https://trippixn.com/psnppp.user.js
```

Paste that into your browser and Tampermonkey will offer to install it. Install from the
**URL**, not the file — that is what wires up auto-updates.

> ⚠️ **Disable the standalone PSNP+ script.** PSNP++ contains PSNP+. If both are enabled,
> two copies run and write to the same storage independently, overwriting each other's list
> edits. The chip warns you if it detects this, but it is easier to just turn the other one
> off.

Then load any psnprofiles.com page, **right-click the status chip** in the corner, and paste
your sync key. Repeat on each device.

## Layout

| Path | |
|---|---|
| `vendor/psnp-plus.user.js` | PSNP+ v11.14 by HusKyCode, verbatim. **Never edited.** |
| `patches/` | Local changes to PSNP+, as find/replace with reasons |
| `userscript/src/` | PSNP++ itself — `main.mjs` is the entry point |
| `userscript/tests/` | `npm test` |
| `sidecar/` | The sync service (FastAPI + SQLite), its tests, and the [deploy runbook](sidecar/deploy/README.md) |
| `dist/psnppp.user.js` | The built script — this is what you install |

## Patching PSNP+

PSNP+ runs in its own userscript realm, so its behaviour cannot be changed from the outside —
an override installed on the page's `window` is simply never consulted by it. So PSNP++ ships
PSNP+ and patches it at build time.

`vendor/psnp-plus.user.js` stays byte-identical to what HusKyCode publishes. Every local
change lives in `patches/` as a find/replace with the reasoning attached, which keeps "what
did we change on top of upstream?" answerable by reading one directory instead of diffing
14,000 lines of compiled output.

**The trade: PSNP+ no longer auto-updates.** Taking a new release is deliberate:

```bash
# drop the new bundle into vendor/psnp-plus.user.js, then
npm run build
```

Every patch that still fits applies silently. The first one that does not **fails the build
by name**, so an upstream change is a build error at merge time rather than a behaviour that
quietly stopped working weeks later. Never loosen a patch's match to make the build pass —
go and read what changed.

## Working on it

```bash
npm install
npm test                    # userscript suite
cd sidecar && .venv/bin/python -m pytest tests/ -q
npm run build               # writes dist/
```

Releases are one command. It refuses a dirty tree, gates on both suites, bumps the version,
builds, publishes, then verifies the live version and that the neighbouring services on the
server are unharmed:

```bash
npm run release             # patch
npm run release minor
npm run release patch --dry-run
```

The version bump is why the script exists: Tampermonkey only updates when `@version`
increases, and the build reads it from `package.json`. Ship without a bump and every install
silently keeps running the old code.

## Credit

PSNP+ is by **HusKyCode** — <https://psnp-plus.huskycode.dev>. This repository vendors it
unmodified and patches it at build time; all of its functionality, and the work behind it,
is theirs.
