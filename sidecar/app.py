"""
PSNP++ - Sync Sidecar
=====================

PSNP++ sync sidecar — a keyed multi-document store with per-document revision
history.

Stores a small, fixed set of JSON documents (today: `lists`, one user's PSNP+
game lists, and `settings`, that user's PSNP+ preferences) behind a shared
secret. Concurrency is handled optimistically per document: a client sends the
revision its edit was based on, and a mismatch returns 409 with the server's
current copy of THAT document so the client can re-merge.

Every accepted write also appends the new state to a history table, capped at
HISTORY_LIMIT revisions per document and pruned oldest-first inside the same
transaction as the write. That history is what makes cross-device undo possible:
a past revision can be fetched, and restored — as a NEW revision, never by
rewriting what is already recorded.

An absent `document` parameter means `lists`, so a client written against the
original single-document API (which had no such parameter) keeps working
byte-for-byte unchanged against this server.

Bound to loopback only; nginx terminates TLS and proxies /api/psnppp/.
No CORS middleware — the only client is a userscript using GM_xmlhttpRequest,
which is not subject to CORS.

Author: Trippixn
Server: discord.gg/syria
"""
from __future__ import annotations

import copy
import hmac
import json
import os
import sqlite3
import threading
import time
from pathlib import Path
from typing import Any

from fastapi import FastAPI, Header, HTTPException, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel

DOC_VERSION = 1
DB_BUSY_TIMEOUT_SECONDS = 10.0

# Revisions retained per document. Pruned oldest-first in the same transaction
# as the write that pushes the count over the line, so the table cannot grow
# without bound no matter how long the service runs.
HISTORY_LIMIT = 100

# The single-row `state` table this store replaced kept its only row at id = 1.
# Read once, at startup, by the legacy migration; nothing else uses it.
LEGACY_DOC_ID = 1

DEFAULT_DOCUMENT = "lists"

# The document allowlist, and the empty state each key starts from.
#
# These are ONE constant on purpose: a document key is only meaningful if the
# server knows what "empty" looks like for it, so adding a document is a single
# edit here rather than a change in two places that can drift apart.
#
# The boundary is deliberately a closed allowlist rather than "create on first
# write". This store holds exactly one person's data and has exactly one client;
# there is no tenancy model and no quota. If an arbitrary key created a document,
# then a typo in a client build ("setting", "lists ") would silently open a
# second, empty document, the client would sync happily against it, and the real
# document would sit untouched while the user watched an empty list — the same
# silent-divergence failure this project has already been bitten by. A 404 is
# noisy, immediate, and cannot lose data. The cost is that adding a document
# means shipping a server change first; that is the intended trade.
EMPTY_DOCUMENTS: dict[str, dict[str, Any]] = {
    "lists": {"version": DOC_VERSION, "lists": {}},
    "settings": {"version": DOC_VERSION, "settings": {}},
}

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


def _migrate_legacy_state(conn: sqlite3.Connection) -> None:
    """Fold a pre-existing single-row `state` table into the keyed store.

    The original schema was one table, `state`, holding exactly one row (id = 1)
    with the user's lists. That row is live production data — the owner's real
    game lists — so this copies it into `documents` under the key `lists` with
    its `revision`, `updated_at` and `doc` text carried across verbatim: the doc
    is moved as the stored TEXT, never re-serialized, so it survives byte for
    byte. History is seeded with that same revision, so the first entry in the
    document's history is the state it was already in.

    Idempotent by construction. Both inserts are ON CONFLICT DO NOTHING, so a
    second startup (or a hundredth) finds `lists` already present and writes
    nothing — including the case where the service has since advanced past the
    migrated revision, which must NOT be rolled back to the legacy row.

    The legacy table is deliberately NOT dropped. It costs one stale copy of a
    small document and it is the only in-database record of the pre-migration
    state; the deploy runbook still requires a file backup first, but a table
    that is never read again is cheap insurance and drops in one statement
    whenever the owner wants it gone.
    """
    present = conn.execute(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'state'"
    ).fetchone()
    if present is None:
        return

    # IMMEDIATE for the same reason the write path uses it: this is a
    # read-then-conditionally-write, and taking the write lock up front means a
    # concurrent writer cannot land between the SELECT and the INSERTs. The
    # process-level _schema_lock already serializes this within one process;
    # this makes it correct across processes too.
    conn.execute("BEGIN IMMEDIATE")
    try:
        legacy = conn.execute(
            "SELECT revision, updated_at, doc FROM state WHERE id = ?",
            (LEGACY_DOC_ID,),
        ).fetchone()
        if legacy is not None:
            revision, updated_at, doc_text = legacy
            conn.execute(
                "INSERT INTO documents (doc_key, revision, updated_at, doc) "
                "VALUES (?, ?, ?, ?) ON CONFLICT(doc_key) DO NOTHING",
                (DEFAULT_DOCUMENT, revision, updated_at, doc_text),
            )
            conn.execute(
                "INSERT INTO document_history (doc_key, revision, updated_at, doc) "
                "VALUES (?, ?, ?, ?) ON CONFLICT(doc_key, revision) DO NOTHING",
                (DEFAULT_DOCUMENT, revision, updated_at, doc_text),
            )
        conn.commit()
    except Exception:
        conn.rollback()
        raise


def _ensure_ready(conn: sqlite3.Connection, db_path: str) -> None:
    """Bring a database file to a ready state, exactly once per path.

    Three operations here are unsafe to run concurrently against a fresh file:
    switching journal mode to WAL and creating the schema tables both require
    SQLite to take an exclusive lock on the file, and if two threads race
    either one, SQLite raises `sqlite3.OperationalError: database is locked`
    immediately. That lock class is not covered by the busy-timeout retry,
    which only retries ordinary SQLITE_BUSY against an already-established
    file. (An earlier version of this fix serialized only the CREATE TABLE
    and left the WAL switch unguarded — a two-thread cold-start repro still
    reproduced the same error there, just on the PRAGMA statement instead.)
    The third is the legacy migration, which must run before any request can
    observe an empty `documents` table on a database that in fact holds the
    owner's lists. Serializing this first-time setup behind a lock, keyed by
    path and checked with double-checked locking, removes the race: only one
    thread ever performs it for a given file. Every other connection then finds
    a file already in WAL mode with the schema present and the migration done,
    at which point re-issuing the same PRAGMAs (still done per-connection in
    `_connect`, since they are session settings) is a cheap, lock-free no-op.

    Ordering matters: the PRAGMAs run before anything that opens a transaction,
    because `PRAGMA journal_mode` is a no-op (silently, returning the current
    mode) when a transaction is already active.
    """
    if db_path in _schema_ready_paths:
        return
    with _schema_lock:
        if db_path in _schema_ready_paths:
            return
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA synchronous=NORMAL")
        conn.execute(
            "CREATE TABLE IF NOT EXISTS documents ("
            "  doc_key TEXT PRIMARY KEY,"
            "  revision INTEGER NOT NULL,"
            "  updated_at INTEGER NOT NULL,"
            "  doc TEXT NOT NULL)"
        )
        # (doc_key, revision) is the primary key, which gives SQLite the exact
        # index the history list, the single-revision fetch and the prune all
        # order by — no secondary index needed, and no way to record the same
        # revision of the same document twice.
        conn.execute(
            "CREATE TABLE IF NOT EXISTS document_history ("
            "  doc_key TEXT NOT NULL,"
            "  revision INTEGER NOT NULL,"
            "  updated_at INTEGER NOT NULL,"
            "  doc TEXT NOT NULL,"
            "  PRIMARY KEY (doc_key, revision))"
        )
        conn.commit()
        _migrate_legacy_state(conn)
        _schema_ready_paths.add(db_path)


def _connect() -> sqlite3.Connection:
    """Open a connection to the state database.

    The first connection to a given file must switch it to WAL mode, create the
    schema and run the legacy migration — all whole-file, one-time changes, so
    `_ensure_ready` serializes them to avoid concurrent cold starts colliding
    (see its docstring). Every connection, including that first one, still
    issues its own WAL/synchronous PRAGMAs here, because those are
    per-connection session settings; once a file is already ready this is a
    cheap, lock-free no-op. If anything below fails, the connection is closed
    before the error propagates, so no path can leak it.
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


def _require_document(document: str) -> str:
    """Reject any key outside the allowlist rather than creating it.

    404, not 422: the parameter names a resource, and an unknown name means
    that resource does not exist — which also keeps it distinguishable from the
    422 an unsupported `doc.version` raises, so a client can tell "I asked for a
    document that isn't there" from "I sent a document this server can't store".
    Callers must run `_require_key` FIRST: with the order reversed, an
    unauthenticated caller could tell an allowed key from a rejected one by
    status code alone and enumerate the store.
    """
    if document not in EMPTY_DOCUMENTS:
        raise HTTPException(status_code=404, detail=f"Unknown document: {document!r}")
    return document


def _empty_doc(document: str) -> dict[str, Any]:
    """A fresh copy of a document's empty state.

    Deep-copied rather than shared: these responses are handed to FastAPI's
    serializer and, in tests, straight to callers, and a single mutation of a
    module-level constant would silently corrupt the empty state for every
    later request in the process.
    """
    return copy.deepcopy(EMPTY_DOCUMENTS[document])


def _read_document(document: str) -> tuple[int, int, dict[str, Any]]:
    conn = _connect()
    try:
        row = conn.execute(
            "SELECT revision, updated_at, doc FROM documents WHERE doc_key = ?",
            (document,),
        ).fetchone()
    finally:
        conn.close()
    if row is None:
        return 0, 0, _empty_doc(document)
    return row[0], row[1], json.loads(row[2])


def _current_row(conn: sqlite3.Connection, document: str) -> tuple[int, int, str] | None:
    return conn.execute(
        "SELECT revision, updated_at, doc FROM documents WHERE doc_key = ?",
        (document,),
    ).fetchone()


def _conflict(document: str, row: tuple[int, int, str] | None) -> JSONResponse:
    """The 409 body: this document's current revision, timestamp and document.

    Shape is unchanged from the single-document API (`revision`, `updatedAt`,
    `doc`) so the already-installed client keeps parsing it; `document` is
    added alongside, which that client ignores.
    """
    return JSONResponse(
        status_code=409,
        content={
            "document": document,
            "revision": row[0] if row else 0,
            "updatedAt": row[1] if row else 0,
            "doc": json.loads(row[2]) if row else _empty_doc(document),
        },
    )


def _commit_revision(
    conn: sqlite3.Connection, document: str, revision: int, now: int, doc_text: str
) -> None:
    """Write the new current state, append it to history, and prune — in-place.

    Called only with the caller's `BEGIN IMMEDIATE` transaction already open, so
    all three statements land atomically and no reader can observe a document
    whose current revision is missing from its own history. The prune therefore
    opens no new race: it holds the same write lock every other writer must take
    before it can touch this table.

    The prune keeps the newest HISTORY_LIMIT revisions of THIS document and
    deletes the rest, so it is oldest-first by construction and self-correcting
    — if a row ever survived it (an interrupted older build, a hand-edited
    database), the next write removes it rather than leaving the table
    permanently over the cap.
    """
    conn.execute(
        "INSERT INTO documents (doc_key, revision, updated_at, doc) VALUES (?, ?, ?, ?) "
        "ON CONFLICT(doc_key) DO UPDATE SET revision = excluded.revision, "
        "updated_at = excluded.updated_at, doc = excluded.doc",
        (document, revision, now, doc_text),
    )
    conn.execute(
        "INSERT INTO document_history (doc_key, revision, updated_at, doc) "
        "VALUES (?, ?, ?, ?)",
        (document, revision, now, doc_text),
    )
    conn.execute(
        "DELETE FROM document_history WHERE doc_key = ? AND revision NOT IN ("
        "  SELECT revision FROM document_history WHERE doc_key = ? "
        "  ORDER BY revision DESC LIMIT ?)",
        (document, document, HISTORY_LIMIT),
    )


class PutState(BaseModel):
    baseRevision: int
    doc: dict[str, Any]


class RestoreState(BaseModel):
    baseRevision: int
    revision: int


@app.get("/api/psnppp/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/psnppp/documents")
def list_documents(x_sync_key: str | None = Header(default=None)) -> dict[str, Any]:
    """The keys this server will accept — so a client need not hard-code them."""
    _require_key(x_sync_key)
    return {"documents": list(EMPTY_DOCUMENTS), "default": DEFAULT_DOCUMENT}


@app.get("/api/psnppp/state")
def get_state(
    document: str = Query(default=DEFAULT_DOCUMENT),
    x_sync_key: str | None = Header(default=None),
) -> dict[str, Any]:
    _require_key(x_sync_key)
    _require_document(document)
    revision, updated_at, doc = _read_document(document)
    return {
        "document": document,
        "revision": revision,
        "updatedAt": updated_at,
        "doc": doc,
    }


@app.put("/api/psnppp/state")
def put_state(
    payload: PutState,
    document: str = Query(default=DEFAULT_DOCUMENT),
    x_sync_key: str | None = Header(default=None),
) -> Any:
    _require_key(x_sync_key)
    _require_document(document)

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
        row = _current_row(conn, document)
        current_revision = row[0] if row else 0

        if payload.baseRevision != current_revision:
            conn.rollback()
            return _conflict(document, row)

        new_revision = current_revision + 1
        _commit_revision(
            conn,
            document,
            new_revision,
            now,
            json.dumps(payload.doc, separators=(",", ":")),
        )
        conn.commit()
    finally:
        conn.close()

    return {"document": document, "revision": new_revision, "updatedAt": now}


@app.get("/api/psnppp/state/history")
def get_history(
    document: str = Query(default=DEFAULT_DOCUMENT),
    limit: int = Query(default=HISTORY_LIMIT, ge=1, le=HISTORY_LIMIT),
    x_sync_key: str | None = Header(default=None),
) -> dict[str, Any]:
    """Newest-first index of a document's retained revisions.

    Metadata only — revision, timestamp and stored size in bytes. The documents
    themselves are deliberately NOT included: with HISTORY_LIMIT at 100 and a
    real lists document already measured in tens of kilobytes, returning them
    all would make this response grow with the user's data on every call, for a
    caller that only wants to draw a list of restore points. One revision at a
    time is what /state/history/{revision} is for.

    `size` is measured in bytes, not characters — `length()` on TEXT counts
    characters, so the doc is cast to BLOB to count the bytes actually stored.
    """
    _require_key(x_sync_key)
    _require_document(document)
    conn = _connect()
    try:
        rows = conn.execute(
            "SELECT revision, updated_at, length(CAST(doc AS BLOB)) "
            "FROM document_history WHERE doc_key = ? ORDER BY revision DESC LIMIT ?",
            (document, limit),
        ).fetchall()
    finally:
        conn.close()
    return {
        "document": document,
        "limit": limit,
        "revisions": [
            {"revision": r[0], "updatedAt": r[1], "size": r[2]} for r in rows
        ],
    }


@app.get("/api/psnppp/state/history/{revision}")
def get_history_revision(
    revision: int,
    document: str = Query(default=DEFAULT_DOCUMENT),
    x_sync_key: str | None = Header(default=None),
) -> dict[str, Any]:
    """One retained revision, in full."""
    _require_key(x_sync_key)
    _require_document(document)
    conn = _connect()
    try:
        row = conn.execute(
            "SELECT updated_at, doc FROM document_history "
            "WHERE doc_key = ? AND revision = ?",
            (document, revision),
        ).fetchone()
    finally:
        conn.close()
    if row is None:
        raise HTTPException(
            status_code=404,
            detail=f"No revision {revision} retained for document {document!r}",
        )
    return {
        "document": document,
        "revision": revision,
        "updatedAt": row[0],
        "doc": json.loads(row[1]),
    }


@app.post("/api/psnppp/state/restore")
def restore_revision(
    payload: RestoreState,
    document: str = Query(default=DEFAULT_DOCUMENT),
    x_sync_key: str | None = Header(default=None),
) -> Any:
    """Make a past revision current again — as a NEW revision.

    History is append-only: restoring revision 7 over revision 41 produces
    revision 42 whose content is revision 7's, and leaves revisions 7 through 41
    exactly where they were. Undoing an undo is therefore just another restore,
    and nothing a client has already seen can be rewritten underneath it.

    It carries `baseRevision` and answers 409 on a mismatch for the same reason
    PUT does: a restore is a write, and a client that decided to undo while
    another device was mid-push must lose the race and re-read, not silently
    overwrite an edit it never saw.

    The document text is copied verbatim from the history row, so the restored
    current state is byte-identical to the revision it came from — no
    re-serialization, no key reordering.
    """
    _require_key(x_sync_key)
    _require_document(document)

    now = _now_ms()
    conn = _connect()
    try:
        conn.execute("BEGIN IMMEDIATE")
        row = _current_row(conn, document)
        current_revision = row[0] if row else 0

        if payload.baseRevision != current_revision:
            conn.rollback()
            return _conflict(document, row)

        source = conn.execute(
            "SELECT doc FROM document_history WHERE doc_key = ? AND revision = ?",
            (document, payload.revision),
        ).fetchone()
        if source is None:
            conn.rollback()
            raise HTTPException(
                status_code=404,
                detail=(
                    f"No revision {payload.revision} retained for "
                    f"document {document!r}"
                ),
            )

        doc_text = source[0]
        # Re-checked, not assumed. It passed at write time against the
        # DOC_VERSION of the day; if that constant ever moves, an old revision
        # must fail loudly here rather than be installed as the current state.
        if json.loads(doc_text).get("version") != DOC_VERSION:
            conn.rollback()
            raise HTTPException(
                status_code=422,
                detail=(
                    f"Revision {payload.revision} holds an unsupported doc version"
                ),
            )

        new_revision = current_revision + 1
        _commit_revision(conn, document, new_revision, now, doc_text)
        conn.commit()
    finally:
        conn.close()

    return {
        "document": document,
        "revision": new_revision,
        "updatedAt": now,
        "restoredFrom": payload.revision,
    }
