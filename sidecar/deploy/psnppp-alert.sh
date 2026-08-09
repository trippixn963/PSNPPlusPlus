#!/usr/bin/env bash
#
# PSNP++ - Guard Alert
# ====================
#
# Posts a failed publish-guard run to a Discord webhook.
#
# Wired via `OnFailure=` on psnppp-guard.service, so systemd starts it on ANY
# non-zero exit — including the ones the guard cannot report itself, like the
# script being missing or non-executable (203/EXEC). That is the point: the
# guard exists because a broken publish URL is silent, and until now the guard
# breaking was silent too. `systemctl list-units --failed` is a pull signal
# nobody runs; this is a push.
#
# Exits 0 even when it cannot send. An alerter that fails would itself need an
# alerter, and a non-zero exit here buys nothing — there is deliberately no
# OnFailure on this unit, so a loop is impossible.
#
# Author: Trippixn
# Server: discord.gg/syria

set -uo pipefail

ENV_FILE="/etc/psnppp/alert.env"
UNIT="${1:-psnppp-guard.service}"
JOURNAL_LINES=25
# Discord hard-limits a message to 2000 characters; leave room for the wrapper.
MAX_BODY=1500

log() { echo "[psnppp-alert] $*"; }

[ -r "$ENV_FILE" ] || { log "no $ENV_FILE — nothing to send to. Create it to enable alerts."; exit 0; }
# shellcheck source=/dev/null
. "$ENV_FILE"
WEBHOOK="${PSNPPP_ALERT_WEBHOOK:-}"
[ -n "$WEBHOOK" ] || { log "PSNPPP_ALERT_WEBHOOK is empty — alerts disabled."; exit 0; }

# The failure text is the whole value here: "restored the files but the URL is
# still wrong" and "something is ACTIVELY removing the web root" need different
# responses, and only the journal says which.
detail="$(journalctl -u "$UNIT" -n "$JOURNAL_LINES" --no-pager -o cat 2>/dev/null | tail -c "$MAX_BODY")"
[ -n "$detail" ] || detail="(no journal output — the unit may have failed before it ran, e.g. 203/EXEC)"

result="$(systemctl show "$UNIT" -p Result --value 2>/dev/null || echo unknown)"
host="$(hostname 2>/dev/null || echo unknown)"

# Built with python3 rather than string-concatenated: the journal carries quotes,
# backslashes and newlines, and a hand-rolled JSON body would break on the first
# one — silently, at the moment something is already wrong.
payload="$(UNIT="$UNIT" RESULT="$result" HOST="$host" DETAIL="$detail" python3 -c '
import json, os
print(json.dumps({
    "username": "PSNP++ guard",
    "content": (
        f"**PSNP++ publish guard FAILED** on `{os.environ[\"HOST\"]}`\n"
        f"unit `{os.environ[\"UNIT\"]}` — result `{os.environ[\"RESULT\"]}`\n"
        f"The install/auto-update URL may be down. Check "
        f"<https://trippixn.com/psnppp.meta.js>\n"
        f"```\n{os.environ[\"DETAIL\"]}\n```"
    )[:1990]
}))' 2>/dev/null)"

[ -n "$payload" ] || { log "could not build the payload; not sending."; exit 0; }

code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 20 --retry 2 --retry-delay 5 \
  -H 'Content-Type: application/json' -X POST -d "$payload" "$WEBHOOK" 2>&1)" || code="request-failed"

case "$code" in
  2*) log "alert sent (HTTP $code)" ;;
  *)  log "alert NOT sent (HTTP $code). The guard failure still stands — see: journalctl -u $UNIT" ;;
esac
exit 0
