#!/usr/bin/env bash
#
# PSNP++ - Publish Guard
# ======================
#
# Keeps the install/auto-update URL alive.
#
# Why this exists. That URL is the single point of failure for the whole
# project, and when it breaks NOTHING reports it. Tampermonkey polls @updateURL
# on its own schedule; a 404, an HTML body, or a truncated file all read to it
# as "no update available". Every installed copy keeps running old code and
# keeps saying it is up to date. You would find out months later by noticing a
# release nobody received.
#
# Not hypothetical: on 2026-08-09 a portfolio deploy (rsync --delete over a
# shared web root) deleted both artifacts and the URL 404'd silently.
#
# The artifacts now live in their own directory, which closes that hole. This
# guard covers the rest — anything that empties, truncates, or stops serving
# them. It restores from a pristine copy kept off the web root and refreshed by
# every release.
#
# Two design rules, both learned the hard way:
#   - Compare BODIES, never status codes. The site has an SPA catch-all that
#     answers 200 with index.html for any unmatched path, so a status check
#     cannot distinguish "published" from "deleted".
#   - Never repair downwards. A pristine copy that has fallen behind live is a
#     rollback waiting to be mistaken for a fix, so the guard refuses and says
#     so rather than "healing" production to an older release.
#
# Developer: Trippixn
# Website:   https://trippixn.com
# Discord:   discord.gg/syria

set -euo pipefail

PRISTINE="/var/lib/psnppp/published"
WEBROOT="/var/www/psnppp"
BASE_URL="https://trippixn.com"
FILES=(psnppp.user.js psnppp.meta.js)
CURL_TIMEOUT=20
# The sidecar's own liveness probe. Unauthenticated by design, so the guard
# needs no copy of the sync key to ask.
HEALTH_PATH="/api/psnppp/health"
HEALTH_EXPECT='"status":"ok"'

STATE_DIR="/var/lib/psnppp"

# journald reads a leading <N> as a syslog priority, so a healthy run can be
# silent at notice level while repairs and failures stay visible. Without this
# the ~96 runs/day of "OK" bury a REPAIR within two hours of the journal.
log()  { echo "<6>[psnppp-guard] $*"; }
warn() { echo "<4>[psnppp-guard] $*"; }
die()  { echo "<3>[psnppp-guard] FAIL: $*" >&2; exit 1; }

# Version out of a FILE. `|| true` is load-bearing: without it a missing
# @version makes grep exit 1, pipefail promotes it, set -e kills the script AT
# THE ASSIGNMENT, and the caller's careful error message never prints. A guard
# against silent failure must not fail silently.
version_of() {
  grep -m1 '@version' "$1" 2>/dev/null | tr -s ' ' | cut -d' ' -f3 || true
}

# Version out of a STRING. Deliberately no pipe: feeding a 96 KB body into
# `grep -m1` makes grep exit on the first match while the writer is still
# pushing, and the writer dies on the closed pipe — the same trap documented at
# the response check below, which here only surfaced as "printf: write error:
# Broken pipe" spraying into the journal on every healthy run.
version_in() {
  local re='@version[[:space:]]+([^[:space:]]+)'
  [[ $1 =~ $re ]] && printf '%s' "${BASH_REMATCH[1]}"
}

# ---- what SHOULD be live -----------------------------------------------------
for f in "${FILES[@]}"; do
  [ -s "$PRISTINE/$f" ] \
    || die "no pristine copy at $PRISTINE/$f — cannot verify or repair. Re-run 'npm run release'."
done

EXPECTED_VERSION="$(version_of "$PRISTINE/psnppp.meta.js")"
[ -n "$EXPECTED_VERSION" ] \
  || die "pristine $PRISTINE/psnppp.meta.js has no @version line — refusing to act on a copy I cannot read."

[ ! -e "$WEBROOT" ] || [ -d "$WEBROOT" ] \
  || die "$WEBROOT exists but is a FILE, not a directory — an scp landed on a missing path. Remove it and re-run 'npm run release'."
install -d -m 755 "$WEBROOT" \
  || die "cannot create $WEBROOT — read-only filesystem, or the disk is full."

# ---- refuse to roll production back ------------------------------------------
# cmp is direction-blind, so without this the guard will happily overwrite a
# NEWER live release with an older pristine copy and log it as a repair. That is
# reachable today: a hand-publish straight to the web root does not refresh the
# pristine copy, and 15 minutes later the guard "fixes" it.
LIVE_VERSION="$(version_of "$WEBROOT/psnppp.meta.js")"
if [ -n "$LIVE_VERSION" ] && [ "$LIVE_VERSION" != "$EXPECTED_VERSION" ] \
   && [ "$(printf '%s\n%s\n' "$LIVE_VERSION" "$EXPECTED_VERSION" | sort -V | tail -1)" = "$LIVE_VERSION" ]; then
  die "REFUSING TO REPAIR: $WEBROOT serves v$LIVE_VERSION, which is NEWER than the pristine v$EXPECTED_VERSION. Restoring would DOWNGRADE the live site. Someone published without refreshing $PRISTINE. Fix with: cp $WEBROOT/psnppp.{user,meta}.js $PRISTINE/"
fi

# ---- 1. the files on disk ----------------------------------------------------
repaired=0
for f in "${FILES[@]}"; do
  if [ -s "$WEBROOT/$f" ] && cmp -s "$PRISTINE/$f" "$WEBROOT/$f"; then
    continue
  fi

  if [ ! -e "$WEBROOT/$f" ]; then
    reason="the file is GONE — something deleted it"
  elif [ ! -s "$WEBROOT/$f" ]; then
    reason="the file is 0 bytes — a write failed midway"
  else
    reason="content differs from pristine (on disk: $(wc -c < "$WEBROOT/$f") bytes, v$(version_of "$WEBROOT/$f"))"
  fi
  warn "REPAIR: $WEBROOT/$f — $reason. Restoring v$EXPECTED_VERSION ($(wc -c < "$PRISTINE/$f") bytes) from $PRISTINE/$f"

  # Stage then rename. `install` truncates in place, so repairing directly over
  # the live path serves a partial 96 KB script to anyone mid-download — the
  # guard briefly causing the corruption it exists to fix. Rename within a
  # directory is atomic and nginx keeps serving the old inode until it lands.
  install -m 644 "$PRISTINE/$f" "$WEBROOT/.$f.tmp" \
    || die "could not stage $WEBROOT/.$f.tmp (disk full? read-only mount?) — the live file is untouched."
  mv -f "$WEBROOT/.$f.tmp" "$WEBROOT/$f" \
    || die "could not replace $WEBROOT/$f — the staged copy is left at $WEBROOT/.$f.tmp."
  repaired=1
done

# ---- 2. what the internet actually gets --------------------------------------
serving_ok=1
unreachable=0
curl_err="$(mktemp)"
trap 'rm -f "$curl_err"' EXIT

# curl APPENDS a line per attempt, and --retry 2 means three of them, so reading
# the whole file put "...error: 502error: 502error: 502" in the alert. The last
# line is the outcome; the earlier ones are the same failure being retried.
curl_reason() { tail -1 "$curl_err" | tr -d '\n'; }

for f in "${FILES[@]}"; do
  rc=0
  # `|| rc=$?`, not `if ! body=$(...)` — `!` resets $? and the exit code is lost.
  # --retry absorbs the few seconds of an nginx reload or a cert renewal; without
  # it a routine blip raises a failure that reads as "nginx is misconfigured".
  body="$(curl -fsS --max-time "$CURL_TIMEOUT" --retry 2 --retry-delay 5 "$BASE_URL/$f" 2>"$curl_err")" || rc=$?

  if [ "$rc" -ne 0 ]; then
    # curl separates these itself and the distinction decides which file the
    # operator opens: 22 is an HTTP error (the publish), anything else is this
    # box's network, DNS, or TLS (not the publish).
    if [ "$rc" -eq 22 ]; then
      warn "BROKEN: GET $BASE_URL/$f — $(curl_reason)"
      serving_ok=0
    else
      warn "UNREACHABLE: GET $BASE_URL/$f — curl exit $rc: $(curl_reason). That is this host's network/DNS/TLS, so nothing is concluded about the publish."
      unreachable=1
    fi
  elif [[ $body != "// ==UserScript=="* ]]; then
    warn "BROKEN: $BASE_URL/$f is not the userscript — first bytes: $(printf '%.40s' "$body")"
    serving_ok=0
  else
    served_version="$(version_in "$body")"
    if [ "$served_version" != "$EXPECTED_VERSION" ]; then
      warn "BROKEN: $BASE_URL/$f serves v${served_version:-<none>}, expected v$EXPECTED_VERSION"
      serving_ok=0
    fi
  fi
done

if [ "$serving_ok" -eq 0 ]; then
  prefix="the files on disk are correct but"
  [ "$repaired" -eq 1 ] && prefix="the files were restored but"
  die "$prefix the URL is still wrong — this is the serving layer, not the files, and no copy will fix it. Check that 'location = /psnppp.user.js' still has 'root $WEBROOT' (canonical copy: sidecar/deploy/nginx-psnppp.conf) and that nginx reloaded."
fi

if [ "$unreachable" -eq 1 ]; then
  die "could not reach $BASE_URL from this host — network, DNS or TLS here. The files on disk are $([ "$repaired" -eq 1 ] && echo restored || echo correct); nothing was concluded about nginx."
fi

# ---- 3. the API behind those URLs ---------------------------------------------
# The two checks above pass with the sidecar completely dead: the artifacts are
# static files served by nginx, and they keep being served whatever happened to
# uvicorn. That gap was real — stopping psnppp.service and running this script
# left it reporting success while syncing was down, and the only signal anywhere
# was the chip going Offline in a browser.
#
# Asserts the BODY, like everything else here. The site answers unmatched paths
# with 200 and an SPA index, so a status code cannot tell "the API is up" from
# "nginx no longer routes /api/psnppp/ and you are looking at the homepage" —
# and the second is exactly what a bad nginx edit produces.
#
# This never repairs. Copying files cannot restart a service, and pretending
# otherwise would just add a repair that always fails. It reports, and the
# OnFailure alert on this unit carries it.
rc=0
health="$(curl -fsS --max-time "$CURL_TIMEOUT" --retry 2 --retry-delay 5 "$BASE_URL$HEALTH_PATH" 2>"$curl_err")" || rc=$?
if [ "$rc" -ne 0 ]; then
  if [ "$rc" -eq 22 ]; then
    die "SIDECAR DOWN: GET $BASE_URL$HEALTH_PATH — $(curl_reason). The published files are fine; syncing is not. Check: systemctl status psnppp.service"
  fi
  die "could not reach $BASE_URL$HEALTH_PATH from this host — curl exit $rc: $(curl_reason). That is this host's network/DNS/TLS, so nothing is concluded about the sidecar."
fi
case "$health" in
  *"$HEALTH_EXPECT"*) ;;
  *) die "SIDECAR WRONG: $BASE_URL$HEALTH_PATH answered without $HEALTH_EXPECT — first bytes: $(printf '%.60s' "$health"). Either the app is broken or nginx stopped routing /api/psnppp/ and this is the SPA catch-all." ;;
esac

# ---- 4. a repair that keeps happening is not a repair ------------------------
# Restoring the files every 15 minutes forever would keep the URL up while
# quietly losing the fight, exiting 0 each time. Two in a row means something is
# actively deleting them and copying files back is hiding it.
install -d -m 755 "$STATE_DIR"
if [ "$repaired" -eq 1 ]; then
  if [ -f "$STATE_DIR/.last-run-repaired" ]; then
    die "repaired on two consecutive runs — something is ACTIVELY removing $WEBROOT/. Find the writer; restoring the files is masking it."
  fi
  : > "$STATE_DIR/.last-run-repaired"
  warn "OK: repaired and verified live at v$EXPECTED_VERSION"
else
  rm -f "$STATE_DIR/.last-run-repaired"
  log "OK: v$EXPECTED_VERSION serving"
fi
