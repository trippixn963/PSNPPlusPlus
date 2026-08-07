"""Tests for the PSNP sync sidecar."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

import app as app_module

KEY = "test-secret-key"
AUTH = {"X-Sync-Key": KEY}
BASE = "/api/psnp-sync"


@pytest.fixture()
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("PSNP_SYNC_KEY", KEY)
    monkeypatch.setenv("PSNP_SYNC_DB", str(tmp_path / "state.db"))
    return TestClient(app_module.app)


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
