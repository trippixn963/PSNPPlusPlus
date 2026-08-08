"""Multiple documents, revision history, and restore.

Author: Trippixn
Server: discord.gg/syria
"""
from __future__ import annotations

import json
import sqlite3
import threading
from typing import Any

import pytest
from conftest import AUTH, BASE, KEY

import app as app_module


def lists_doc(**lists):
    return {"version": 1, "lists": lists}


def settings_doc(**settings):
    return {"version": 1, "settings": settings}


def put(client, doc, base_revision, document=None):
    params = {} if document is None else {"document": document}
    return client.put(
        f"{BASE}/state", headers=AUTH, params=params,
        json={"baseRevision": base_revision, "doc": doc},
    )


def get(client, document=None):
    params = {} if document is None else {"document": document}
    return client.get(f"{BASE}/state", headers=AUTH, params=params)


def history(client, document=None, **params):
    if document is not None:
        params["document"] = document
    return client.get(f"{BASE}/state/history", headers=AUTH, params=params)


def restore(client, base_revision, revision, document=None):
    params = {} if document is None else {"document": document}
    return client.post(
        f"{BASE}/state/restore", headers=AUTH, params=params,
        json={"baseRevision": base_revision, "revision": revision},
    )


# --------------------------------------------------------------------------
# The absent parameter still means `lists`
# --------------------------------------------------------------------------

def test_absent_document_parameter_is_the_lists_document(client):
    """The installed v1.5.0 client sends no parameter; it must hit `lists`."""
    doc = lists_doc(a={"meta": {"name": "Wishlist"}})
    assert put(client, doc, 0).status_code == 200

    unnamed = get(client).json()
    named = get(client, "lists").json()
    assert unnamed == named
    assert unnamed["document"] == "lists"
    assert unnamed["doc"] == doc


def test_explicit_lists_and_absent_parameter_share_one_revision_line(client):
    assert put(client, lists_doc(a={}), 0).json()["revision"] == 1
    assert put(client, lists_doc(b={}), 1, document="lists").json()["revision"] == 2
    assert put(client, lists_doc(c={}), 2).json()["revision"] == 3
    assert get(client).json()["revision"] == 3


def test_the_documents_endpoint_names_the_keys_and_the_default(client):
    body = client.get(f"{BASE}/documents", headers=AUTH).json()
    assert body["default"] == "lists"
    assert set(body["documents"]) == {"lists", "settings"}


# --------------------------------------------------------------------------
# Independent documents
# --------------------------------------------------------------------------

def test_two_documents_keep_independent_revisions(client):
    assert put(client, lists_doc(a={}), 0).json()["revision"] == 1
    assert put(client, lists_doc(b={}), 1).json()["revision"] == 2
    assert put(client, lists_doc(c={}), 2).json()["revision"] == 3

    # settings has never been written; it starts at 0, not at 3.
    assert get(client, "settings").json()["revision"] == 0
    assert put(client, settings_doc(theme="dark"), 0, document="settings").json()["revision"] == 1

    assert get(client, "lists").json()["revision"] == 3
    assert get(client, "settings").json()["revision"] == 1


def test_writing_one_document_never_alters_the_other(client):
    put(client, lists_doc(a={"meta": {"name": "Wishlist"}}), 0)
    put(client, settings_doc(theme="dark"), 0, document="settings")

    before = get(client, "lists").json()
    put(client, settings_doc(theme="light"), 1, document="settings")

    assert get(client, "lists").json() == before


def test_an_unwritten_document_reports_its_own_empty_state(client):
    lists = get(client, "lists").json()
    settings = get(client, "settings").json()
    assert lists["doc"] == {"version": 1, "lists": {}}
    assert settings["doc"] == {"version": 1, "settings": {}}
    assert lists["revision"] == settings["revision"] == 0
    assert lists["updatedAt"] == settings["updatedAt"] == 0


def test_the_empty_document_template_cannot_be_mutated_through_a_response(client):
    """A caller mutating the returned dict must not poison later requests."""
    first = get(client, "settings").json()
    first["doc"]["settings"]["injected"] = True
    app_module._empty_doc("settings")["settings"]["also_injected"] = True

    assert get(client, "settings").json()["doc"] == {"version": 1, "settings": {}}


# --------------------------------------------------------------------------
# Per-document revision guard
# --------------------------------------------------------------------------

def test_a_stale_base_revision_conflicts_per_document(client):
    put(client, lists_doc(a={}), 0)
    put(client, lists_doc(b={}), 1)
    put(client, settings_doc(theme="dark"), 0, document="settings")

    stale = put(client, lists_doc(z={}), 0)
    assert stale.status_code == 409
    body = stale.json()
    assert body["document"] == "lists"
    assert body["revision"] == 2
    assert body["doc"] == lists_doc(b={})


def test_a_revision_valid_for_one_document_is_stale_for_another(client):
    put(client, lists_doc(a={}), 0)
    put(client, lists_doc(b={}), 1)   # lists is at 2

    # settings is at 0, so baseRevision 2 must not be accepted there.
    res = put(client, settings_doc(theme="dark"), 2, document="settings")
    assert res.status_code == 409
    assert res.json()["document"] == "settings"
    assert res.json()["revision"] == 0
    assert res.json()["doc"] == {"version": 1, "settings": {}}

    assert get(client, "settings").json()["revision"] == 0


def test_a_conflicting_put_writes_nothing_including_history(client):
    put(client, lists_doc(a={}), 0)
    before = client.get(f"{BASE}/state/history", headers=AUTH).json()

    assert put(client, lists_doc(z={}), 0).status_code == 409

    assert client.get(f"{BASE}/state/history", headers=AUTH).json() == before
    assert get(client).json()["doc"] == lists_doc(a={})


# --------------------------------------------------------------------------
# Unknown document keys
# --------------------------------------------------------------------------

@pytest.mark.parametrize("unknown", ["nope", "list", "lists ", "LISTS", "", "../lists"])
def test_an_unknown_document_key_is_rejected_on_every_route(client, unknown):
    params = {"document": unknown}
    assert client.get(f"{BASE}/state", headers=AUTH, params=params).status_code == 404
    assert client.put(
        f"{BASE}/state", headers=AUTH, params=params,
        json={"baseRevision": 0, "doc": lists_doc()},
    ).status_code == 404
    assert client.get(f"{BASE}/state/history", headers=AUTH, params=params).status_code == 404
    assert client.get(f"{BASE}/state/history/1", headers=AUTH, params=params).status_code == 404
    assert client.post(
        f"{BASE}/state/restore", headers=AUTH, params=params,
        json={"baseRevision": 0, "revision": 1},
    ).status_code == 404


def test_a_rejected_key_is_not_silently_created(client, db_path):
    res = client.put(
        f"{BASE}/state", headers=AUTH, params={"document": "nope"},
        json={"baseRevision": 0, "doc": lists_doc(a={})},
    )
    assert res.status_code == 404

    # A legitimate read afterwards, so the schema definitely exists by the time
    # the tables are inspected — the rejected write is turned away before the
    # database is even opened, which is itself the point.
    assert get(client).status_code == 200

    conn = sqlite3.connect(str(db_path))
    try:
        keys = conn.execute("SELECT doc_key FROM documents").fetchall()
        rows = conn.execute("SELECT doc_key FROM document_history").fetchall()
    finally:
        conn.close()
    assert keys == []
    assert rows == []


def test_the_document_check_runs_after_auth(client):
    """An unauthenticated caller must not be able to enumerate the store.

    Unknown key + no key must be 401, not 404 — otherwise the status code alone
    tells an unauthenticated caller which keys exist.
    """
    for params in ({"document": "nope"}, {"document": "lists"}):
        assert client.get(f"{BASE}/state", params=params).status_code == 401
        assert client.get(
            f"{BASE}/state", headers={"X-Sync-Key": "wrong"}, params=params
        ).status_code == 401


# --------------------------------------------------------------------------
# History listing
# --------------------------------------------------------------------------

def test_history_lists_revision_timestamp_and_size_only(client):
    doc = lists_doc(a={"meta": {"name": "Wishlist"}})
    put(client, doc, 0)

    body = history(client).json()
    assert body["document"] == "lists"
    entry = body["revisions"][0]
    assert set(entry) == {"revision", "updatedAt", "size"}
    assert entry["revision"] == 1
    assert entry["updatedAt"] > 0
    assert entry["size"] == len(json.dumps(doc, separators=(",", ":")).encode("utf-8"))


def test_history_never_returns_the_documents_themselves(client):
    """Pinned: the list response must not grow with the size of the documents."""
    put(client, lists_doc(a={"meta": {"name": "UNIQUE-MARKER-STRING"}}), 0)
    raw = history(client).text
    assert "UNIQUE-MARKER-STRING" not in raw
    assert "doc" not in json.loads(raw)["revisions"][0]


def test_history_size_counts_bytes_not_characters(client, db_path):
    """`length()` on TEXT counts characters; the reported size is in bytes.

    The write path serializes with `json.dumps` at its default
    `ensure_ascii=True`, so a document pushed through PUT is stored as pure
    ASCII and the two counts coincide — which would let a character-counting
    implementation pass unnoticed. Non-ASCII text DOES reach this column by the
    other route into it: the legacy migration copies the old row's stored TEXT
    verbatim rather than re-serializing it. So the row is planted directly, the
    way the migration would leave it, and the counts are made to differ.
    """
    put(client, lists_doc(a={}), 0)
    raw = '{"version":1,"lists":{"7":{"meta":{"name":"Café ☕"}}}}'
    assert len(raw.encode("utf-8")) > len(raw)

    conn = sqlite3.connect(str(db_path))
    try:
        conn.execute(
            "INSERT INTO document_history (doc_key, revision, updated_at, doc) "
            "VALUES ('lists', 0, 1, ?)", (raw,)
        )
        conn.commit()
    finally:
        conn.close()

    sizes = {e["revision"]: e["size"] for e in history(client).json()["revisions"]}
    assert sizes[0] == len(raw.encode("utf-8"))


def test_history_is_newest_first(client):
    for rev in range(5):
        put(client, lists_doc(**{f"k{rev}": {}}), rev)
    assert [e["revision"] for e in history(client).json()["revisions"]] == [5, 4, 3, 2, 1]


def test_history_is_per_document(client):
    put(client, lists_doc(a={}), 0)
    put(client, lists_doc(b={}), 1)
    put(client, settings_doc(theme="dark"), 0, document="settings")

    assert [e["revision"] for e in history(client).json()["revisions"]] == [2, 1]
    assert [e["revision"] for e in history(client, "settings").json()["revisions"]] == [1]


def test_history_limit_narrows_the_response(client):
    for rev in range(6):
        put(client, lists_doc(**{f"k{rev}": {}}), rev)
    body = history(client, limit=2).json()
    assert [e["revision"] for e in body["revisions"]] == [6, 5]
    assert body["limit"] == 2


@pytest.mark.parametrize("limit", [0, -1, 101, 1000])
def test_history_rejects_a_limit_outside_the_retained_window(client, limit):
    assert history(client, limit=limit).status_code == 422


def test_history_of_an_unwritten_document_is_empty_not_an_error(client):
    body = history(client, "settings")
    assert body.status_code == 200
    assert body.json()["revisions"] == []


# --------------------------------------------------------------------------
# History retention
# --------------------------------------------------------------------------

def test_history_is_capped_at_100_and_prunes_oldest_first(client):
    total = app_module.HISTORY_LIMIT + 5
    for rev in range(total):
        assert put(client, lists_doc(**{f"k{rev}": {}}), rev).status_code == 200

    revisions = [e["revision"] for e in history(client).json()["revisions"]]
    assert len(revisions) == app_module.HISTORY_LIMIT
    # Newest 100 kept, oldest 5 gone — 1..5 pruned, 6..105 retained.
    assert revisions == list(range(total, total - app_module.HISTORY_LIMIT, -1))

    for gone in range(1, 6):
        assert client.get(f"{BASE}/state/history/{gone}", headers=AUTH).status_code == 404
    assert client.get(f"{BASE}/state/history/6", headers=AUTH).status_code == 200


def test_the_history_table_itself_stays_bounded(client, db_path):
    for rev in range(app_module.HISTORY_LIMIT + 20):
        put(client, lists_doc(**{f"k{rev}": {}}), rev)

    conn = sqlite3.connect(str(db_path))
    try:
        count = conn.execute(
            "SELECT COUNT(*) FROM document_history WHERE doc_key = 'lists'"
        ).fetchone()[0]
    finally:
        conn.close()
    assert count == app_module.HISTORY_LIMIT


def test_pruning_one_document_leaves_the_other_alone(client):
    put(client, settings_doc(theme="dark"), 0, document="settings")
    for rev in range(app_module.HISTORY_LIMIT + 5):
        put(client, lists_doc(**{f"k{rev}": {}}), rev)

    assert [e["revision"] for e in history(client, "settings").json()["revisions"]] == [1]
    assert client.get(
        f"{BASE}/state/history/1", headers=AUTH, params={"document": "settings"}
    ).status_code == 200


def test_each_document_retains_its_own_full_window(client):
    """Both documents deep in history: each keeps its OWN newest 100.

    The retention window has to be computed per document, not over the table as
    a whole. A prune whose subquery forgets the `doc_key` filter still deletes
    only from the right document — so it looks correct — but it picks the
    revisions to KEEP from every document's rows at once. Once a second
    document has its own deep history, those rows crowd the window and the
    document being pruned silently loses half its retained revisions. The
    single-revision case above cannot see that; this one can.
    """
    over = app_module.HISTORY_LIMIT + 5
    for rev in range(over):
        put(client, settings_doc(**{f"s{rev}": {}}), rev, document="settings")
    for rev in range(over):
        put(client, lists_doc(**{f"k{rev}": {}}), rev)

    for document in ("lists", "settings"):
        revisions = [e["revision"] for e in history(client, document).json()["revisions"]]
        assert len(revisions) == app_module.HISTORY_LIMIT, (document, len(revisions))
        assert revisions[0] == over
        assert revisions[-1] == over - app_module.HISTORY_LIMIT + 1


def test_the_current_revision_is_always_present_in_its_own_history(client):
    for rev in range(app_module.HISTORY_LIMIT + 3):
        put(client, lists_doc(**{f"k{rev}": {}}), rev)
    current = get(client).json()
    full = client.get(f"{BASE}/state/history/{current['revision']}", headers=AUTH).json()
    assert full["doc"] == current["doc"]
    assert full["updatedAt"] == current["updatedAt"]


# --------------------------------------------------------------------------
# Fetching one revision
# --------------------------------------------------------------------------

def test_one_past_revision_is_returned_in_full(client):
    first = lists_doc(a={"meta": {"name": "First"}})
    second = lists_doc(a={"meta": {"name": "Second"}})
    put(client, first, 0)
    put(client, second, 1)

    body = client.get(f"{BASE}/state/history/1", headers=AUTH).json()
    assert body["document"] == "lists"
    assert body["revision"] == 1
    assert body["doc"] == first
    assert body["updatedAt"] > 0
    assert get(client).json()["doc"] == second


def test_fetching_an_unretained_revision_is_a_404(client):
    put(client, lists_doc(a={}), 0)
    assert client.get(f"{BASE}/state/history/99", headers=AUTH).status_code == 404
    assert client.get(f"{BASE}/state/history/0", headers=AUTH).status_code == 404


def test_a_revision_of_the_wrong_document_is_a_404(client):
    put(client, lists_doc(a={}), 0)
    assert client.get(
        f"{BASE}/state/history/1", headers=AUTH, params={"document": "settings"}
    ).status_code == 404


# --------------------------------------------------------------------------
# Restore
# --------------------------------------------------------------------------

def test_restore_makes_a_past_revision_current_as_a_new_revision(client):
    first = lists_doc(a={"meta": {"name": "First"}})
    second = lists_doc(a={"meta": {"name": "Second"}})
    third = lists_doc(a={"meta": {"name": "Third"}})
    put(client, first, 0)
    put(client, second, 1)
    put(client, third, 2)

    res = restore(client, base_revision=3, revision=1)
    assert res.status_code == 200
    body = res.json()
    assert body["document"] == "lists"
    assert body["revision"] == 4
    assert body["restoredFrom"] == 1

    current = get(client).json()
    assert current["revision"] == 4
    assert current["doc"] == first


def test_restore_never_rewrites_history(client):
    put(client, lists_doc(a={"meta": {"name": "First"}}), 0)
    put(client, lists_doc(a={"meta": {"name": "Second"}}), 1)
    before = history(client).json()["revisions"]

    restore(client, base_revision=2, revision=1)

    after = history(client).json()["revisions"]
    # Every pre-existing entry survives, unchanged, and a new one is appended.
    assert after[1:] == before
    assert after[0]["revision"] == 3
    assert client.get(f"{BASE}/state/history/1", headers=AUTH).json()["doc"] == \
        lists_doc(a={"meta": {"name": "First"}})
    assert client.get(f"{BASE}/state/history/2", headers=AUTH).json()["doc"] == \
        lists_doc(a={"meta": {"name": "Second"}})


def test_a_restore_is_itself_recorded_in_history(client):
    put(client, lists_doc(a={"meta": {"name": "First"}}), 0)
    put(client, lists_doc(a={"meta": {"name": "Second"}}), 1)
    restore(client, base_revision=2, revision=1)

    body = client.get(f"{BASE}/state/history/3", headers=AUTH).json()
    assert body["doc"] == lists_doc(a={"meta": {"name": "First"}})


def test_a_restore_can_itself_be_undone_by_another_restore(client):
    first = lists_doc(a={"meta": {"name": "First"}})
    second = lists_doc(a={"meta": {"name": "Second"}})
    put(client, first, 0)
    put(client, second, 1)

    restore(client, base_revision=2, revision=1)
    assert get(client).json()["doc"] == first

    restore(client, base_revision=3, revision=2)
    assert get(client).json()["doc"] == second
    assert get(client).json()["revision"] == 4


def test_restore_copies_the_stored_document_text_verbatim(client, db_path):
    doc = {"version": 1, "lists": {"7": {"meta": {"name": "Café ☕"}}}}
    put(client, doc, 0)
    put(client, lists_doc(other={}), 1)
    restore(client, base_revision=2, revision=1)

    conn = sqlite3.connect(str(db_path))
    try:
        original = conn.execute(
            "SELECT doc FROM document_history WHERE doc_key='lists' AND revision=1"
        ).fetchone()[0]
        restored = conn.execute(
            "SELECT doc FROM documents WHERE doc_key='lists'"
        ).fetchone()[0]
    finally:
        conn.close()
    assert restored == original


def test_restore_carries_a_new_timestamp_not_the_old_one(client):
    put(client, lists_doc(a={}), 0)
    original = client.get(f"{BASE}/state/history/1", headers=AUTH).json()["updatedAt"]
    put(client, lists_doc(b={}), 1)

    restored = restore(client, base_revision=2, revision=1).json()
    assert restored["updatedAt"] >= original
    assert get(client).json()["updatedAt"] == restored["updatedAt"]


def test_restore_with_a_stale_base_revision_conflicts(client):
    put(client, lists_doc(a={"meta": {"name": "First"}}), 0)
    put(client, lists_doc(a={"meta": {"name": "Second"}}), 1)

    res = restore(client, base_revision=1, revision=1)
    assert res.status_code == 409
    body = res.json()
    assert body["document"] == "lists"
    assert body["revision"] == 2
    assert body["doc"] == lists_doc(a={"meta": {"name": "Second"}})

    # And it wrote nothing.
    assert get(client).json()["revision"] == 2
    assert [e["revision"] for e in history(client).json()["revisions"]] == [2, 1]


def test_restore_of_an_unretained_revision_is_a_404_and_writes_nothing(client):
    put(client, lists_doc(a={}), 0)
    res = restore(client, base_revision=1, revision=99)
    assert res.status_code == 404

    assert get(client).json()["revision"] == 1
    assert [e["revision"] for e in history(client).json()["revisions"]] == [1]


def test_restore_of_a_pruned_revision_is_a_404(client):
    for rev in range(app_module.HISTORY_LIMIT + 5):
        put(client, lists_doc(**{f"k{rev}": {}}), rev)
    current = get(client).json()["revision"]
    assert restore(client, base_revision=current, revision=1).status_code == 404


def test_restore_is_per_document(client):
    put(client, lists_doc(a={"meta": {"name": "First"}}), 0)
    put(client, lists_doc(a={"meta": {"name": "Second"}}), 1)
    put(client, settings_doc(theme="dark"), 0, document="settings")

    before_settings = get(client, "settings").json()
    restore(client, base_revision=2, revision=1)

    assert get(client, "settings").json() == before_settings


def test_restoring_the_current_revision_still_advances_the_revision(client):
    put(client, lists_doc(a={}), 0)
    res = restore(client, base_revision=1, revision=1)
    assert res.status_code == 200
    assert res.json()["revision"] == 2
    assert get(client).json()["doc"] == lists_doc(a={})


def test_restore_rejects_a_revision_holding_an_unsupported_doc_version(client, db_path):
    """Simulates a future DOC_VERSION bump: an old revision must not install.

    The row is written straight into history because the write path could never
    have accepted it — which is exactly the situation after DOC_VERSION moves.
    """
    put(client, lists_doc(a={}), 0)
    conn = sqlite3.connect(str(db_path))
    try:
        conn.execute(
            "INSERT INTO document_history (doc_key, revision, updated_at, doc) "
            "VALUES ('lists', 0, 1, ?)",
            (json.dumps({"version": 99, "lists": {}}, separators=(",", ":")),),
        )
        conn.commit()
    finally:
        conn.close()

    res = restore(client, base_revision=1, revision=0)
    assert res.status_code == 422
    assert get(client).json()["revision"] == 1
    assert get(client).json()["doc"] == lists_doc(a={})


# --------------------------------------------------------------------------
# Auth and version validation, on every route
# --------------------------------------------------------------------------

NEW_ROUTES = [
    ("GET", f"{BASE}/documents", None),
    ("GET", f"{BASE}/state/history", None),
    ("GET", f"{BASE}/state/history/1", None),
    ("POST", f"{BASE}/state/restore", {"baseRevision": 0, "revision": 1}),
]


@pytest.mark.parametrize("method,path,body", NEW_ROUTES)
def test_every_new_route_rejects_a_missing_or_wrong_key(client, method, path, body):
    assert client.request(method, path, json=body).status_code == 401
    assert client.request(
        method, path, headers={"X-Sync-Key": "nope"}, json=body
    ).status_code == 401


@pytest.mark.parametrize("method,path,body", NEW_ROUTES)
def test_every_new_route_survives_a_non_ascii_key_header(client, method, path, body):
    """A header byte above 0x7F must be a 401, never an unauthenticated 500."""
    for raw in (b"caf\xe9", "café".encode("utf-8"), b"\xff\xfe", KEY.encode() + b"\xe9"):
        res = client.request(method, path, headers={"X-Sync-Key": raw}, json=body)
        assert res.status_code == 401, f"{raw!r} on {path} produced {res.status_code}"


@pytest.mark.parametrize("sent", ["", KEY, "anything"])
def test_an_unset_server_key_rejects_even_a_matching_empty_key(client, monkeypatch, sent):
    """Fail closed when the server has no key — including against an EMPTY one.

    The `not expected` guard is what makes this hold. Without it, an unset
    server key and an empty `X-Sync-Key` header are two empty strings, and a
    constant-time compare of two empty strings succeeds — so a service whose
    .env failed to load would authenticate every caller that sends a blank key.
    """
    monkeypatch.setenv("PSNP_SYNC_KEY", "")
    for path in (
        f"{BASE}/state", f"{BASE}/documents",
        f"{BASE}/state/history", f"{BASE}/state/history/1",
    ):
        res = client.get(path, headers={"X-Sync-Key": sent})
        assert res.status_code == 401, f"{path} with {sent!r} gave {res.status_code}"

    assert client.put(
        f"{BASE}/state", headers={"X-Sync-Key": sent},
        json={"baseRevision": 0, "doc": lists_doc()},
    ).status_code == 401
    assert client.post(
        f"{BASE}/state/restore", headers={"X-Sync-Key": sent},
        json={"baseRevision": 0, "revision": 1},
    ).status_code == 401


def test_an_unset_server_key_locks_every_route(client, monkeypatch):
    monkeypatch.setenv("PSNP_SYNC_KEY", "")
    assert client.get(f"{BASE}/state", headers=AUTH).status_code == 401
    assert client.get(f"{BASE}/documents", headers=AUTH).status_code == 401
    assert client.get(f"{BASE}/state/history", headers=AUTH).status_code == 401
    assert client.get(f"{BASE}/state/history/1", headers=AUTH).status_code == 401
    assert restore(client, 0, 1).status_code == 401
    assert put(client, lists_doc(), 0).status_code == 401


@pytest.mark.parametrize("document", ["lists", "settings"])
def test_put_rejects_an_unknown_doc_version_on_every_document(client, document):
    res = put(client, {"version": 99, "settings": {}}, 0, document=document)
    assert res.status_code == 422


def test_a_rejected_version_writes_no_history(client):
    put(client, {"version": 99, "lists": {}}, 0)
    assert history(client).json()["revisions"] == []


# --------------------------------------------------------------------------
# Concurrency
# --------------------------------------------------------------------------

def test_concurrent_writers_on_one_document_produce_exactly_one_winner(client):
    """BEGIN IMMEDIATE must keep the read-compare-write indivisible.

    Twelve threads all claim baseRevision 1. Exactly one may be accepted; the
    rest must see 409. A lost update would show up as two accepted writes, or as
    a revision that skipped a number.
    """
    put(client, lists_doc(seed={}), 0)

    results: list[int] = []
    errors: list[BaseException] = []
    start = threading.Event()
    guard = threading.Lock()

    def writer(index):
        start.wait()
        try:
            payload = app_module.PutState(
                baseRevision=1, doc=lists_doc(**{f"w{index}": {}})
            )
            outcome = app_module.put_state(payload, document="lists", x_sync_key=KEY)
            status = getattr(outcome, "status_code", 200)
        except BaseException as exc:  # noqa: BLE001 - recorded, then asserted on
            with guard:
                errors.append(exc)
            return
        with guard:
            results.append(status)

    threads = [threading.Thread(target=writer, args=(i,)) for i in range(12)]
    for thread in threads:
        thread.start()
    start.set()
    for thread in threads:
        thread.join()

    assert errors == [], f"concurrent writers raised: {errors!r}"
    assert results.count(200) == 1, results
    assert results.count(409) == 11, results
    assert get(client).json()["revision"] == 2


def test_concurrent_writers_leave_history_consistent(client, db_path):
    """No accepted write may lose its history row, and the cap must hold."""
    revision = 0
    for _ in range(app_module.HISTORY_LIMIT + 10):
        revision = put(client, lists_doc(**{f"k{revision}": {}}), revision).json()["revision"]

    accepted = []
    start = threading.Event()
    guard = threading.Lock()

    def writer(index):
        start.wait()
        payload = app_module.PutState(
            baseRevision=revision, doc=lists_doc(**{f"c{index}": {}})
        )
        outcome = app_module.put_state(payload, document="lists", x_sync_key=KEY)
        if not hasattr(outcome, "status_code"):
            with guard:
                accepted.append(outcome["revision"])

    threads = [threading.Thread(target=writer, args=(i,)) for i in range(8)]
    for thread in threads:
        thread.start()
    start.set()
    for thread in threads:
        thread.join()

    assert len(accepted) == 1
    conn = sqlite3.connect(str(db_path))
    try:
        count = conn.execute(
            "SELECT COUNT(*) FROM document_history WHERE doc_key = 'lists'"
        ).fetchone()[0]
        newest = conn.execute(
            "SELECT MAX(revision) FROM document_history WHERE doc_key = 'lists'"
        ).fetchone()[0]
    finally:
        conn.close()
    assert count == app_module.HISTORY_LIMIT
    assert newest == accepted[0]
    assert get(client).json()["revision"] == accepted[0]


def test_concurrent_writers_on_different_documents_both_succeed(client):
    outcomes: dict[str, Any] = {}
    start = threading.Event()
    guard = threading.Lock()

    def writer(document, doc):
        start.wait()
        payload = app_module.PutState(baseRevision=0, doc=doc)
        outcome = app_module.put_state(payload, document=document, x_sync_key=KEY)
        with guard:
            outcomes[document] = outcome

    threads = [
        threading.Thread(target=writer, args=("lists", lists_doc(a={}))),
        threading.Thread(target=writer, args=("settings", settings_doc(theme="dark"))),
    ]
    for thread in threads:
        thread.start()
    start.set()
    for thread in threads:
        thread.join()

    assert outcomes["lists"]["revision"] == 1
    assert outcomes["settings"]["revision"] == 1
