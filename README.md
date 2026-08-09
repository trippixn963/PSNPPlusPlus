<img src="assets/icon-128.png" alt="" width="88" height="88" align="left">

# PSNP++

Two-way sync of your [PSNP+](https://psnp-plus.huskycode.dev) game lists across devices.

PSNP+ keeps its game lists in `localStorage`, so a wishlist built on the desktop does not
exist on the laptop. PSNP++ syncs them through a small service on your own server.

It is a **companion** to PSNP+, not a replacement: install both, and PSNP+ keeps updating
itself from HusKyCode as normal.

> ### No support
>
> This is published because the code may be useful to read, not because it is a product.
> **Issues and pull requests are not monitored, and there is no support of any kind** —
> no bug triage, no feature requests, no help getting it running, no guarantee it keeps
> working or that it stays online.
>
> It is built for one person's setup and is developed entirely to suit that. Breaking
> changes ship without notice or a migration path. If it is useful to you, **fork it** and
> run your own copy — that is the intended way to use this repository.
>
> It touches your saved lists. Read [How it touches PSNP+](#how-it-touches-psnp) and keep
> your own backups. MIT licensed, which means as-is and with no warranty. See [LICENSE](LICENSE).

## Install

This installs from the author's server and syncs against it, which requires a key you
will not have. **To actually use PSNP++, [run your own](#running-your-own).**

```
https://trippixn.com/psnppp.user.js
```

Paste that into your browser and Tampermonkey will offer to install it. Install from the
**URL**, not the file — that is what wires up auto-updates.

> **PSNP+ must be installed and enabled.** PSNP++ syncs PSNP+'s lists; on its own it has
> nothing to sync. Install PSNP+ from <https://psnp-plus.huskycode.dev> first.

Then load any psnprofiles.com page, **right-click the status chip** in the corner, and paste
your sync key. Repeat on each device.

## Running your own

The sync service is a single FastAPI app over SQLite. It holds one document per key and
does not care what is in it.

1. Deploy `sidecar/` behind a reverse proxy on a host you control —
   see [the deploy guide](sidecar/deploy/DEPLOY.md).
2. Point the userscript at it. `DEFAULT_ENDPOINT` in
   [`userscript/src/config.mjs`](userscript/src/config.mjs) is the build-time default, and
   `@downloadURL`/`@updateURL` in [`userscript/banner.txt`](userscript/banner.txt) are where
   your build will publish. **Change all three before building**, or your users poll the
   author's server instead of yours.
3. `cp scripts/deploy.env.example scripts/deploy.env`, fill it in, then `npm run release`.

An installed copy can also be pointed anywhere at runtime — right-click the status chip and
set the endpoint — so you do not have to rebuild just to test against a different host.

## Layout

| Path | |
|---|---|
| `userscript/src/` | PSNP++ itself — `main.mjs` is the entry point |
| `userscript/tests/` | `npm test` |
| `sidecar/` | The sync service (FastAPI + SQLite), its tests, and the [deploy guide](sidecar/deploy/DEPLOY.md) |
| `dist/psnppp.user.js` | The built script — this is what you install |
| `assets/` | The icon. Regenerate with `npm i -D playwright && npx playwright install chromium && node scripts/make-icon.mjs` |

## How it touches PSNP+

Only through `localStorage` and the page's own `window` — the two things any userscript on
the page can reach. There is no copy of PSNP+ here and nothing is patched, so HusKyCode ships
releases and they just arrive.

One dependency on PSNP+'s internals is worth knowing about, because it will eventually break
when PSNP+ changes:

**The list format.** `compat.mjs` reads the version PSNP+ writes into `psnpp-scriptstate` and
checks the shape of the saved lists before every cycle. If the shape moves, syncing **halts**
and the chip says so — nothing is uploaded and nothing local is touched. That is the whole
point of the check: a format change should freeze your lists, not quietly mangle them on two
devices.

There used to be a second one: an override of `window.confirm` that answered PSNP+'s
"Are you sure you want to remove X?" for you. It has been **removed** — PSNP+ runs inside
Tampermonkey's own `userscript.html` realm, not the page's, so a `confirm` this script
replaces is never the one PSNP+ calls. Verified live. The dialog stays.

## Working on it

```bash
npm install
npm test                    # userscript suite
cd sidecar && .venv/bin/python -m pytest tests/ -q
npm run build               # writes dist/
```

Releases are one command. It refuses a dirty tree, gates on both suites, bumps the version,
builds, publishes, then verifies that what the live URL actually serves is byte-identical to
what it just built:

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
