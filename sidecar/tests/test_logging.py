"""What the sidecar logs of its own accord: rejected keys, restores, its start,
the day's counts, and the log's own circuit. The `client` fixture lives in
conftest.py.

Developer: Trippixn
Website:   https://trippixn.com
Discord:   discord.gg/syria
"""
from __future__ import annotations

import time

import pytest
from fastapi.testclient import TestClient

import app as application
import treelog
from conftest import AUTH, BASE


class Recorder:
    """Stands in for TREE_LOG: keeps every tree, posts nothing."""

    enabled = False

    def __init__(self) -> None:
        self.trees: list[tuple[str, list, str]] = []

    def log(self, title, items, emoji="📦") -> None:
        self.trees.append((title, list(items), emoji))

    def titled(self, title: str) -> list:
        return [tree for tree in self.trees if tree[0] == title]


@pytest.fixture()
def recorder(monkeypatch):
    rec = Recorder()
    monkeypatch.setattr(application, "TREE_LOG", rec)
    # A fresh dedupe window per test; the dict is process-global.
    application._recent_rejections.clear()
    return rec


DOC = {"version": application.DOC_VERSION, "lists": {}}


# --- rejected keys ---------------------------------------------------------------

def test_a_wrong_key_is_logged_once_with_the_reason(client, recorder) -> None:
    assert client.get(f"{BASE}/state", headers={"X-Sync-Key": "nope"}).status_code == 401
    assert client.get(f"{BASE}/state", headers={"X-Sync-Key": "nope"}).status_code == 401
    trees = recorder.titled("Auth Rejected")
    assert len(trees) == 1, "the second attempt from the same client on the same path is deduped"
    rows = dict(trees[0][1])
    assert rows["Reason"] == "wrong key"
    assert rows["Path"] == f"{BASE}/state"
    assert trees[0][2] == "⚠️", "a fault glyph, so it survives a queue trim"
    assert application.COUNTERS.peek()["rejected"] >= 2, "every attempt is counted even when not logged"


def test_a_missing_key_says_so(client, recorder) -> None:
    assert client.get(f"{BASE}/documents").status_code == 401
    assert dict(recorder.titled("Auth Rejected")[0][1])["Reason"] == "no key sent"


def test_the_client_is_a_tag_and_never_the_address(client, recorder) -> None:
    client.get(f"{BASE}/state", headers={"X-Sync-Key": "nope", "X-Real-IP": "203.0.113.9"})
    tag = dict(recorder.titled("Auth Rejected")[0][1])["Client"]
    assert "203.0.113.9" not in tag
    assert len(tag) == 10


def test_the_health_check_is_not_an_auth_event(client, recorder) -> None:
    assert client.get(f"{BASE}/health").status_code == 200
    assert recorder.trees == []


# --- restores and counts ---------------------------------------------------------

def test_a_server_side_restore_is_logged(client, recorder) -> None:
    assert client.put(f"{BASE}/state", json={"baseRevision": 0, "doc": DOC}, headers=AUTH).status_code == 200
    assert client.put(f"{BASE}/state", json={"baseRevision": 1, "doc": DOC}, headers=AUTH).status_code == 200
    response = client.post(f"{BASE}/state/restore", json={"baseRevision": 2, "revision": 1}, headers=AUTH)
    assert response.status_code == 200
    trees = recorder.titled("Revision Restored")
    assert len(trees) == 1
    rows = dict(trees[0][1])
    assert rows["From Revision"] == 1 and rows["New Revision"] == 3


def test_pushes_pulls_conflicts_and_log_lines_are_counted(client, recorder) -> None:
    before = application.COUNTERS.peek()
    client.get(f"{BASE}/state", headers=AUTH)
    client.put(f"{BASE}/state", json={"baseRevision": 0, "doc": DOC}, headers=AUTH)
    client.put(f"{BASE}/state", json={"baseRevision": 0, "doc": DOC}, headers=AUTH)  # stale: a conflict
    client.post(f"{BASE}/log", json={"title": "X", "items": []}, headers=AUTH)
    after = application.COUNTERS.peek()
    assert after["pulls"] - before["pulls"] == 1
    assert after["pushes"] - before["pushes"] == 1
    assert after["conflicts"] - before["conflicts"] == 1
    assert after["logs"] - before["logs"] == 1


# --- startup -----------------------------------------------------------------------

def test_serving_the_app_reports_the_store_once(db_path, recorder, monkeypatch) -> None:
    class NoDigest:
        started = False

        def start(self) -> None:
            self.started = True

    monkeypatch.setattr(application, "DIGEST", NoDigest())
    with TestClient(application.app) as served:
        assert served.get(f"{BASE}/health").status_code == 200
    trees = recorder.titled("Service Started")
    assert len(trees) == 1
    rows = dict(trees[0][1])
    assert rows["Revision"] == 0 and rows["Revisions Held"] == 0
    assert rows["Logging"] == "off", "the recorder is not enabled, and the line says so"
    assert application.DIGEST.started is False, "no webhook, no digest thread"


def test_the_digest_starts_only_when_logging_is_on(db_path, recorder, monkeypatch) -> None:
    class NoDigest:
        started = False

        def start(self) -> None:
            self.started = True

    recorder.enabled = True
    monkeypatch.setattr(application, "DIGEST", NoDigest())
    with TestClient(application.app):
        pass
    assert application.DIGEST.started is True


def test_the_store_snapshot_counts_what_is_held(client) -> None:
    client.put(f"{BASE}/state", json={"baseRevision": 0, "doc": DOC}, headers=AUTH)
    client.put(f"{BASE}/state", json={"baseRevision": 1, "doc": DOC}, headers=AUTH)
    snapshot = application._store_snapshot()
    assert snapshot["revision"] == 2
    assert snapshot["history"] == 2
    assert snapshot["db_bytes"] > 0


# --- the log's own circuit -----------------------------------------------------

def _wait_for(predicate, timeout_s: float = 8.0) -> None:
    deadline = time.monotonic() + timeout_s
    while not predicate():
        assert time.monotonic() < deadline, "timed out waiting for the drain thread"
        time.sleep(0.05)


def test_a_rate_limit_is_reported_when_the_circuit_closes_and_loses_nothing() -> None:
    posts: list[str] = []

    def post(url: str, content: str) -> int:
        posts.append(content)
        return 429 if len(posts) == 1 else 204

    logger = treelog.TreeLogger(
        webhook_url="https://example.invalid/x", post=post, circuit=treelog.Circuit(cooldown_s=0.0)
    )
    logger.log("First Thing", [("A", 1)])
    _wait_for(lambda: len(posts) >= 1)
    # Wake the drain; with a zero cooldown the circuit is already closed again.
    logger.log("Second Thing", [("B", 2)])
    _wait_for(lambda: len(posts) >= 2)
    second = posts[1]
    assert "Log Circuit Reset" in second
    assert "HTTP 429 from the webhook" in second
    assert "First Thing" in second, "the batch the 429 refused is re-sent, not lost"
    assert "Second Thing" in second
    assert second.index("Log Circuit Reset") < second.index("First Thing"), "the reset leads"
