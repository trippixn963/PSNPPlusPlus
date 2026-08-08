"""Shared fixtures for the PSNP++ sidecar tests.

Author: Trippixn
Server: discord.gg/syria
"""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

import app as app_module

KEY = "test-secret-key"
AUTH = {"X-Sync-Key": KEY}
BASE = "/api/psnppp"


@pytest.fixture()
def db_path(tmp_path, monkeypatch):
    """Point the app at a fresh database file and clear the per-path init memo.

    `_schema_ready_paths` is process-global and never shrinks, so a tmp_path
    reused across a session (or a test that deliberately re-runs cold start)
    could otherwise skip setup it needs. Discarding on both sides keeps every
    test's first connection a genuine cold start.
    """
    path = tmp_path / "state.db"
    monkeypatch.setenv("PSNP_SYNC_KEY", KEY)
    monkeypatch.setenv("PSNP_SYNC_DB", str(path))
    app_module._schema_ready_paths.discard(str(path))
    yield path
    app_module._schema_ready_paths.discard(str(path))


@pytest.fixture()
def client(db_path):
    # raise_server_exceptions=False so an unhandled exception surfaces as the
    # HTTP 500 a real client would see, instead of re-raising into the test.
    return TestClient(app_module.app, raise_server_exceptions=False)
