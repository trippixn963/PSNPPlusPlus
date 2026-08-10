"""In-place migration of the original single-row `state` table.

This is the suite that stands in for the owner's live database. The production
file is at ~revision 41 and holds his real game lists, so the assertions here
are deliberately about EXACT preservation — revision, timestamp and the stored
document text byte for byte — rather than "a document came across".

The legacy document text below is written as a literal with its keys in an
order `json.dumps` would not reproduce (`version` before `lists`, `meta` before
`gameOrder` before `games`) and with non-ASCII characters left raw. If the
migration ever re-serialized the document instead of copying the stored TEXT,
`json.dumps` would re-escape the non-ASCII and the byte comparison would fail —
which is the point.

Developer: Trippixn
Website:   https://trippixn.com
Discord:   discord.gg/syria
"""
from __future__ import annotations

import json
import sqlite3
import threading
import time

from conftest import AUTH, BASE

import app as app_module

# Verbatim copy of the schema this project shipped before the keyed store.
LEGACY_SCHEMA = (
    "CREATE TABLE IF NOT EXISTS state ("
    "  id INTEGER PRIMARY KEY,"
    "  revision INTEGER NOT NULL,"
    "  updated_at INTEGER NOT NULL,"
    "  doc TEXT NOT NULL)"
)

LEGACY_REVISION = 41
LEGACY_UPDATED_AT = 1754530000123
LEGACY_DOC_TEXT = (
    '{"version":1,"lists":{"7":{"meta":{"name":"Wishlist — Café ☕",'
    '"updatedAt":1754530000000},"gameOrder":["9000","30","415"],'
    '"games":{"9000":{"note":"Zoë"},"30":{},"415":{}}}}}'
)


def build_legacy_db(path, revision=LEGACY_REVISION, updated_at=LEGACY_UPDATED_AT,
                    doc_text=LEGACY_DOC_TEXT):
    """Create a database in the OLD schema, with one row, and nothing else."""
    conn = sqlite3.connect(str(path))
    try:
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute(LEGACY_SCHEMA)
        conn.execute(
            "INSERT INTO state (id, revision, updated_at, doc) VALUES (1, ?, ?, ?)",
            (revision, updated_at, doc_text),
        )
        conn.commit()
    finally:
        conn.close()
    return path


def build_empty_legacy_db(path):
    """The old schema with no row — a service installed but never written to."""
    conn = sqlite3.connect(str(path))
    try:
        conn.execute(LEGACY_SCHEMA)
        conn.commit()
    finally:
        conn.close()
    return path


def read_sql(path, sql, params=()):
    conn = sqlite3.connect(str(path))
    try:
        return conn.execute(sql, params).fetchall()
    finally:
        conn.close()


def force_cold_start(db_path):
    """Make the next connection re-run _ensure_ready, migration included."""
    app_module._schema_ready_paths.discard(str(db_path))


def test_legacy_row_becomes_the_lists_document_byte_for_byte(client, db_path):
    """revision, updated_at and the document text all survive exactly."""
    build_legacy_db(db_path)

    res = client.get(f"{BASE}/state", headers=AUTH)
    assert res.status_code == 200
    body = res.json()
    assert body["document"] == "lists"
    assert body["revision"] == LEGACY_REVISION
    assert body["updatedAt"] == LEGACY_UPDATED_AT
    assert body["doc"] == json.loads(LEGACY_DOC_TEXT)

    stored = read_sql(
        db_path,
        "SELECT revision, updated_at, doc FROM documents WHERE doc_key = 'lists'",
    )
    assert stored == [(LEGACY_REVISION, LEGACY_UPDATED_AT, LEGACY_DOC_TEXT)]
    # Byte-for-byte, not merely equal-as-JSON: the raw TEXT must be identical.
    assert stored[0][2].encode("utf-8") == LEGACY_DOC_TEXT.encode("utf-8")


def test_migration_seeds_history_with_the_migrated_revision(client, db_path):
    build_legacy_db(db_path)

    listing = client.get(f"{BASE}/state/history", headers=AUTH).json()
    assert [entry["revision"] for entry in listing["revisions"]] == [LEGACY_REVISION]
    assert listing["revisions"][0]["updatedAt"] == LEGACY_UPDATED_AT

    full = client.get(f"{BASE}/state/history/{LEGACY_REVISION}", headers=AUTH)
    assert full.status_code == 200
    assert full.json()["doc"] == json.loads(LEGACY_DOC_TEXT)

    stored = read_sql(
        db_path,
        "SELECT revision, updated_at, doc FROM document_history WHERE doc_key = 'lists'",
    )
    assert stored == [(LEGACY_REVISION, LEGACY_UPDATED_AT, LEGACY_DOC_TEXT)]


def test_migration_is_idempotent(client, db_path):
    """A second cold start must change nothing at all."""
    build_legacy_db(db_path)
    client.get(f"{BASE}/state", headers=AUTH)

    before = read_sql(db_path, "SELECT * FROM documents")
    before_history = read_sql(db_path, "SELECT * FROM document_history")

    for _ in range(3):
        force_cold_start(db_path)
        assert client.get(f"{BASE}/state", headers=AUTH).status_code == 200

    assert read_sql(db_path, "SELECT * FROM documents") == before
    assert read_sql(db_path, "SELECT * FROM document_history") == before_history


def test_a_later_cold_start_never_rolls_back_newer_writes(client, db_path):
    """The dangerous idempotency case: migrate, advance, then restart.

    A migration written as an unconditional overwrite would silently revert the
    owner's document to the legacy revision on every service restart.
    """
    build_legacy_db(db_path)
    doc = {"version": 1, "lists": {"7": {"meta": {"name": "Renamed"}}}}
    res = client.put(
        f"{BASE}/state", headers=AUTH,
        json={"baseRevision": LEGACY_REVISION, "doc": doc},
    )
    assert res.status_code == 200
    assert res.json()["revision"] == LEGACY_REVISION + 1

    force_cold_start(db_path)

    body = client.get(f"{BASE}/state", headers=AUTH).json()
    assert body["revision"] == LEGACY_REVISION + 1
    assert body["doc"] == doc


def test_migrated_document_continues_from_its_legacy_revision(client, db_path):
    """The revision guard keeps working across the migration boundary.

    The installed client holds baseRevision 41; a write based on it must be
    accepted, and one based on a stale revision must still 409.
    """
    build_legacy_db(db_path)

    stale = client.put(
        f"{BASE}/state", headers=AUTH,
        json={"baseRevision": 40, "doc": {"version": 1, "lists": {}}},
    )
    assert stale.status_code == 409
    assert stale.json()["revision"] == LEGACY_REVISION
    assert stale.json()["doc"] == json.loads(LEGACY_DOC_TEXT)

    ok = client.put(
        f"{BASE}/state", headers=AUTH,
        json={"baseRevision": LEGACY_REVISION, "doc": {"version": 1, "lists": {}}},
    )
    assert ok.status_code == 200
    assert ok.json()["revision"] == 42


def test_legacy_table_is_retained_as_a_rollback_copy(client, db_path):
    """Deliberate: the old row is left in place, untouched, after migration.

    Pinned so a later refactor cannot quietly add a DROP TABLE — that copy is
    the only in-database record of the pre-migration state.
    """
    build_legacy_db(db_path)
    client.get(f"{BASE}/state", headers=AUTH)

    assert read_sql(db_path, "SELECT revision, updated_at, doc FROM state") == [
        (LEGACY_REVISION, LEGACY_UPDATED_AT, LEGACY_DOC_TEXT)
    ]


def test_writes_after_migration_do_not_touch_the_legacy_table(client, db_path):
    build_legacy_db(db_path)
    client.put(
        f"{BASE}/state", headers=AUTH,
        json={"baseRevision": LEGACY_REVISION, "doc": {"version": 1, "lists": {}}},
    )
    assert read_sql(db_path, "SELECT revision FROM state") == [(LEGACY_REVISION,)]


def test_legacy_table_with_no_row_migrates_nothing(client, db_path):
    build_empty_legacy_db(db_path)

    body = client.get(f"{BASE}/state", headers=AUTH).json()
    assert body["revision"] == 0
    assert body["doc"] == {"version": 1, "lists": {}}
    assert read_sql(db_path, "SELECT * FROM documents") == []


def test_migration_creates_the_lists_row_and_nothing_else(client, db_path):
    """The legacy table held one document; migrating it must produce one row.

    This used to phrase the same invariant as "does not invent a SETTINGS
    document", back when settings was one of four served documents. Only lists
    survives now, so the question is no longer about a particular neighbour: it
    is that migration adds exactly what it found and nothing more.
    """
    build_legacy_db(db_path)
    client.get(f"{BASE}/state", headers=AUTH)

    assert read_sql(db_path, "SELECT doc_key FROM documents") == [("lists",)]


def test_a_fresh_database_has_no_legacy_table_and_no_migration(client, db_path):
    """New installs must not resurrect the old schema."""
    assert client.get(f"{BASE}/state", headers=AUTH).status_code == 200
    names = read_sql(db_path, "SELECT name FROM sqlite_master WHERE type = 'table'")
    assert ("state",) not in names
    assert ("documents",) in names
    assert ("document_history",) in names


def test_concurrent_cold_start_over_a_legacy_database_does_not_race(db_path):
    """Cold-start concurrency, with the migration now inside the guarded region.

    The schema-init race was a real bug in this file's history (an unguarded
    PRAGMA journal_mode, then an unguarded CREATE TABLE, each producing
    `database is locked` under a two-thread cold start). The migration is a
    third whole-file operation in the same window, so it is exercised the same
    way: many threads, one genuine cold start, and exactly one migrated row.
    """
    build_legacy_db(db_path)
    errors: list[BaseException] = []
    start = threading.Event()

    def open_one():
        start.wait()
        try:
            conn = app_module._connect()
            conn.close()
        except BaseException as exc:  # noqa: BLE001 - recorded, then asserted on
            errors.append(exc)

    threads = [threading.Thread(target=open_one) for _ in range(24)]
    for thread in threads:
        thread.start()
    start.set()
    for thread in threads:
        thread.join()

    assert errors == [], f"cold-start race: {errors!r}"
    assert read_sql(
        db_path, "SELECT revision, updated_at, doc FROM documents"
    ) == [(LEGACY_REVISION, LEGACY_UPDATED_AT, LEGACY_DOC_TEXT)]
    assert read_sql(
        db_path, "SELECT COUNT(*) FROM document_history WHERE doc_key = 'lists'"
    ) == [(1,)]


def test_cold_start_setup_runs_once_and_is_never_entered_concurrently(
    db_path, monkeypatch
):
    """The schema lock's actual property, measured rather than inferred.

    Reproducing the SYMPTOM (`sqlite3.OperationalError: database is locked`) is
    not a usable test: probing it here reproduced in at best ~11 of 20 runs even
    with 10 fresh files, so a test asserting on it would flake in both
    directions. What IS deterministic is the property the lock exists to
    provide — that the one-time cold-start region is entered by one thread, once
    — so that is what is asserted.

    The instrumented migration holds the region open long enough that any thread
    not excluded by the lock is certain to overlap. With the lock, `peak` is 1
    and `calls` is 1 because every later thread finds the path already in
    `_schema_ready_paths` and returns before reaching here. Remove the lock, or
    move the migration outside it, and both numbers rise.
    """
    build_legacy_db(db_path)

    real_migrate = app_module._migrate_legacy_state
    state = {"inside": 0, "peak": 0, "calls": 0}
    guard = threading.Lock()

    def instrumented(conn):
        with guard:
            state["inside"] += 1
            state["calls"] += 1
            state["peak"] = max(state["peak"], state["inside"])
        try:
            time.sleep(0.05)
            return real_migrate(conn)
        finally:
            with guard:
                state["inside"] -= 1

    monkeypatch.setattr(app_module, "_migrate_legacy_state", instrumented)

    errors: list[BaseException] = []
    start = threading.Event()

    def open_one():
        start.wait()
        try:
            conn = app_module._connect()
            conn.close()
        except BaseException as exc:  # noqa: BLE001 - recorded, then asserted on
            errors.append(exc)

    threads = [threading.Thread(target=open_one) for _ in range(12)]
    for thread in threads:
        thread.start()
    start.set()
    for thread in threads:
        thread.join()

    assert errors == [], f"cold start raised: {errors!r}"
    assert state["peak"] == 1, f"cold-start region entered by {state['peak']} threads at once"
    assert state["calls"] == 1, f"cold-start region ran {state['calls']} times"


def test_no_request_can_observe_the_database_before_the_migration_completes(
    client, db_path, monkeypatch
):
    """The migration must finish before ANY request can read the store.

    This is the property that protects the owner's data on the very first start
    under the new schema, and it is not the same property as "the setup runs
    once". Move the migration a few lines later — after the path is marked ready
    and the lock is dropped — and it still runs exactly once, still under no
    contention, and the suite still passes. But a request arriving during that
    window finds `documents` empty on a database that in fact holds every list,
    and answers revision 0 with an empty document. A client that merges against
    that answer writes the emptiness back.

    So the window is held open deliberately and a real request is fired into it.
    With the migration inside the guarded region, that request blocks on the
    schema lock and sees revision 41. With it outside, it sees revision 0.
    """
    build_legacy_db(db_path)

    real_migrate = app_module._migrate_legacy_state
    entered = threading.Event()
    errors: list[BaseException] = []

    def slow_migrate(conn):
        entered.set()
        time.sleep(0.2)
        return real_migrate(conn)

    monkeypatch.setattr(app_module, "_migrate_legacy_state", slow_migrate)

    def cold_start():
        try:
            conn = app_module._connect()
            conn.close()
        except BaseException as exc:  # noqa: BLE001 - recorded, then asserted on
            errors.append(exc)
        finally:
            entered.set()

    opener = threading.Thread(target=cold_start)
    opener.start()
    try:
        assert entered.wait(timeout=5), "migration never started"
        body = client.get(f"{BASE}/state", headers=AUTH).json()
    finally:
        opener.join(timeout=5)

    assert errors == [], f"cold start raised: {errors!r}"
    assert body["revision"] == LEGACY_REVISION, (
        "a request observed the store before the migration completed: "
        f"{body['revision']}"
    )
    assert body["doc"] == json.loads(LEGACY_DOC_TEXT)
