# Deploying the sync service

A single FastAPI app over SQLite. It stores one document per key, authenticated
by a shared secret in a header, and does not care what the document contains.
Small enough to run next to anything.

This is a guide, not a runbook — substitute your own host, user, and paths.

## What you need

- A host with Python 3.12+, a reverse proxy, and TLS.
- A domain you control. The userscript hard-codes its update and API URLs at
  build time, so decide this before your first release.

## The service

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
printf 'PSNP_SYNC_KEY=%s\n' "$(openssl rand -hex 32)" > .env
chmod 600 .env
```

Run it with `uvicorn app:app --host 127.0.0.1 --port 8091`. `psnppp.service` is a
systemd unit for exactly that; edit the paths and user to match your host.

**Bind to loopback.** The auth is a single static secret with no rate limiting
and no lockout, which is adequate behind a proxy you control and not adequate
facing the internet directly.

Every request needs the key:

```bash
curl -H "X-Sync-Key: $PSNP_SYNC_KEY" https://your-domain.example/api/psnppp/state
```

## The proxy

`nginx-psnppp.conf` has the three location blocks: the API, and the two static
artifacts that Tampermonkey installs and polls. Paste them into your server
block and reload with the config test chained, not merely adjacent:

```bash
nginx -t && systemctl reload nginx
```

Three things in that file are load-bearing and easy to undo by tidying:

**Serve the artifacts from their own directory.** Not a document root that
another project deploys into. A full-sync deploy (`rsync --delete`) of a
co-tenant will delete them as extraneous, and the failure is silent —
Tampermonkey reads the resulting 404 as "no update available", so every install
keeps running old code while reporting itself up to date. This has happened.

**`no-store` on both artifacts.** A cached `.meta.js` means update checks keep
reading a stale `@version`.

**Re-declare your security headers inside those blocks.** nginx does not merge
server-level `add_header` into a location that sets one of its own, so the
moment a block sets `Cache-Control` it silently loses every inherited header.

## Verifying

Assert response **bodies**, never status codes. If anything in front of this
serves a single-page app, its catch-all returns `200` with HTML for any
unmatched path — so a status check cannot tell "deployed" from "deleted", and on
an API path a `200` is the alarm rather than the all-clear.

```bash
curl -s https://your-domain.example/psnppp.meta.js | sed -n 1p
# → // ==UserScript==     (anything starting with <!DOCTYPE is the SPA fallback)

curl -s https://your-domain.example/api/psnppp/health
# → {"status":"ok"}
```

A `/health` endpoint proves less than it looks like it does — this one does not
touch the database, and there was a period where it answered `ok` while every
keyed request returned 500.

## The publish guard

`psnppp-guard.timer` runs `psnppp-guard.sh` every 15 minutes. It compares what
the URL actually serves against a pristine copy of the last release and restores
the files if they are missing or wrong.

It exists because the install URL is the project's single point of failure *and*
it fails invisibly: a broken publish is indistinguishable from a healthy one
from every client, so nothing would ever tell you.

| Artifact | Suggested location |
|---|---|
| `psnppp-guard.sh` | `/usr/local/sbin/psnppp-guard` |
| `psnppp-guard.{service,timer}` | `/etc/systemd/system/` |
| Pristine copy | `/var/lib/psnppp/published/` — refreshed by every release |

Keep both the script and the pristine copy **outside any path the sync service
can write to**. It is internet-facing; it must not be able to reach the script
systemd runs as root on a timer, nor the bytes that get published to a
JavaScript URL every browser auto-executes.

`chmod 755` the script. `ExecStart` needs the executable bit, and without it the
unit fails with `203/EXEC` before the script runs — which looks exactly like the
guard running and finding a problem.

Enable the timer only after a release has populated the pristine directory.
Until that exists the guard exits non-zero by design: it refuses to verify
against something it does not have.

Two things it deliberately will not do:

- **Restore over a newer live version.** That is a rollback, not a repair, and
  it is reachable whenever someone publishes by hand without refreshing the
  pristine copy.
- **Repair forever.** Two consecutive repairs means something is actively
  deleting the files, and quietly restoring them would hide it. It escalates to
  a failed unit instead.

```bash
systemctl start psnppp-guard.service            # run it now
journalctl -u psnppp-guard.service -o cat -p warning
systemctl list-timers psnppp-guard.timer
```

Healthy runs log at `info` and are invisible at the default priority, so
`-p warning` shows only repairs and failures. A failed unit is the only passive
signal there is; nothing pages anyone.

## Backups

The database is a single SQLite file. Copy it somewhere before any migration:

```bash
sqlite3 state.db ".backup 'state.db.bak'"
```

Use `.backup` rather than `cp` — the app runs in WAL mode, so a plain copy of
the `.db` alone can miss committed data still sitting in the `-wal` file.
