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
# Developer: Trippixn
# Website:   https://trippixn.com
# Discord:   discord.gg/syria

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

# JSON is built by python3, not concatenated in shell: the journal carries
# quotes, backslashes and newlines, and a hand-rolled body would break on the
# first one — silently, at the moment something is already wrong.
#
# Values arrive as ENVIRONMENT variables and are bound to plain locals before
# use. Two traps this avoids, both of which shipped here once:
#   - `f"{os.environ[\"HOST\"]}"` needs an escaped quote inside the expression,
#     which the surrounding single-quoted shell turns into a backslash Python
#     rejects outright. Concatenation and bare locals need no escaping at all.
#   - stderr is NOT discarded. It was, and that hid the SyntaxError completely:
#     the payload came back empty and the script reported "could not build the
#     payload" as though it were an ordinary edge case. Only stdout is captured,
#     so a Python traceback lands in the journal where it belongs.
#
# The body carries `content` and nothing else. No `username`, no `avatar_url`:
# Discord lets a payload override both per message, so either one hard-coded
# here would silently beat whatever the webhook is set to in the server
# settings, undoing that change on every alert with nothing on screen to say
# why. The name and the picture belong to whoever owns the channel.
#
# Note for editors: everything between the single quotes below is one shell
# string, so an apostrophe anywhere inside it — including in a comment — ends
# the string and breaks the script. Keep prose out here, above the quote.
payload="$(UNIT="$UNIT" RESULT="$result" HOST="$host" DETAIL="$detail" python3 -c '
import json, os

unit = os.environ["UNIT"]
result = os.environ["RESULT"]
host = os.environ["HOST"]
detail = os.environ["DETAIL"]

content = (
    "**PSNP++ publish guard FAILED** on `" + host + "`\n"
    "unit `" + unit + "` - result `" + result + "`\n"
    "The install/auto-update URL may be down. Check "
    "<https://trippixn.com/psnppp.meta.js>\n"
    "```\n" + detail + "\n```"
)

print(json.dumps({"content": content[:1990]}))')"

[ -n "$payload" ] || { log "could not build the payload; not sending."; exit 0; }

code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 20 --retry 2 --retry-delay 5 \
  -H 'Content-Type: application/json' -X POST -d "$payload" "$WEBHOOK" 2>&1)" || code="request-failed"

case "$code" in
  2*) log "alert sent (HTTP $code)" ;;
  *)  log "alert NOT sent (HTTP $code). The guard failure still stands — see: journalctl -u $UNIT" ;;
esac
exit 0
