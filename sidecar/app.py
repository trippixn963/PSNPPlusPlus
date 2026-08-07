"""
PSNP++ - Sync Sidecar
=====================

PSNP++ list sync sidecar — a single-document store with a revision guard.

Stores one JSON document (all of one user's PSNP+ game lists) behind a shared
secret. Concurrency is handled optimistically: a client sends the revision its
edit was based on, and a mismatch returns 409 with the server's current copy so
the client can re-merge.

Bound to loopback only; nginx terminates TLS and proxies /api/psnppp/.
No CORS middleware — the only client is a userscript using GM_xmlhttpRequest,
which is not subject to CORS.

Author: Trippixn
Server: discord.gg/syria
"""
from __future__ import annotations

import hmac
import json
import os
import sqlite3
import threading
import time
from pathlib import Path
from typing import Any

from fastapi import FastAPI, Header, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

DOC_VERSION = 1
DOC_ID = 1
DB_BUSY_TIMEOUT_SECONDS = 10.0

app = FastAPI(title="PSNP++", docs_url=None, redoc_url=None)

# Guards one-time cold-start setup per database file (see _ensure_ready).
# Keyed by path rather than initialized once at import time, so it stays
# correct when tests monkeypatch PSNP_SYNC_DB to a new tmp_path per test.
_schema_lock = threading.Lock()
_schema_ready_paths: set[str] = set()


def _sync_key() -> str:
    return os.environ.get("PSNP_SYNC_KEY", "")


def _db_path() -> Path:
    return Path(os.environ.get("PSNP_SYNC_DB", str(Path(__file__).parent / "state.db")))


def _now_ms() -> int:
    return int(time.time() * 1000)


def _ensure_ready(conn: sqlite3.Connection, db_path: str) -> None:
    """Bring a brand-new database file to a ready state, exactly once.

    Two operations here are unsafe to run concurrently against a fresh file:
    switching journal mode to WAL and creating the schema table both require
    SQLite to take an exclusive lock on the file, and if two threads race
    either one, SQLite raises `sqlite3.OperationalError: database is locked`
    immediately. That lock class is not covered by the busy-timeout retry,
    which only retries ordinary SQLITE_BUSY against an already-established
    file. (An earlier version of this fix serialized only the CREATE TABLE
    and left the WAL switch unguarded — a two-thread cold-start repro still
    reproduced the same error there, just on the PRAGMA statement instead.)
    Serializing this first-time setup behind a lock, keyed by path and
    checked with double-checked locking, removes the race: only one thread
    ever performs it for a given file. Every other connection then finds a
    file already in WAL mode with the schema present, at which point
    re-issuing the same PRAGMAs (still done per-connection in `_connect`,
    since they are session settings) is a cheap, lock-free no-op.
    """
    if db_path in _schema_ready_paths:
        return
    with _schema_lock:
        if db_path in _schema_ready_paths:
            return
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA synchronous=NORMAL")
        conn.execute(
            "CREATE TABLE IF NOT EXISTS state ("
            "  id INTEGER PRIMARY KEY,"
            "  revision INTEGER NOT NULL,"
            "  updated_at INTEGER NOT NULL,"
            "  doc TEXT NOT NULL)"
        )
        conn.commit()
        _schema_ready_paths.add(db_path)


def _connect() -> sqlite3.Connection:
    """Open a connection to the state database.

    The first connection to a given file must switch it to WAL mode and
    create the schema — both are whole-file, one-time changes, so
    `_ensure_ready` serializes them to avoid concurrent cold starts
    colliding (see its docstring). Every connection, including that first
    one, still issues its own WAL/synchronous PRAGMAs here, because those
    are per-connection session settings; once a file is already ready this
    is a cheap, lock-free no-op. If anything below fails, the connection is
    closed before the error propagates, so no path can leak it.
    """
    db_path = str(_db_path())
    conn = sqlite3.connect(db_path, timeout=DB_BUSY_TIMEOUT_SECONDS)
    try:
        _ensure_ready(conn, db_path)
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA synchronous=NORMAL")
    except Exception:
        conn.close()
        raise
    return conn


def _require_key(provided: str | None) -> None:
    """Constant-time secret check. An unset server key locks the API entirely.

    Both sides are encoded to bytes first. `hmac.compare_digest` accepts str
    arguments only when both are ASCII-only, and raises TypeError otherwise —
    and uvicorn decodes request headers as latin-1, so any header byte above
    0x7F produces a str this function cannot compare. Passing that straight to
    compare_digest turned a bad key into an unauthenticated HTTP 500 with a
    traceback instead of a 401. Encoding is not a weakening: the transform is
    applied identically to both operands, compare_digest is still constant-time
    over bytes, and a non-ASCII header can never encode to the same bytes as an
    ASCII key, so it still fails closed.
    """
    expected = _sync_key()
    if not expected or provided is None:
        raise HTTPException(status_code=401, detail="Invalid sync key")
    if not hmac.compare_digest(provided.encode("utf-8"), expected.encode("utf-8")):
        raise HTTPException(status_code=401, detail="Invalid sync key")


def _read_state() -> tuple[int, int, dict[str, Any]]:
    conn = _connect()
    try:
        row = conn.execute(
            "SELECT revision, updated_at, doc FROM state WHERE id = ?", (DOC_ID,)
        ).fetchone()
    finally:
        conn.close()
    if row is None:
        return 0, 0, {"version": DOC_VERSION, "lists": {}}
    return row[0], row[1], json.loads(row[2])


class PutState(BaseModel):
    baseRevision: int
    doc: dict[str, Any]


@app.get("/api/psnppp/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/psnppp/state")
def get_state(x_sync_key: str | None = Header(default=None)) -> dict[str, Any]:
    _require_key(x_sync_key)
    revision, updated_at, doc = _read_state()
    return {"revision": revision, "updatedAt": updated_at, "doc": doc}


@app.put("/api/psnppp/state")
def put_state(
    payload: PutState, x_sync_key: str | None = Header(default=None)
) -> Any:
    _require_key(x_sync_key)

    if payload.doc.get("version") != DOC_VERSION:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported doc version: {payload.doc.get('version')!r}",
        )

    now = _now_ms()
    conn = _connect()
    try:
        # IMMEDIATE takes the write lock up front, so the read-compare-write
        # below cannot interleave with another writer's transaction.
        conn.execute("BEGIN IMMEDIATE")
        row = conn.execute(
            "SELECT revision, updated_at, doc FROM state WHERE id = ?", (DOC_ID,)
        ).fetchone()
        current_revision = row[0] if row else 0

        if payload.baseRevision != current_revision:
            current_doc = json.loads(row[2]) if row else {"version": DOC_VERSION, "lists": {}}
            current_updated = row[1] if row else 0
            conn.rollback()
            return JSONResponse(
                status_code=409,
                content={
                    "revision": current_revision,
                    "updatedAt": current_updated,
                    "doc": current_doc,
                },
            )

        new_revision = current_revision + 1
        conn.execute(
            "INSERT INTO state (id, revision, updated_at, doc) VALUES (?, ?, ?, ?) "
            "ON CONFLICT(id) DO UPDATE SET revision = excluded.revision, "
            "updated_at = excluded.updated_at, doc = excluded.doc",
            (DOC_ID, new_revision, now, json.dumps(payload.doc, separators=(",", ":"))),
        )
        conn.commit()
    finally:
        conn.close()

    return {"revision": new_revision, "updatedAt": now}
