#!/usr/bin/env bash
#
# PSNP++ - Database Backup
# ========================
#
# Takes a daily consistent copy of the sync database.
#
# Until this existed there was no backup at all. The one copy on the box was
# taken by hand, sat in the SAME DIRECTORY on the SAME DISK as the original, and
# was a day and twenty-one revisions stale within hours. Every list on every
# device is reconstructible from this file and from nothing else.
#
# `.backup`, never `cp`. The database runs in WAL mode, so a plain copy of the
# .db alone can miss committed data still sitting in the -wal file — a backup
# that restores to a silently older state is worse than an obvious failure.
# `.backup` takes a proper consistent snapshot of a live database.
#
# Writes OUTSIDE the sidecar's ReadWritePaths. The sidecar is internet-facing
# and runs as root; a file-write bug in it must not be able to reach the copies
# that exist to survive exactly that.
#
# Developer: Trippixn
# Website:   https://trippixn.com
# Discord:   discord.gg/syria

set -euo pipefail

DB="${PSNPPP_DB:-/root/psnppp/state.db}"
DEST="${PSNPPP_BACKUP_DIR:-/var/lib/psnppp/backups}"
KEEP_DAYS="${PSNPPP_BACKUP_KEEP_DAYS:-14}"

log() { echo "[psnppp-backup] $*"; }
die() { echo "[psnppp-backup] FAIL: $*" >&2; exit 1; }

command -v sqlite3 >/dev/null || die "sqlite3 is not installed; cannot take a consistent copy."
[ -s "$DB" ] || die "no database at $DB — nothing to back up, which is itself worth knowing."

install -d -m 700 "$DEST" || die "cannot create $DEST"

stamp="$(date +%F-%H%M)"
out="$DEST/state-$stamp.db"

sqlite3 "$DB" ".backup '$out'" || die "sqlite3 .backup failed for $DB"
chmod 600 "$out"

# A file that exists proves nothing: a truncated or half-written copy is exactly
# the kind of backup that is only discovered to be useless at the moment it is
# needed. Open it and ask SQLite whether it is sound, and confirm it actually
# carries the table the whole thing exists for.
verdict="$(sqlite3 "$out" 'PRAGMA integrity_check;' 2>&1 || echo failed)"
[ "$verdict" = "ok" ] || die "backup at $out did not verify: $verdict"

revisions="$(sqlite3 "$out" "SELECT COUNT(*) FROM document_history;" 2>/dev/null || echo 0)"
[ "$revisions" -gt 0 ] || die "backup at $out has no revision history — refusing to call that a backup."

bytes="$(wc -c < "$out" | tr -d ' ')"
log "OK: $out ($bytes bytes, $revisions revisions, integrity ok)"

# Prune by age, and only ever files this script's own naming produced.
deleted="$(find "$DEST" -maxdepth 1 -name 'state-*.db' -type f -mtime +"$KEEP_DAYS" -print -delete | wc -l | tr -d ' ')"
[ "$deleted" -eq 0 ] || log "pruned $deleted backup(s) older than $KEEP_DAYS days"

# Never let pruning empty the directory. If a clock jump or a bad retention
# value ever made everything look expired, the failure must be loud and the
# unit must go red rather than quietly leaving nothing behind.
remaining="$(find "$DEST" -maxdepth 1 -name 'state-*.db' -type f | wc -l | tr -d ' ')"
[ "$remaining" -gt 0 ] || die "pruning left no backups at all in $DEST"
log "$remaining backup(s) retained"
