#!/usr/bin/env bash
#
# PSNP++ - Release
# ================
#
# Bump, test, build, publish, and verify a userscript release end to end.
#
# Author: Trippixn
# Server: discord.gg/syria
#
# Usage:  scripts/release.sh [patch|minor|major]   (default: patch)
#         scripts/release.sh patch --dry-run       (everything except publishing)
#         npm run release -- patch --dry-run       (the `--` matters: see below)
#
# Every step is chained with && or guarded by `set -e`: a failing test or a
# failing build can never reach the publish step. That is deliberate — an
# earlier version of the deploy runbook documented its checks as prose and
# would happily have deployed past a red suite.

set -euo pipefail

BUMP="patch"
DRY_RUN=""
# Order-independent, and it also honours npm_config_dry_run. That last part is
# not a nicety: `npm run release patch --dry-run` — the form this repo's README
# documented — has npm CONSUME the flag, so the script saw only "patch" and
# published for real. A dry run that silently publishes is the worst possible
# failure here, so accept every spelling rather than rely on the caller getting
# `npm run release -- patch --dry-run` exactly right.
[ "${npm_config_dry_run:-}" = "true" ] && DRY_RUN="--dry-run"
for arg in "$@"; do
  case "$arg" in
    patch|minor|major) BUMP="$arg" ;;
    --dry-run|-n)      DRY_RUN="--dry-run" ;;
    *) echo "ABORT: unknown argument '$arg'. Usage: release.sh [patch|minor|major] [--dry-run]"; exit 1 ;;
  esac
done
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Host-specific settings live in scripts/deploy.env, which is gitignored — this
# script is public and must not carry anyone's server address or key path.
# See scripts/deploy.env.example.
# shellcheck source=/dev/null
[ -f "$REPO/scripts/deploy.env" ] && . "$REPO/scripts/deploy.env"

VPS="${PSNPPP_VPS:-}"
KEY="${PSNPPP_SSH_KEY:-$HOME/.ssh/id_ed25519}"
BASE_URL="${PSNPPP_BASE_URL:-}"
# The artifacts get their OWN directory, deliberately NOT the site's document
# root (2026-08-09). They used to sit in the portfolio's web root and a
# full-sync deploy of the portfolio (rsync --delete) deleted them as extraneous,
# 404'ing the install URL and silently freezing every client's auto-update.
# nginx maps the unchanged public URLs here via `location =` blocks.
WEBROOT="${PSNPPP_WEBROOT:-/var/www/psnppp}"
# The guard's pristine copy. Deliberately outside the sidecar's ReadWritePaths,
# so a file-write bug in an internet-facing service cannot reach the bytes that
# get published to a JavaScript URL every browser auto-executes.
PRISTINE="${PSNPPP_PRISTINE:-/var/lib/psnppp/published}"
CURL_TIMEOUT=20

[ -n "$VPS" ] && [ -n "$BASE_URL" ] || {
  echo "ABORT: no deploy target configured."
  echo "  cp scripts/deploy.env.example scripts/deploy.env  and fill it in,"
  echo "  or set PSNPPP_VPS and PSNPPP_BASE_URL in the environment."
  exit 1
}

cd "$REPO"

echo "=== 1. clean tree? ==="
if [ -n "$(git status --porcelain)" ]; then
  echo "ABORT: uncommitted changes. Commit first — a release must be reproducible from git."
  git status --short
  exit 1
fi
echo "clean"

echo "=== 2. tests (gate) ==="
# One run, not two. The old shape piped the first run into grep and put the
# ABORT on a second run — so a failure tripped set -e on the pipeline and the
# ABORT message never printed, while a passing suite was executed twice.
if ! npm test >/tmp/psnppp-jstest.log 2>&1; then
  tail -30 /tmp/psnppp-jstest.log
  echo "ABORT: JS suite failed (full output: /tmp/psnppp-jstest.log)"; exit 1
fi
grep -E "^. (pass|fail)" /tmp/psnppp-jstest.log || echo "(test reporter format changed — summary not parsed)"
( cd sidecar && .venv/bin/python -m pytest tests/ -q ) || { echo "ABORT: Python suite failed"; exit 1; }

echo "=== 3. bump version ($BUMP) ==="
OLD_VERSION="$(node -p "require('./package.json').version")"
npm version "$BUMP" --no-git-tag-version >/dev/null
NEW_VERSION="$(node -p "require('./package.json').version")"
echo "$OLD_VERSION -> $NEW_VERSION"

echo "=== 4. build ==="
npm run build

echo "=== 5. verify the artifacts carry the new version ==="
for f in dist/psnppp.user.js dist/psnppp.meta.js; do
  grep -q "@version      $NEW_VERSION" "$f" || { echo "ABORT: $f is not $NEW_VERSION"; exit 1; }
  echo "$f OK"
done
# The auto-start guard must survive bundling, or the script silently never runs.
grep -q "typeof document" dist/psnppp.user.js || { echo "ABORT: auto-start guard missing from bundle"; exit 1; }
echo "auto-start guard present"

# The built metadata must be banner.txt with the version filled in, exactly.
# The unit suite cannot check this: it runs at step 2, BEFORE the build, so it
# only ever sees the PREVIOUS release's dist and a banner edit is invisible to
# it. That is not hypothetical — removing `@grant unsafeWindow` from the banner
# left a committed dist still declaring it, and every existing test passed,
# because they assert directives are PRESENT and none assert the two files
# agree. A dropped @grant or @connect builds a script that installs and then
# fails on its first request.
sed "s/{{VERSION}}/$NEW_VERSION/g" userscript/banner.txt > /tmp/psnppp-banner-expected.txt
sed -n '1,/==\/UserScript==/p' dist/psnppp.meta.js > /tmp/psnppp-banner-actual.txt
diff -q /tmp/psnppp-banner-expected.txt /tmp/psnppp-banner-actual.txt >/dev/null \
  || { echo "ABORT: dist metadata does not match banner.txt:"; diff /tmp/psnppp-banner-expected.txt /tmp/psnppp-banner-actual.txt; exit 1; }
echo "metadata matches banner.txt"

if [ "$DRY_RUN" = "--dry-run" ]; then
  echo "=== DRY RUN: stopping before publish. Reverting the version bump. ==="
  git checkout -- package.json package-lock.json 2>/dev/null || git checkout -- package.json
  npm run build >/dev/null
  exit 0
fi

echo "=== 6. commit the release ==="
# Name the paths. `git add -A` here would sweep in whatever else happens to be
# sitting in the tree — editor scratch, tooling working directories, notes —
# and this repo is public, so "whatever else" gets published permanently. Step 1
# already guarantees the tree was clean before we started, so these four are the
# only things that can legitimately have changed.
git add package.json package-lock.json dist/psnppp.user.js dist/psnppp.meta.js
if [ -n "$(git status --porcelain --untracked-files=all | grep -v '^M ')" ]; then
  echo "ABORT: the release touched files outside package.json/package-lock.json/dist/."
  echo "Nothing has been published. Review, then either commit them yourself or add them to .gitignore:"
  git status --short --untracked-files=all | grep -v '^M '
  git reset -q
  exit 1
fi
git commit -q -m "Release v$NEW_VERSION"

echo "=== 7. publish ==="
# ORDER MATTERS. The on-box guard treats $PRISTINE as authoritative and restores
# the web root from it within 15 minutes, so the pristine copy is refreshed
# FIRST. Publishing first meant any failure in between — a dropped connection,
# a timeout — left live=new and pristine=old, and the guard then rolled
# production back to the previous release and logged it as a successful repair.
# This order makes a half-finished publish fail upwards instead.
#
# Both copies come from local dist/. Never cp the web root into the pristine
# dir: a truncated upload would become the copy the guard enforces forever.
#
# mkdir -p, because scp into a missing directory silently writes a FILE named
# after it instead of failing — publishing to /var/www/psnppp as a regular file
# would 404 every request while every step here still looked fine.
ssh -i "$KEY" "$VPS" "mkdir -p '$PRISTINE' '$WEBROOT'"
scp -q -i "$KEY" dist/psnppp.user.js dist/psnppp.meta.js "$VPS:$PRISTINE/"

# Stage then rename, so nginx never serves a half-written file and a failure
# between the two uploads cannot leave user.js new while meta.js is still old
# (Tampermonkey polls meta.js, so that pairing decides whether anyone updates).
ssh -i "$KEY" "$VPS" "set -e
  install -m 644 '$PRISTINE'/psnppp.user.js '$WEBROOT'/.psnppp.user.js.tmp
  install -m 644 '$PRISTINE'/psnppp.meta.js '$WEBROOT'/.psnppp.meta.js.tmp
  mv -f '$WEBROOT'/.psnppp.user.js.tmp '$WEBROOT'/psnppp.user.js
  mv -f '$WEBROOT'/.psnppp.meta.js.tmp '$WEBROOT'/psnppp.meta.js"

echo "=== 8. verify live ==="
# Whether the publish worked and whether THIS MACHINE can reach the internet
# are different questions, and conflating them cost a false ABORT on a release
# that had in fact succeeded: a TLS handshake failure here (curl 35) was
# reported as "live meta.js is <nothing — 404>", blaming the publish for a
# problem on the developer's side of the wire.
#
# curl separates them itself. 22 is an HTTP error — the publish. Anything else
# is DNS, connect, timeout or TLS — us. On the latter we do not guess: we ask
# the SERVER, which is authoritative about what it is serving and is the same
# check the on-box guard makes every fifteen minutes.
verify_live() {
  local rc=0 body
  body="$(curl -fsS --max-time "$CURL_TIMEOUT" "$BASE_URL/psnppp.meta.js" 2>/dev/null)" || rc=$?

  if [ "$rc" -ne 0 ] && [ "$rc" -ne 22 ]; then
    echo "cannot reach $BASE_URL from here (curl $rc) — asking the server instead"
    ssh -i "$KEY" "$VPS" "curl -fsS --max-time 20 '$BASE_URL/psnppp.meta.js'" 2>/dev/null \
      | grep -m1 '@version' | tr -s ' ' | cut -d' ' -f3
    return
  fi
  printf '%s' "$body" | grep -m1 '@version' | tr -s ' ' | cut -d' ' -f3
}

LIVE="$(verify_live || true)"
[ "$LIVE" = "$NEW_VERSION" ] \
  || { echo "ABORT: live meta.js is '${LIVE:-<nothing — 404, or the SPA fallback answered with HTML>}', expected $NEW_VERSION"; exit 1; }
echo "live meta.js = $LIVE"

# NOT `curl | grep -q`. grep -q exits on the first match while curl still has
# ~96 KB to push; curl dies on the closed pipe (exit 23) and pipefail promotes
# it, so the check reported failure on success — and because it sat on the left
# of &&, set -e exempted it and the release sailed past. It could neither pass
# nor fail. cmp reads all of stdin, so no early exit, and it catches truncation
# too — a body cut off after the metadata block passes any @version check.
#
# Same split as above: when this machine cannot reach the host, compare on the
# server against the copy the publish put there.
user_rc=0
curl -fsS --max-time "$CURL_TIMEOUT" "$BASE_URL/psnppp.user.js" 2>/dev/null | cmp -s - dist/psnppp.user.js || user_rc=$?
if [ "$user_rc" -ne 0 ]; then
  remote="$(ssh -i "$KEY" "$VPS" "curl -fsS --max-time 20 '$BASE_URL/psnppp.user.js' | cmp -s - '$WEBROOT/psnppp.user.js' && echo same" 2>/dev/null || true)"
  [ "$remote" = "same" ] \
    || { echo "ABORT: live user.js is not byte-identical to what was published"; exit 1; }
  echo "live user.js = byte-identical (verified on the server; unreachable from here)"
else
  echo "live user.js = byte-identical to dist ($(wc -c < dist/psnppp.user.js) bytes)"
fi

echo "=== 9. sync API still routed ==="
# Assert the BODY, not the status. If the host puts an SPA catch-all in front of
# this domain, any unmatched path answers 200 with HTML — a status-code check
# there cannot distinguish "routed" from "gone".
HEALTH="$(curl -fsS --max-time "$CURL_TIMEOUT" "$BASE_URL/api/psnppp/health" 2>/dev/null || true)"
case $HEALTH in
  *'"status":"ok"'*) echo "sync API = ROUTED" ;;
  *) echo "ABORT: sync API not routed — $BASE_URL/api/psnppp/health returned '${HEALTH:0:80}'"; exit 1 ;;
esac

# If this host runs other services behind the same nginx, check them here.
# Kept out of the repo on purpose: which neighbours exist is deployment detail,
# and one of them belongs to someone else.
if [ -x "$REPO/scripts/post-release.local.sh" ]; then
  echo "=== 9b. local post-release checks ==="
  "$REPO/scripts/post-release.local.sh" "$NEW_VERSION"
fi

echo
echo "=== v$NEW_VERSION released. Tampermonkey will pick it up on its next poll. ==="
