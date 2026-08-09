# PSNP++

Two-way sync of your [PSNP+](https://psnp-plus.huskycode.dev) game lists across devices.

PSNP+ keeps its game lists in `localStorage`, so a wishlist built on the desktop does not
exist on the laptop. PSNP++ syncs them through a small private service on your own server.

It is a **companion** to PSNP+, not a replacement: install both, and PSNP+ keeps updating
itself from HusKyCode as normal.

## Install

```
https://trippixn.com/psnppp.user.js
```

Paste that into your browser and Tampermonkey will offer to install it. Install from the
**URL**, not the file — that is what wires up auto-updates.

> **PSNP+ must be installed and enabled.** PSNP++ syncs PSNP+'s lists; on its own it has
> nothing to sync. Install PSNP+ from <https://psnp-plus.huskycode.dev> first.

Then load any psnprofiles.com page, **right-click the status chip** in the corner, and paste
your sync key. Repeat on each device.

## Layout

| Path | |
|---|---|
| `userscript/src/` | PSNP++ itself — `main.mjs` is the entry point |
| `userscript/tests/` | `npm test` |
| `sidecar/` | The sync service (FastAPI + SQLite), its tests, and the [deploy runbook](sidecar/deploy/README.md) |
| `dist/psnppp.user.js` | The built script — this is what you install |

## How it touches PSNP+

Only through `localStorage` and the page's own `window` — the two things any userscript on
the page can reach. There is no copy of PSNP+ here and nothing is patched, so HusKyCode ships
releases and they just arrive.

Two dependencies on PSNP+'s internals are worth knowing about, because both will eventually
break when it changes:

**The list format.** `compat.mjs` reads the version PSNP+ writes into `psnpp-scriptstate` and
checks the shape of the saved lists before every cycle. If the shape moves, syncing **halts**
and the chip says so — nothing is uploaded and nothing local is touched. That is the whole
point of the check: a format change should freeze your lists, not quietly mangle them on two
devices.

**The remove dialog.** `auto-confirm.mjs` replaces `window.confirm` so PSNP+'s
"Are you sure you want to remove X?" answers itself. It works because PSNP+ declares
`@inject-into page` and calls a bare `confirm(...)` at click time, so it resolves against the
page's global — which this script shares via `unsafeWindow`. It matches the exact message
**and** checks the named game is really in your lists, so if PSNP+ rewords anything the match
simply stops and the dialog comes back. That is the intended failure: a returning dialog is
an annoyance, a loose match that auto-confirmed "delete this list" would not be recoverable.

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
npm run release                        # patch
npm run release minor
npm run release -- patch --dry-run     # everything except publishing
```

The `--` is how npm passes a flag through instead of eating it. The script also
reads `npm_config_dry_run`, so the form without it is safe too — but write the
`--`, because that is the only version that works for any other flag.

The version bump is why the script exists: Tampermonkey only updates when `@version`
increases, and the build reads it from `package.json`. Ship without a bump and every install
silently keeps running the old code.

## Credit

PSNP+ is by **HusKyCode** — <https://psnp-plus.huskycode.dev>. This repository contains no
part of it and modifies none of it; all of that functionality, and the work behind it, is
theirs. PSNP++ only syncs the lists PSNP+ saves.
