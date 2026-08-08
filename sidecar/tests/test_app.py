"""Tests for the PSNP sync sidecar.

These pin the ORIGINAL single-document API — every request here omits the
`document` parameter, exactly as the already-installed v1.5.0 userscript does.
They must keep passing verbatim across the multi-document rewrite; that is the
whole point of the file.

The `client` fixture lives in conftest.py.

Author: Trippixn
Server: discord.gg/syria
"""
from __future__ import annotations

from conftest import AUTH, BASE, KEY


def test_health_needs_no_key(client):
    res = client.get(f"{BASE}/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_state_rejects_missing_key(client):
    assert client.get(f"{BASE}/state").status_code == 401


def test_state_rejects_wrong_key(client):
    res = client.get(f"{BASE}/state", headers={"X-Sync-Key": "nope"})
    assert res.status_code == 401


def test_put_rejects_missing_or_wrong_key(client):
    body = {"baseRevision": 0, "doc": {"version": 1, "lists": {}}}
    assert client.put(f"{BASE}/state", json=body).status_code == 401
    res = client.put(f"{BASE}/state", headers={"X-Sync-Key": "nope"}, json=body)
    assert res.status_code == 401


def test_empty_state_is_revision_zero(client):
    res = client.get(f"{BASE}/state", headers=AUTH)
    assert res.status_code == 200
    body = res.json()
    assert body["revision"] == 0
    assert body["doc"] == {"version": 1, "lists": {}}


def test_first_put_creates_revision_one(client):
    doc = {"version": 1, "lists": {"a": {"meta": {"name": "Wishlist"}}}}
    res = client.put(f"{BASE}/state", headers=AUTH, json={"baseRevision": 0, "doc": doc})
    assert res.status_code == 200
    assert res.json()["revision"] == 1

    stored = client.get(f"{BASE}/state", headers=AUTH).json()
    assert stored["revision"] == 1
    assert stored["doc"] == doc
    assert stored["updatedAt"] > 0


def test_put_with_stale_base_revision_conflicts(client):
    first = {"version": 1, "lists": {"a": {}}}
    client.put(f"{BASE}/state", headers=AUTH, json={"baseRevision": 0, "doc": first})

    stale = {"version": 1, "lists": {"b": {}}}
    res = client.put(f"{BASE}/state", headers=AUTH, json={"baseRevision": 0, "doc": stale})
    assert res.status_code == 409
    body = res.json()
    assert body["revision"] == 1
    assert body["doc"] == first


def test_put_with_current_base_revision_increments(client):
    client.put(f"{BASE}/state", headers=AUTH,
               json={"baseRevision": 0, "doc": {"version": 1, "lists": {}}})
    res = client.put(f"{BASE}/state", headers=AUTH,
                     json={"baseRevision": 1, "doc": {"version": 1, "lists": {"c": {}}}})
    assert res.status_code == 200
    assert res.json()["revision"] == 2


def test_put_rejects_unknown_doc_version(client):
    res = client.put(f"{BASE}/state", headers=AUTH,
                     json={"baseRevision": 0, "doc": {"version": 99, "lists": {}}})
    assert res.status_code == 422


def test_non_ascii_key_header_is_401_not_a_500(client):
    """A header byte above 0x7F must fail closed, not crash the handler.

    uvicorn decodes request headers as latin-1, so a stray high byte reaches
    `_require_key` as a non-ASCII str. `hmac.compare_digest` raises TypeError
    for str operands that are not ASCII-only, which FastAPI turns into an
    unauthenticated HTTP 500 plus a traceback in the journal. Anyone who can
    reach the endpoint can trigger it, keyless.
    """
    for raw in (b"caf\xe9", "café".encode("utf-8"), b"\xff\xfe", KEY.encode() + b"\xe9"):
        res = client.get(f"{BASE}/state", headers={"X-Sync-Key": raw})
        assert res.status_code == 401, f"{raw!r} produced {res.status_code}"

        body = {"baseRevision": 0, "doc": {"version": 1, "lists": {}}}
        res = client.put(f"{BASE}/state", headers={"X-Sync-Key": raw}, json=body)
        assert res.status_code == 401, f"{raw!r} produced {res.status_code}"


def test_the_real_key_still_works_after_encoding(client):
    """The encode() on both sides must not break the ordinary success path."""
    assert client.get(f"{BASE}/state", headers=AUTH).status_code == 200
