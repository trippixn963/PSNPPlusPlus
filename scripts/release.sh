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
#
# Every step is chained with && or guarded by `set -e`: a failing test or a
# failing build can never reach the publish step. That is deliberate — an
# earlier version of the deploy runbook documented its checks as prose and
# would happily have deployed past a red suite.

set -euo pipefail

BUMP="${1:-patch}"
DRY_RUN="${2:-}"
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VPS="user@your-server.example"
KEY="$HOME/.ssh/your-ssh-key"
WEBROOT="/var/www/trippixn.com"

cd "$REPO"

echo "=== 1. clean tree? ==="
if [ -n "$(git status --porcelain)" ]; then
  echo "ABORT: uncommitted changes. Commit first — a release must be reproducible from git."
  git status --short
  exit 1
fi
echo "clean"

echo "=== 2. tests (gate) ==="
npm test 2>&1 | grep -E "^. (pass|fail)"
npm test >/dev/null 2>&1 || { echo "ABORT: JS suite failed"; exit 1; }
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

if [ "$DRY_RUN" = "--dry-run" ]; then
  echo "=== DRY RUN: stopping before publish. Reverting the version bump. ==="
  git checkout -- package.json package-lock.json 2>/dev/null || git checkout -- package.json
  npm run build >/dev/null
  exit 0
fi

echo "=== 6. commit the release ==="
git add -A
git -c user.name="Trippixn" -c user.email="90400991+trippixn963@users.noreply.github.com" \
    commit -q -m "Release v$NEW_VERSION"

echo "=== 7. publish ==="
scp -q -i "$KEY" dist/psnppp.user.js dist/psnppp.meta.js "$VPS:$WEBROOT/"

echo "=== 8. verify live ==="
LIVE="$(curl -s --max-time 20 https://trippixn.com/psnppp.meta.js | grep '@version' | tr -s ' ' | cut -d' ' -f3)"
[ "$LIVE" = "$NEW_VERSION" ] || { echo "ABORT: live meta.js is $LIVE, expected $NEW_VERSION"; exit 1; }
echo "live meta.js = $LIVE"
curl -s --max-time 20 https://trippixn.com/psnppp.user.js | grep -q "@version      $NEW_VERSION" \
  && echo "live user.js = $NEW_VERSION"

echo "=== 9. sidecar + neighbours unharmed ==="
# A 200 proves nothing on this host: nginx has a catch-all SPA fallback that
# serves the portfolio's HTML for any unmatched path. Assert bodies instead.
curl -s --max-time 20 https://trippixn.com/api/psnppp/health | grep -q '"status":"ok"' \
  && echo "psnppp   = ROUTED" || { echo "ABORT: sync API not routed"; exit 1; }
curl -s -o /dev/null -w 'portfolio = %{http_code}\n' --max-time 20 https://trippixn.com/
curl -s --max-time 20 https://trippixn.com/api/stats | grep -q '"success":' \
  && echo "syria    = ROUTED" || echo "WARNING: a neighbouring service API not routed"
# 405/404 is healthy here — only the SPA fallback can return 200.
curl -s -o /dev/null -w 'neighbour    = %{http_code} (405/404 healthy, 200 = fell through)\n' \
  --max-time 20 https://trippixn.com/api/neighbour/games

echo
echo "=== v$NEW_VERSION released. Tampermonkey will pick it up on its next poll. ==="
