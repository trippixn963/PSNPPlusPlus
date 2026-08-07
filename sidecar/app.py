"""PSNP list sync sidecar — a single-document store with a revision guard.

Stores one JSON document (all of one user's PSNP+ game lists) behind a shared
secret. Concurrency is handled optimistically: a client sends the revision its
edit was based on, and a mismatch returns 409 with the server's current copy so
the client can re-merge.

Bound to loopback only; nginx terminates TLS and proxies /api/psnp-sync/.
No CORS middleware — the only client is a userscript using GM_xmlhttpRequest,
which is not subject to CORS.
"""
from __future__ import annotations

import hmac
import json
import os
import sqlite3
import time
from pathlib import Path
from typing import Any

from fastapi import FastAPI, Header, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

DOC_VERSION = 1
DOC_ID = 1
DB_BUSY_TIMEOUT_SECONDS = 10.0

app = FastAPI(title="psnp-sync", docs_url=None, redoc_url=None)


def _sync_key() -> str:
    return os.environ.get("PSNP_SYNC_KEY", "")


def _db_path() -> Path:
    return Path(os.environ.get("PSNP_SYNC_DB", str(Path(__file__).parent / "state.db")))


def _now_ms() -> int:
    return int(time.time() * 1000)


def _connect() -> sqlite3.Connection:
    """Open the store, creating the schema on first use.

    WAL is a persistent property of the file, so setting it on every connect is
    cheap and keeps a fresh database (or a test's tmp file) correct.
    """
    conn = sqlite3.connect(_db_path(), timeout=DB_BUSY_TIMEOUT_SECONDS)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")
    conn.execute(
        "CREATE TABLE IF NOT EXISTS state ("
        "  id INTEGER PRIMARY KEY,"
        "  revision INTEGER NOT NULL,"
        "  updated_at INTEGER NOT NULL,"
        "  doc TEXT NOT NULL)"
    )
    return conn


def _require_key(provided: str | None) -> None:
    """Constant-time secret check. An unset server key locks the API entirely."""
    expected = _sync_key()
    if not expected or provided is None or not hmac.compare_digest(provided, expected):
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


@app.get("/api/psnp-sync/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/psnp-sync/state")
def get_state(x_sync_key: str | None = Header(default=None)) -> dict[str, Any]:
    _require_key(x_sync_key)
    revision, updated_at, doc = _read_state()
    return {"revision": revision, "updatedAt": updated_at, "doc": doc}


@app.put("/api/psnp-sync/state")
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
